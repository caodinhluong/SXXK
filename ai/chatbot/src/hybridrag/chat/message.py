"""Chat message repository using SQLite."""
from __future__ import annotations
import json
import uuid
from dataclasses import dataclass
from datetime import datetime
from typing import Any, Optional
from src.api.core.db import get_conn


def _parse_dt(val: str | None) -> datetime:
    if not val:
        return datetime.utcnow()
    try:
        return datetime.fromisoformat(val)
    except ValueError:
        return datetime.utcnow()


@dataclass(frozen=True)
class ChatMessage:
    id: str
    session_id: str
    role: str
    content: str
    parent_message_id: Optional[str]
    revision_number: int
    is_edited: bool
    metadata: Optional[dict[str, Any]]
    created_at: datetime


class ChatMessageRepo:
    def __init__(self):
        pass

    @staticmethod
    def _row_to_message(row) -> ChatMessage:
        meta = None
        if row["metadata"]:
            try:
                meta = json.loads(row["metadata"])
            except Exception:
                pass
        return ChatMessage(
            id=row["id"],
            session_id=row["session_id"],
            role=row["role"],
            content=row["content"],
            parent_message_id=row["parent_message_id"],
            revision_number=row["revision_number"],
            is_edited=bool(row["is_edited"]),
            metadata=meta,
            created_at=_parse_dt(row["created_at"]),
        )

    def create(
        self,
        session_id: str,
        role: str,
        content: str,
        *,
        parent_message_id: Optional[str] = None,
        revision_number: int = 1,
        is_edited: bool = False,
        metadata: Optional[dict[str, Any]] = None,
    ) -> ChatMessage:
        msg_id = str(uuid.uuid4())
        meta_str = json.dumps(metadata, ensure_ascii=False) if metadata is not None else None
        sql = """
        INSERT INTO chat_messages
            (id, session_id, role, content, parent_message_id,
             revision_number, is_edited, metadata)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """
        with get_conn() as conn:
            conn.execute(sql, (
                msg_id, session_id, role, content, parent_message_id,
                revision_number, int(is_edited), meta_str,
            ))
            row = conn.execute(
                "SELECT * FROM chat_messages WHERE id = ?", (msg_id,)
            ).fetchone()
        return self._row_to_message(row)

    def get(self, message_id: str) -> Optional[ChatMessage]:
        with get_conn() as conn:
            row = conn.execute(
                "SELECT * FROM chat_messages WHERE id = ?", (message_id,)
            ).fetchone()
        return self._row_to_message(row) if row else None

    def load_history(
        self,
        session_id: str,
        *,
        limit: int = 200,
        offset: int = 0,
        ascending: bool = True,
    ) -> list[ChatMessage]:
        order = "ASC" if ascending else "DESC"
        sql = f"""
        SELECT * FROM chat_messages
        WHERE session_id = ?
        ORDER BY created_at {order}
        LIMIT ? OFFSET ?
        """
        with get_conn() as conn:
            rows = conn.execute(sql, (session_id, limit, offset)).fetchall()
        return [self._row_to_message(r) for r in rows]

    def search(
        self,
        user_id: str,
        query: str,
        *,
        session_id: Optional[str] = None,
        limit: int = 20,
        offset: int = 0,
    ) -> list[ChatMessage]:
        if session_id:
            sql = """
            SELECT m.* FROM chat_messages m
            JOIN chat_sessions s ON s.id = m.session_id
            WHERE s.user_id = ? AND m.content LIKE ? AND m.session_id = ?
            ORDER BY m.created_at DESC LIMIT ? OFFSET ?
            """
            params = (user_id, f"%{query}%", session_id, limit, offset)
        else:
            sql = """
            SELECT m.* FROM chat_messages m
            JOIN chat_sessions s ON s.id = m.session_id
            WHERE s.user_id = ? AND m.content LIKE ?
            ORDER BY m.created_at DESC LIMIT ? OFFSET ?
            """
            params = (user_id, f"%{query}%", limit, offset)

        with get_conn() as conn:
            rows = conn.execute(sql, params).fetchall()
        return [self._row_to_message(r) for r in rows]

    def delete_by_session(self, session_id: str) -> int:
        with get_conn() as conn:
            cur = conn.execute(
                "DELETE FROM chat_messages WHERE session_id = ?", (session_id,)
            )
            return cur.rowcount
