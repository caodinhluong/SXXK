"""Chat session repository using SQLite."""
from __future__ import annotations
import uuid
from dataclasses import dataclass
from datetime import datetime
from typing import Optional
from src.api.core.db import get_conn


def _parse_dt(val: str | None) -> datetime:
    if not val:
        return datetime.utcnow()
    try:
        return datetime.fromisoformat(val)
    except ValueError:
        return datetime.utcnow()


@dataclass(frozen=True)
class ChatSession:
    id: str
    user_id: str
    title: Optional[str]
    created_at: datetime
    updated_at: datetime


class ChatSessionRepo:
    def __init__(self):
        pass

    @staticmethod
    def _row_to_session(row) -> ChatSession:
        return ChatSession(
            id=row["id"],
            user_id=row["user_id"],
            title=row["title"],
            created_at=_parse_dt(row["created_at"]),
            updated_at=_parse_dt(row["updated_at"]),
        )

    def create(self, user_id: str, title: Optional[str] = None) -> ChatSession:
        sid = str(uuid.uuid4())
        sql = """
        INSERT INTO chat_sessions (id, user_id, title)
        VALUES (?, ?, ?)
        """
        with get_conn() as conn:
            conn.execute(sql, (sid, user_id, title))
            row = conn.execute(
                "SELECT * FROM chat_sessions WHERE id = ?", (sid,)
            ).fetchone()
        return self._row_to_session(row)

    def get(self, session_id: str, user_id: Optional[str] = None) -> Optional[ChatSession]:
        if user_id:
            sql = "SELECT * FROM chat_sessions WHERE id = ? AND user_id = ?"
            params = (session_id, user_id)
        else:
            sql = "SELECT * FROM chat_sessions WHERE id = ?"
            params = (session_id,)
        with get_conn() as conn:
            row = conn.execute(sql, params).fetchone()
        return self._row_to_session(row) if row else None

    def list_by_user(
        self,
        user_id: str,
        *,
        limit: int = 50,
        offset: int = 0,
        title_query: Optional[str] = None,
    ) -> list[ChatSession]:
        if title_query:
            sql = """
            SELECT * FROM chat_sessions
            WHERE user_id = ? AND title LIKE ?
            ORDER BY updated_at DESC LIMIT ? OFFSET ?
            """
            params = (user_id, f"%{title_query}%", limit, offset)
        else:
            sql = """
            SELECT * FROM chat_sessions
            WHERE user_id = ?
            ORDER BY updated_at DESC LIMIT ? OFFSET ?
            """
            params = (user_id, limit, offset)
        with get_conn() as conn:
            rows = conn.execute(sql, params).fetchall()
        return [self._row_to_session(r) for r in rows]

    def rename(self, session_id: str, title: str, user_id: Optional[str] = None) -> bool:
        if user_id:
            sql = "UPDATE chat_sessions SET title = ? WHERE id = ? AND user_id = ?"
            params = (title, session_id, user_id)
        else:
            sql = "UPDATE chat_sessions SET title = ? WHERE id = ?"
            params = (title, session_id)
        with get_conn() as conn:
            cur = conn.execute(sql, params)
            return cur.rowcount > 0

    def touch(self, session_id: str) -> bool:
        sql = """
        UPDATE chat_sessions
        SET updated_at = strftime('%Y-%m-%dT%H:%M:%f', 'now')
        WHERE id = ?
        """
        with get_conn() as conn:
            cur = conn.execute(sql, (session_id,))
            return cur.rowcount > 0

    def delete(self, session_id: str, user_id: Optional[str] = None) -> bool:
        if user_id:
            sql = "DELETE FROM chat_sessions WHERE id = ? AND user_id = ?"
            params = (session_id, user_id)
        else:
            sql = "DELETE FROM chat_sessions WHERE id = ?"
            params = (session_id,)
        with get_conn() as conn:
            cur = conn.execute(sql, params)
            return cur.rowcount > 0
