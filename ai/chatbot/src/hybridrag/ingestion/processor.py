"""Synchronous local-file ingestion processor. No Kafka, no MinIO."""
from __future__ import annotations
import asyncio
import io
import logging
import uuid
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Optional

logger = logging.getLogger(__name__)


@dataclass
class Chunk:
    file_id: str
    key: str
    text: str
    _chunk_id: str

    @property
    def chunk_id(self) -> str:
        return self._chunk_id


def _read_file(path: Path) -> Optional[str]:
    """Extract text from supported file types."""
    ext = path.suffix.lower()
    try:
        if ext in {".md", ".txt"}:
            return path.read_text(encoding="utf-8", errors="ignore")

        if ext == ".pdf":
            import pdfplumber
            text_parts = []
            with pdfplumber.open(str(path)) as pdf:
                for page in pdf.pages:
                    t = page.extract_text()
                    if t:
                        text_parts.append(t)
            return "\n\n".join(text_parts) if text_parts else None

        if ext in {".docx", ".doc"}:
            import docx2txt
            text = docx2txt.process(str(path))
            return text if text and text.strip() else None

    except Exception as exc:
        logger.warning("Failed to read %s: %s", path.name, exc)
    return None


def _make_chunk_id(file_id: str, key: str, index: int) -> str:
    return f"{file_id}__{key}__chunk_{index:06d}"


class SyncIngestionProcessor:
    """
    Synchronous ingestion processor that:
    1. Reads a local file
    2. Splits text into chunks
    3. Adds chunks to FAISS and BM25 indexes
    """

    def __init__(self, faiss_store=None, bm25_store=None):
        from src.hybridrag.ingestion.chunking.splitter import TextSplitter
        self.splitter = TextSplitter()
        self._faiss = faiss_store
        self._bm25 = bm25_store

    def _get_stores(self):
        """Lazy-load stores from runtime if not injected."""
        if self._faiss is None or self._bm25 is None:
            from src.api.core.runtime import get_hybrid_searcher
            searcher = get_hybrid_searcher()
            self._faiss = searcher.vector._store
            self._bm25 = searcher.bm25._store
        return self._faiss, self._bm25

    async def ingest_file(self, file_path: Path, key: str) -> dict[str, Any]:
        """Ingest a single file into FAISS and BM25 indexes."""
        text = await asyncio.to_thread(_read_file, file_path)
        if not text or not text.strip():
            return {
                "result": "skipped",
                "message": f'"{key}" rỗng hoặc không đọc được nội dung.',
                "chunks": 0,
            }

        file_id = str(uuid.uuid5(uuid.NAMESPACE_URL, f"sxxk/{key}"))
        parts = await asyncio.to_thread(self.splitter.split_text, text)
        chunks = [
            Chunk(file_id=file_id, key=key, text=part, _chunk_id=_make_chunk_id(file_id, key, i))
            for i, part in enumerate(parts)
        ]
        logger.info("Ingesting '%s' -> %d chunks", key, len(chunks))

        faiss_store, bm25_store = self._get_stores()

        # Add to FAISS (async - handles embeddings)
        if faiss_store is not None:
            await faiss_store.precompute_embeddings(chunks)
            await faiss_store.add_chunks(chunks)
        else:
            logger.warning("FAISS store not available, skipping vector index")

        # Add to BM25 (sync)
        if bm25_store is not None:
            await asyncio.to_thread(bm25_store.add_chunks, chunks)
        else:
            logger.warning("BM25 store not available, skipping keyword index")

        return {
            "result": "success",
            "message": f'"{key}" đã được lập chỉ mục thành công.',
            "chunks": len(chunks),
            "file_id": file_id,
        }

    def delete_key(self, key: str) -> dict[str, Any]:
        """Remove all index entries for a given key."""
        faiss_store, bm25_store = self._get_stores()
        removed_faiss = faiss_store.delete_by_key(key) if faiss_store is not None else 0
        removed_bm25 = bm25_store.delete_by_key(key) if bm25_store is not None else 0
        logger.info("Deleted key=%s: faiss=%d bm25=%d chunks removed", key, removed_faiss, removed_bm25)
        return {"result": "deleted", "key": key, "faiss_removed": removed_faiss, "bm25_removed": removed_bm25}
