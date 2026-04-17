from __future__ import annotations
import asyncio
import json
import time
from datetime import datetime
from typing import Any, Literal
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from src.api.core.dependencies import AuthContext, get_default_auth, normalize_uuid_or_400
from src.api.core.runtime import (
    compact_sources,
    get_answer_generator,
    get_hybrid_searcher,
    get_keyword_router,
    get_router_type,
    get_semantic_router,
    stream_chitchat_answer,
)
from src.config.settings import settings
from src.hybridrag.chat.message import ChatMessage, ChatMessageRepo
from src.hybridrag.chat.session import ChatSession, ChatSessionRepo
from src.hybridrag.rewriter import query_reflection

router = APIRouter(prefix="/api/v1/chat", tags=["chat"])
CHAT_HISTORY_LIMIT = 200
UNTITLED_SESSION_TITLE = "Cuộc trò chuyện mới"
SESSION_TITLE_MAX_LENGTH = 120
EMPTY_ANSWER_FALLBACK = "Xin lỗi, hệ thống chưa tạo được câu trả lời, vui lòng thử lại."
SearchMode = Literal["hybrid"]


def _normalize_search_mode(raw_mode: str | None) -> SearchMode:
    value = (raw_mode or "hybrid").strip().lower()
    if value == "hybrid":
        return "hybrid"
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Only search_mode='hybrid' is supported",
    )


async def _retrieve_docs(query: str) -> list[dict[str, Any]]:
    searcher = get_hybrid_searcher()
    return await searcher.search(
        query=query,
        vector_k=settings.VECTOR_SEARCH_K,
        bm25_k=settings.ELASTIC_SEARCH_K,
        fusion_top_n=settings.FUSION_K,
        use_reranker=settings.USE_RERANKER,
        rerank_top_k=settings.RERANK_TOP_K,
    )


async def _route_query(query: str) -> tuple[float, str]:
    router_type = get_router_type()
    if router_type == "semantic":
        return await get_semantic_router().guide(query)
    score, route_name = get_keyword_router().guide(query)
    return float(score), route_name


def _assert_openai_key() -> None:
    if not settings.OPENAI_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="OPENAI_API_KEY chưa được cấu hình",
        )


def _build_session_title(question: str, max_length: int = SESSION_TITLE_MAX_LENGTH) -> str:
    compact = " ".join(question.strip().split())
    if not compact:
        return UNTITLED_SESSION_TITLE
    if len(compact) <= max_length:
        return compact
    return f"{compact[:max_length - 3].rstrip()}..."


def _normalize_answer(answer_text: str) -> str:
    normalized = answer_text.strip()
    return normalized or EMPTY_ANSWER_FALLBACK


def _to_rewriter_history(messages: list[ChatMessage]) -> list[dict[str, str]]:
    history = []
    for msg in messages:
        content = msg.content.strip()
        if content and msg.role in {"user", "assistant"}:
            history.append({"role": msg.role, "content": content})
    return history


def _sse(event: str, payload: dict[str, Any]) -> str:
    return f"event: {event}\ndata: {json.dumps(payload, ensure_ascii=False)}\n\n"


# ---------- Pydantic models ----------

class CreateSessionRequest(BaseModel):
    title: str | None = Field(default=None, max_length=500)


class RenameSessionRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)


class ChatSessionResponse(BaseModel):
    id: str
    title: str | None
    created_at: datetime
    updated_at: datetime


class ChatMessageResponse(BaseModel):
    id: str
    session_id: str
    role: str
    content: str
    metadata: dict[str, Any] | None = None
    created_at: datetime


class ChatSessionsListResponse(BaseModel):
    items: list[ChatSessionResponse]


class ChatMessagesListResponse(BaseModel):
    items: list[ChatMessageResponse]


class ChatAnswerRequest(BaseModel):
    session_id: str | None = None
    question: str = Field(..., min_length=1, max_length=4000)
    search_mode: str = "hybrid"


class ChatAnswerResponse(BaseModel):
    session_id: str
    question: str
    search_mode: str
    rewritten_query: str
    route_name: str
    route_score: float
    answer: str
    retrieved_count: int
    sources: list[str]


# ---------- Helpers ----------

def _session_to_response(s: ChatSession) -> ChatSessionResponse:
    return ChatSessionResponse(
        id=s.id, title=s.title, created_at=s.created_at, updated_at=s.updated_at
    )


def _message_to_response(m: ChatMessage) -> ChatMessageResponse:
    return ChatMessageResponse(
        id=m.id, session_id=m.session_id, role=m.role,
        content=m.content, metadata=m.metadata, created_at=m.created_at,
    )


