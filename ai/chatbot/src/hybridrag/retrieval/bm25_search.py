from __future__ import annotations
import asyncio
import logging
from pathlib import Path
from typing import Any, Dict, List
from src.config.settings import settings
from src.hybridrag.ingestion.stores.bm25_store import BM25Store

log = logging.getLogger(__name__)


class BM25Searcher:
    def __init__(self) -> None:
        self._store: BM25Store | None = None
        self._lock: asyncio.Lock | None = None
        self._cache_file = Path(settings.BM25_CACHE_DIR) / "bm25.pkl"
        self._cache_signature: tuple | None = None

    def _get_lock(self) -> asyncio.Lock:
        if self._lock is None:
            self._lock = asyncio.Lock()
        return self._lock

    def _index_signature(self) -> tuple:
        try:
            stat = self._cache_file.stat()
        except FileNotFoundError:
            return (False, 0, 0)
        return (True, int(stat.st_mtime_ns), int(stat.st_size))

    def load_index(self, *, force: bool = False) -> None:
        signature = self._index_signature()
        if not force and self._store is not None and self._cache_signature == signature:
            return
        self._store = BM25Store(cache_dir=str(settings.BM25_CACHE_DIR))
        self._cache_signature = signature
        log.info("BM25Searcher: index loaded from %s", settings.BM25_CACHE_DIR)

    async def _ensure_loaded(self) -> None:
        signature = self._index_signature()
        if self._store is not None and self._cache_signature == signature:
            return
        async with self._get_lock():
            signature = self._index_signature()
            if self._store is None or self._cache_signature != signature:
                self.load_index(force=True)

    async def search(
        self,
        query: str,
        top_k: int | None = None,
        timeout: float = 3.0,
    ) -> List[Dict[str, Any]]:
        await self._ensure_loaded()
        k = top_k or settings.ELASTIC_SEARCH_K
        store = self._store
        if store is None:
            raise RuntimeError("BM25 index not loaded. Call load_index() first.")

        loop = asyncio.get_running_loop()
        raw: List[Dict] = await asyncio.wait_for(
            loop.run_in_executor(None, store.search, query, k), timeout=timeout
        )
        return [
            {
                "chunk_id":   r["chunk_id"],
                "file_id":    r.get("file_id", ""),
                "key":        r.get("key", ""),
                "content":    r["text"],
                "bm25_score": float(r["score"]),
            }
            for r in raw
        ]
