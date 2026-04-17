from __future__ import annotations
import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.api.core.db import init_db
from src.api.core.runtime import warm_up_runtime
from src.api.routers.chat import router as chat_router
from src.api.routers.files import router as files_router
from src.api.routers.health import router as health_router
from src.config.settings import settings

log = logging.getLogger(__name__)


class _HealthLogFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        try:
            msg = record.getMessage()
        except Exception:
            return True
        return "GET /api/v1/health/live" not in msg


logging.getLogger("uvicorn.access").addFilter(_HealthLogFilter())


@asynccontextmanager
async def lifespan(_: FastAPI):
    try:
        await asyncio.to_thread(init_db)
        log.info("SQLite DB initialized")
    except Exception:
        log.exception("DB init failed")
        raise

    try:
        await asyncio.to_thread(warm_up_runtime)
        log.info("Runtime warm-up completed")
    except Exception:
        log.exception("Runtime warm-up failed (indexes may be empty)")

    yield


app = FastAPI(
    title="SXXK Chatbot API",
    version="1.0.0",
    description="Trợ lý hỗ trợ hướng dẫn sử dụng hệ thống quản lý xuất nhập khẩu",
    lifespan=lifespan,
)

# CORS
origins = [o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(chat_router)
app.include_router(files_router)


@app.get("/", tags=["root"])
async def root():
    return {"message": "SXXK Chatbot API đang hoạt động", "docs": "/docs"}

# uvicorn src.api.app:app --host 0.0.0.0 --port 8000 --reload