async def _get_owned_session_or_404(
    *, session_repo: ChatSessionRepo, user_id: str, raw_session_id: str
) -> ChatSession:
    session_id = normalize_uuid_or_400(raw_session_id, "session_id")
    session = await asyncio.to_thread(session_repo.get, session_id, user_id)
    if session is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    return session


async def _resolve_answer_session(
    *, session_repo: ChatSessionRepo, user_id: str,
    raw_session_id: str | None, question: str,
) -> ChatSession:
    normalized = (raw_session_id or "").strip()
    if not normalized:
        title = _build_session_title(question)
        return await asyncio.to_thread(session_repo.create, user_id, title)
    session = await _get_owned_session_or_404(
        session_repo=session_repo, user_id=user_id, raw_session_id=normalized
    )
    # Set title from first question if untitled
    if not (session.title or "").strip():
        title = _build_session_title(question)
        await asyncio.to_thread(session_repo.rename, session.id, title, user_id)
    return session


# ---------- Session endpoints ----------

@router.post("/sessions", response_model=ChatSessionResponse, status_code=201)
async def create_chat_session(
    payload: CreateSessionRequest,
    auth: AuthContext = Depends(get_default_auth),
) -> ChatSessionResponse:
    title = (payload.title or "").strip() or None
    repo = ChatSessionRepo()
    session = await asyncio.to_thread(repo.create, auth.user_id, title)
    return _session_to_response(session)


@router.get("/sessions", response_model=ChatSessionsListResponse)
async def list_chat_sessions(
    auth: AuthContext = Depends(get_default_auth),
) -> ChatSessionsListResponse:
    repo = ChatSessionRepo()
    sessions = await asyncio.to_thread(repo.list_by_user, auth.user_id, limit=50, offset=0)
    return ChatSessionsListResponse(items=[_session_to_response(s) for s in sessions])


@router.patch("/sessions/{session_id}", response_model=ChatSessionResponse)
async def rename_chat_session(
    session_id: str,
    payload: RenameSessionRequest,
    auth: AuthContext = Depends(get_default_auth),
) -> ChatSessionResponse:
    title = payload.title.strip()
    if not title:
        raise HTTPException(status_code=400, detail="title must not be empty")
    repo = ChatSessionRepo()
    session = await _get_owned_session_or_404(
        session_repo=repo, user_id=auth.user_id, raw_session_id=session_id
    )
    await asyncio.to_thread(repo.rename, session.id, title, auth.user_id)
    updated = await asyncio.to_thread(repo.get, session.id, auth.user_id)
    if updated is None:
        raise HTTPException(status_code=404, detail="Session not found")
    return _session_to_response(updated)


