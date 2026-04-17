from fastapi import APIRouter
from src.config.settings import settings

router = APIRouter(prefix="/api/v1/health", tags=["health"])


@router.get("/live")
async def health_live() -> dict:
    return {"status": "ok"}


@router.get("/ready")
async def health_ready() -> dict:
    checks: dict = {}

    # Check FAISS index
    try:
        from pathlib import Path
        faiss_file = Path(settings.FAISS_CACHE_DIR) / "index.faiss"
        checks["faiss_index"] = "ready" if faiss_file.exists() else "empty"
    except Exception as e:
        checks["faiss_index"] = f"error: {e}"

    # Check BM25 index
    try:
        from pathlib import Path
        bm25_file = Path(settings.BM25_CACHE_DIR) / "bm25.pkl"
        checks["bm25_index"] = "ready" if bm25_file.exists() else "empty"
    except Exception as e:
        checks["bm25_index"] = f"error: {e}"

    # Check SQLite
    try:
        from src.api.core.db import get_conn
        with get_conn() as conn:
            conn.execute("SELECT 1")
        checks["database"] = "ready"
    except Exception as e:
        checks["database"] = f"error: {e}"

    # Check OpenAI key
    checks["openai_key"] = "configured" if settings.OPENAI_API_KEY else "missing"

    overall = "ready" if all("error" not in str(v) and v != "missing" for v in checks.values()) else "degraded"
    return {"status": overall, "checks": checks}
