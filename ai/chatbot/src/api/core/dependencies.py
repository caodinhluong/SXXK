"""Auth dependencies: simple API key for admin, no auth for chat."""
from __future__ import annotations
import uuid
from dataclasses import dataclass
from fastapi import Header, HTTPException, status
from src.config.settings import settings

DEFAULT_USER_ID = "sxxk_default_user"


@dataclass(frozen=True)
class AuthContext:
    user_id: str
    api_key: str = ""


def normalize_uuid_or_400(raw_value: str, field_name: str) -> str:
    try:
        return str(uuid.UUID(raw_value))
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid {field_name}: '{raw_value}'",
        ) from exc


def get_default_auth() -> AuthContext:
    """All chat requests use the single default user (single-tenant)."""
    return AuthContext(user_id=DEFAULT_USER_ID)


async def require_api_key(
    x_chatbot_key: str | None = Header(default=None, alias="X-Chatbot-Key"),
) -> AuthContext:
    """Admin endpoints: require X-Chatbot-Key header."""
    if not x_chatbot_key or x_chatbot_key != settings.CHATBOT_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid X-Chatbot-Key header",
        )
    return AuthContext(user_id="sxxk_admin", api_key=x_chatbot_key)