@router.delete("/sessions/{session_id}", status_code=204)
async def delete_chat_session(
    session_id: str,
    auth: AuthContext = Depends(get_default_auth),
) -> Response:
    repo = ChatSessionRepo()
    sid = normalize_uuid_or_400(session_id, "session_id")
    deleted = await asyncio.to_thread(repo.delete, sid, auth.user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Session not found")
    return Response(status_code=204)


@router.get("/sessions/{session_id}/messages", response_model=ChatMessagesListResponse)
async def get_session_messages(
    session_id: str,
    auth: AuthContext = Depends(get_default_auth),
) -> ChatMessagesListResponse:
    srepo = ChatSessionRepo()
    mrepo = ChatMessageRepo()
    session = await _get_owned_session_or_404(
        session_repo=srepo, user_id=auth.user_id, raw_session_id=session_id
    )
    history = await asyncio.to_thread(
        mrepo.load_history, session.id, limit=CHAT_HISTORY_LIMIT, offset=0, ascending=True
    )
    return ChatMessagesListResponse(items=[_message_to_response(m) for m in history])


# ---------- Answer endpoints ----------

@router.post("/answer", response_model=ChatAnswerResponse)
async def chat_answer(
    payload: ChatAnswerRequest,
    auth: AuthContext = Depends(get_default_auth),
) -> ChatAnswerResponse:
    _assert_openai_key()
    question = payload.question.strip()
    search_mode = _normalize_search_mode(payload.search_mode)
    if not question:
        raise HTTPException(status_code=400, detail="question must not be empty")

    srepo = ChatSessionRepo()
    mrepo = ChatMessageRepo()
    session = await _resolve_answer_session(
        session_repo=srepo, user_id=auth.user_id,
        raw_session_id=payload.session_id, question=question,
    )

    stored = await asyncio.to_thread(
        mrepo.load_history, session.id, limit=CHAT_HISTORY_LIMIT, offset=0, ascending=True
    )
    chat_history = _to_rewriter_history(stored)
    await asyncio.to_thread(
        mrepo.create, session.id, "user", question,
        metadata={"type": "question", "search_mode": search_mode},
    )

    rewrite_t0 = time.perf_counter()
    rewritten_query = await query_reflection.reflect(question, chat_history)
    rewrite_ms = (time.perf_counter() - rewrite_t0) * 1000

    route_t0 = time.perf_counter()
    route_score, route_name = await _route_query(rewritten_query)
    route_ms = (time.perf_counter() - route_t0) * 1000

    answer_text = ""
    retrieved_docs: list[dict[str, Any]] = []
    search_ms = 0.0
    gen_t0 = time.perf_counter()

    if route_name == "chitchat":
        parts: list[str] = []
        async for piece in stream_chitchat_answer(rewritten_query, chat_history=chat_history):
            parts.append(piece)
        answer_text = "".join(parts).strip()
    else:
        search_t0 = time.perf_counter()
        retrieved_docs = await _retrieve_docs(rewritten_query)
        search_ms = (time.perf_counter() - search_t0) * 1000
        generator = get_answer_generator()
        answer_text = (await generator.answer_text(
            query=rewritten_query, retrieved_docs=retrieved_docs
        )).strip()

    answer_text = _normalize_answer(answer_text)
    gen_ms = (time.perf_counter() - gen_t0) * 1000
    sources = compact_sources(retrieved_docs)

    metadata: dict[str, Any] = {
        "type": "answer", "route": route_name, "search_mode": search_mode,
        "rewrite_ms": round(rewrite_ms, 2), "route_ms": round(route_ms, 2),
        "generate_ms": round(gen_ms, 2),
    }
    if route_name != "chitchat":
        metadata.update({"n_retrieved": len(retrieved_docs), "sources": sources,
                         "search_ms": round(search_ms, 2)})

    await asyncio.to_thread(mrepo.create, session.id, "assistant", answer_text, metadata=metadata)
    await asyncio.to_thread(srepo.touch, session.id)

    return ChatAnswerResponse(
        session_id=session.id, question=question, search_mode=search_mode,
        rewritten_query=rewritten_query, route_name=route_name, route_score=route_score,
        answer=answer_text, retrieved_count=len(retrieved_docs), sources=sources,
    )


@router.post("/answer/stream")
async def chat_answer_stream(
    payload: ChatAnswerRequest,
    auth: AuthContext = Depends(get_default_auth),
) -> StreamingResponse:
    _assert_openai_key()
    question = payload.question.strip()
    search_mode = _normalize_search_mode(payload.search_mode)
    if not question:
        raise HTTPException(status_code=400, detail="question must not be empty")

    srepo = ChatSessionRepo()
    mrepo = ChatMessageRepo()
    session = await _resolve_answer_session(
        session_repo=srepo, user_id=auth.user_id,
        raw_session_id=payload.session_id, question=question,
    )

    async def event_stream():
        answer_parts: list[str] = []
        retrieved_docs: list[dict[str, Any]] = []
        route_name = "pending"
        route_score = 0.0

        try:
            yield _sse("start", {"session_id": session.id, "question": question, "search_mode": search_mode})

            stored = await asyncio.to_thread(
                mrepo.load_history, session.id, limit=CHAT_HISTORY_LIMIT, offset=0, ascending=True
            )
            chat_history = _to_rewriter_history(stored)
            await asyncio.to_thread(
                mrepo.create, session.id, "user", question,
                metadata={"type": "question", "search_mode": search_mode},
            )

            rewritten_query = await query_reflection.reflect(question, chat_history)
            route_score, route_name = await _route_query(rewritten_query)
            if route_name != "chitchat":
                retrieved_docs = await _retrieve_docs(rewritten_query)

            yield _sse("meta", {
                "session_id": session.id, "question": question,
                "rewritten_query": rewritten_query, "route_name": route_name,
                "route_score": route_score, "search_mode": search_mode,
                "retrieved_count": len(retrieved_docs),
            })

            if route_name == "chitchat":
                async for piece in stream_chitchat_answer(rewritten_query, chat_history=chat_history):
                    answer_parts.append(piece)
                    yield _sse("chunk", {"content": piece})
            else:
                generator = get_answer_generator()
                async for piece in generator.stream_answer(
                    query=rewritten_query, retrieved_docs=retrieved_docs
                ):
                    answer_parts.append(piece)
                    yield _sse("chunk", {"content": piece})

            answer_text = _normalize_answer("".join(answer_parts))
            sources = compact_sources(retrieved_docs)
            await asyncio.to_thread(
                mrepo.create, session.id, "assistant", answer_text,
                metadata={"type": "answer", "route": route_name, "sources": sources,
                          "n_retrieved": len(retrieved_docs)},
            )
            await asyncio.to_thread(srepo.touch, session.id)
            yield _sse("done", {
                "session_id": session.id, "route_name": route_name,
                "answer": answer_text, "sources": sources,
            })
        except Exception as exc:
            yield _sse("error", {"message": str(exc)})

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive", "X-Accel-Buffering": "no"},
    )
