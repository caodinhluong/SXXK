"""SQLite database initialization and connection utilities."""
from __future__ import annotations
import json
import sqlite3
from contextlib import contextmanager
from functools import lru_cache
from pathlib import Path
from src.config.settings import settings


def get_db_path() -> Path:
    return settings.SQLITE_PATH


@contextmanager
def get_conn():
    conn = sqlite3.connect(str(get_db_path()), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db() -> None:
    """Create tables if they do not exist."""
    with get_conn() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS chat_sessions (
                id          TEXT PRIMARY KEY,
                user_id     TEXT NOT NULL,
                title       TEXT,
                created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now')),
                updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now'))
            );

            CREATE INDEX IF NOT EXISTS idx_sessions_user_updated
                ON chat_sessions(user_id, updated_at DESC);

            CREATE TABLE IF NOT EXISTS chat_messages (
                id                TEXT PRIMARY KEY,
                session_id        TEXT NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
                role              TEXT NOT NULL CHECK(role IN ('user','assistant')),
                content           TEXT NOT NULL,
                parent_message_id TEXT,
                revision_number   INTEGER NOT NULL DEFAULT 1,
                is_edited         INTEGER NOT NULL DEFAULT 0,
                metadata          TEXT,
                created_at        TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now'))
            );

            CREATE INDEX IF NOT EXISTS idx_messages_session_created
                ON chat_messages(session_id, created_at ASC);
        """)
