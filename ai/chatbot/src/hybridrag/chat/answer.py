from __future__ import annotations
import re
from typing import Any, AsyncIterator, Dict, List, Optional
from openai import AsyncOpenAI
from src.config.prompts import get_prompt
from src.config.settings import settings


class AnswerGenerator:
    def __init__(self) -> None:
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    @staticmethod
    def _basename(path_like: str) -> str:
        cleaned = path_like.strip()
        if not cleaned:
            return ""
        cleaned = cleaned.split("?", 1)[0].split("#", 1)[0]
        parts = re.split(r"[\\/]+", cleaned)
        return parts[-1].strip() if parts and parts[-1].strip() else cleaned

    @staticmethod
    def _get_source_name(doc: Dict[str, Any], fallback_index: int) -> str:
        key_value = doc.get("key")
        if isinstance(key_value, str) and key_value.strip():
            return AnswerGenerator._basename(key_value)
        for key in ("source", "title", "document", "doc_id", "id"):
            value = doc.get(key)
            if isinstance(value, str) and value.strip():
                return AnswerGenerator._basename(value)
        return f"Source-{fallback_index}"

    @staticmethod
    def _get_content(doc: Dict[str, Any]) -> str:
        for key in ("content", "text", "chunk", "document"):
            value = doc.get(key)
            if isinstance(value, str) and value.strip():
                return value.strip()
        return ""

    def build_context(
        self,
        docs: List[Dict[str, Any]],
        *,
        max_docs: int = 6,
        max_chars_per_doc: int = 1500,
    ) -> str:
        lines: List[str] = []
        seen_content: set[str] = set()
        kept = 0
        for i, doc in enumerate(docs, start=1):
            if kept >= max_docs:
                break
            content = self._get_content(doc)
            if not content:
                continue
            # Dedup by content fingerprint (first 120 chars), not by source name
            # so multiple chunks from the same file are all included
            fingerprint = content[:120]
            if fingerprint in seen_content:
                continue
            seen_content.add(fingerprint)
            source_name = self._get_source_name(doc, i)
            kept += 1
            lines.append(f"[{kept}] {source_name}\n{content[:max_chars_per_doc]}")
        return "\n\n".join(lines)

    async def stream_answer(
        self,
        *,
        query: str,
        retrieved_docs: List[Dict[str, Any]],
        timeout: float = 30.0,
        max_docs: int = 6,
        max_chars_per_doc: int = 1500,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
    ) -> AsyncIterator[str]:
        context = self.build_context(retrieved_docs, max_docs=max_docs, max_chars_per_doc=max_chars_per_doc)
        prompt = get_prompt("answer_generation_rag", context=context, query=query)
        stream = await self.client.chat.completions.create(
            model=settings.GENERATE_MODEL,
            messages=[
                {"role": "system", "content": "Bạn là trợ lý hỗ trợ hệ thống xuất nhập khẩu SXXK."},
                {"role": "user", "content": prompt},
            ],
            temperature=(temperature if temperature is not None else settings.TEMPERATURE_MAIN),
            max_tokens=(max_tokens if max_tokens is not None else settings.MAX_GEN_MAIN),
            stream=True,
            timeout=timeout,
        )
        async for chunk in stream:
            if not chunk.choices:
                continue
            delta = chunk.choices[0].delta
            if not delta or not delta.content:
                continue
            yield delta.content

    async def answer_text(
        self,
        *,
        query: str,
        retrieved_docs: List[Dict[str, Any]],
        timeout: float = 30.0,
        **kwargs,
    ) -> str:
        chunks: List[str] = []
        async for piece in self.stream_answer(
            query=query, retrieved_docs=retrieved_docs, timeout=timeout, **kwargs
        ):
            chunks.append(piece)
        return "".join(chunks)


__all__ = ["AnswerGenerator"]
