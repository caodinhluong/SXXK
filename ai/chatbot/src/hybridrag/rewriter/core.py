from __future__ import annotations
import asyncio
import hashlib
import logging
import re
import time
import unicodedata
from typing import Dict, List, Optional
from openai import AsyncOpenAI
from cachetools import TTLCache
from src.config.prompts import get_prompt
from src.config.settings import settings
from src.hybridrag.utils.metrics import count_tokens, truncate_text

log = logging.getLogger(__name__)


class QueryReflection:
    def __init__(self) -> None:
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY, max_retries=0)
        self._cache_size: int = max(0, int(settings.REWRITER_CACHE_SIZE))
        self._cache_ttl_seconds: int = max(0, int(getattr(settings, "REWRITER_CACHE_TTL_SECONDS", 86400)))
        self._k_rewrite: int = max(1, int(getattr(settings, "K_REWRITE", 5)))
        self._max_history_tokens: int = max(0, int(getattr(settings, "MAX_HISTORY_TOKENS_REWRITE", 200)))
        self._max_history_chars: int = int(getattr(settings, "MAX_HISTORY_CHARS_REWRITE", 1200))
        self._rewriter_model: str = str(getattr(settings, "REWRITER_MODEL", settings.GENERATE_MODEL))
        self._temperature: float = min(float(settings.TEMPERATURE_REWRITER), 0.2)
        self._max_output_tokens: int = int(getattr(settings, "MAX_REWRITE_OUTPUT_TOKENS", 56))
        self._timeout: float = float(getattr(settings, "REWRITER_TIMEOUT", 1.8))
        self._emoji_pattern = re.compile(
            "[\U0001F1E6-\U0001F1FF\U0001F300-\U0001FAFF\U00002600-\U000027BF\U00002300-\U000023FF]+",
            flags=re.UNICODE,
        )
        self._small_talk_short_queries = {
            "xin chao", "chao", "hello", "hi", "alo", "cam on", "thanks", "ok", "oke", "bye",
        }
        self._cache_enabled: bool = self._cache_size > 0 and self._cache_ttl_seconds > 0
        self._cache: TTLCache[str, str] | None = (
            TTLCache(maxsize=self._cache_size, ttl=self._cache_ttl_seconds) if self._cache_enabled else None
        )
        self._cache_lock = asyncio.Lock()
        self._inflight: Dict[str, asyncio.Future[str]] = {}
        self._inflight_lock = asyncio.Lock()

    def _make_cache_key(self, current_query: str, recent_queries: List[str]) -> str:
        raw = f"{current_query.strip()}\x00\x00" + "\x00".join(q.strip() for q in recent_queries)
        return hashlib.md5(raw.encode()).hexdigest()

    def _normalize_for_smalltalk(self, text: str) -> str:
        lowered = text.lower()
        no_emoji = self._emoji_pattern.sub(" ", lowered)
        nfd = unicodedata.normalize("NFD", no_emoji)
        no_accent = "".join(ch for ch in nfd if unicodedata.category(ch) != "Mn")
        no_punct = re.sub(r"[^\w\s]", " ", no_accent)
        return re.sub(r"\s+", " ", no_punct).strip()

    async def _cache_get(self, key: str) -> Optional[str]:
        if not self._cache_enabled or self._cache is None:
            return None
        async with self._cache_lock:
            try:
                return self._cache[key]
            except KeyError:
                return None

    async def _cache_set(self, key: str, value: str) -> None:
        if not self._cache_enabled or self._cache is None:
            return
        async with self._cache_lock:
            self._cache[key] = value

    def _safe_count_tokens(self, text: str) -> int:
        try:
            return count_tokens(text, model=self._rewriter_model)
        except Exception:
            return len(re.findall(r"\w+", text))

    def _format_query_history(self, messages: List[Dict[str, str]]) -> str:
        """Format full conversation turns (user+assistant) as readable history."""
        if not messages:
            return "Không có lịch sử hội thoại."
        lines: List[str] = []
        for msg in messages:
            role = msg.get("role", "")
            content = (msg.get("content") or "").strip()
            if not content:
                continue
            # Truncate long assistant answers to save tokens
            if role == "assistant" and len(content) > 300:
                content = content[:300] + "..."
            label = "Người dùng" if role == "user" else "Trợ lý"
            lines.append(f"{label}: {content}")
        return "\n".join(lines)

    def _get_recent_messages(
        self, chat_history: List[Dict[str, str]], current_query: Optional[str] = None
    ) -> List[Dict[str, str]]:
        """Return recent conversation turns (user + assistant) for rewriter context."""
        # Take last k_rewrite pairs (user + assistant)
        max_turns = max(2, self._k_rewrite)
        recent = [
            m for m in chat_history
            if m.get("role") in {"user", "assistant"} and (m.get("content") or "").strip()
        ]
        # Remove current query if it appears as last user msg (not yet saved)
        if current_query and recent and recent[-1].get("role") == "user":
            if recent[-1].get("content", "").strip() == current_query.strip():
                recent = recent[:-1]
        # Keep last max_turns * 2 messages (each turn = 1 user + 1 assistant)
        return recent[-(max_turns * 2):]

    # Keep old method name as alias for backward compat
    def _get_recent_user_queries(
        self, chat_history: List[Dict[str, str]], current_query: Optional[str] = None
    ) -> List[str]:
        msgs = self._get_recent_messages(chat_history, current_query)
        return [m["content"] for m in msgs if m.get("role") == "user"]

    def _normalize_rewrite_output(self, raw_output: str, current_query: str) -> str:
        if not raw_output:
            return current_query
        lines = [l.strip() for l in raw_output.strip().splitlines() if l.strip()]
        if not lines:
            return current_query
        candidate = re.sub(r"^[-*+\d\.\)\s]+", "", lines[0]).strip()
        candidate = candidate.strip("`").strip('"').strip("'")
        if not candidate:
            return current_query
        if ":" in candidate:
            prefix, remainder = candidate.split(":", 1)
            if prefix.strip().lower() in {"rewrite", "rewritten question", "rewritten", "output",
                                           "cau hoi viet lai", "cau hoi"}:
                candidate = remainder.strip()
        if not candidate:
            return current_query
        if len(candidate) > max(180, len(current_query) * 4):
            return current_query
        return candidate

    async def _call_rewriter(self, current_query: str, recent_messages: List[Dict[str, str]], cache_key: str) -> str:
        query_history_string = self._format_query_history(recent_messages)
        if len(query_history_string) > self._max_history_chars:
            query_history_string = query_history_string[-self._max_history_chars:]
        result = current_query
        t0 = time.perf_counter()
        try:
            prompt = get_prompt(
                "query_reflection",
                query_history=query_history_string,
                current_query=current_query,
            )
            response = await asyncio.wait_for(
                self.client.chat.completions.create(
                    model=self._rewriter_model,
                    messages=[
                        {"role": "system", "content": "Bạn viết lại câu hỏi phụ thuộc ngữ cảnh."},
                        {"role": "user", "content": prompt},
                    ],
                    temperature=self._temperature,
                    max_tokens=self._max_output_tokens,
                ),
                timeout=self._timeout,
            )
            result = self._normalize_rewrite_output(
                response.choices[0].message.content or "", current_query=current_query
            )
            if result != current_query:
                await self._cache_set(cache_key, result)
        except asyncio.TimeoutError:
            log.warning("QueryReflection timed out (%.1f ms)", (time.perf_counter() - t0) * 1000)
        except Exception as exc:
            log.warning("QueryReflection error: %s", exc)
        return result

    async def reflect(self, current_query: str, chat_history: List[Dict[str, str]]) -> str:
        recent_messages = self._get_recent_messages(chat_history, current_query=current_query)
        if not recent_messages:
            return current_query
        query_text = current_query.strip()
        if not query_text:
            return current_query
        normalized = self._normalize_for_smalltalk(query_text)
        if normalized in self._small_talk_short_queries:
            return current_query

        recent_user_queries = [m["content"] for m in recent_messages if m.get("role") == "user"]
        cache_key = self._make_cache_key(current_query, recent_user_queries)
        cached = await self._cache_get(cache_key)
        if cached is not None:
            return cached

        loop = asyncio.get_running_loop()
        async with self._inflight_lock:
            in_flight = self._inflight.get(cache_key)
            if in_flight is None:
                in_flight = loop.create_future()
                self._inflight[cache_key] = in_flight
                is_leader = True
            else:
                is_leader = False

        if not is_leader:
            return await in_flight

        result = current_query
        try:
            result = await self._call_rewriter(current_query, recent_messages, cache_key)
        finally:
            if not in_flight.done():
                in_flight.set_result(result)
            async with self._inflight_lock:
                self._inflight.pop(cache_key, None)
        return result


query_reflection = QueryReflection()
