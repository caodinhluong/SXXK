"""Simplified file management: local storage + sync ingestion. No MinIO/Kafka."""
from __future__ import annotations
import asyncio
import io
import logging
import mimetypes
import os
import time
import uuid
from datetime import datetime
from pathlib import Path
from typing import Any
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel
from src.api.core.dependencies import AuthContext, require_api_key
from src.api.core.runtime import get_hybrid_searcher
from src.config.settings import settings
from src.hybridrag.ingestion.processor import SyncIngestionProcessor

router = APIRouter(prefix="/api/v1/files", tags=["files"])
logger = logging.getLogger(__name__)

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".doc", ".md", ".txt"}


class FileItem(BaseModel):
    name: str
    size_bytes: int
    status: str
    indexed: bool
    uploaded_at: str


class FilesListResponse(BaseModel):
    items: list[FileItem]


class FileActionResponse(BaseModel):
    name: str
    action: str
    message: str
    chunks: int | None = None


def _get_processor() -> SyncIngestionProcessor:
    searcher = get_hybrid_searcher()
    return SyncIngestionProcessor(
        faiss_store=searcher.vector._store,
        bm25_store=searcher.bm25._store,
    )


def _safe_filename(filename: str) -> str:
    name = Path(filename).name
    name = "".join(c for c in name if c.isalnum() or c in "._- ()")
    return name or f"file_{uuid.uuid4().hex[:8]}"


def _ext_allowed(filename: str) -> bool:
    return Path(filename).suffix.lower() in ALLOWED_EXTENSIONS


def _list_document_files() -> list[dict[str, Any]]:
    doc_dir = settings.DOCUMENTS_DIR
    items = []
    if not doc_dir.exists():
        return items
    for f in sorted(doc_dir.iterdir()):
        if f.is_file() and not f.name.startswith("."):
            items.append({
                "name": f.name,
                "size_bytes": f.stat().st_size,
                "mtime": f.stat().st_mtime,
            })
    return items


def _is_indexed(filename: str) -> bool:
    """Check if a file has been indexed in FAISS/BM25."""
    try:
        searcher = get_hybrid_searcher()
        if searcher.bm25._store is not None:
            return searcher.bm25._store.has_key(filename)
        return False
    except Exception:
        return False


# ---------- Endpoints ----------

@router.get("", response_model=FilesListResponse)
async def list_files(
    auth: AuthContext = Depends(require_api_key),
) -> FilesListResponse:
    files = await asyncio.to_thread(_list_document_files)
    items = []
    for f in files:
        indexed = await asyncio.to_thread(_is_indexed, f["name"])
        mtime = datetime.fromtimestamp(f["mtime"]).isoformat()
        items.append(FileItem(
            name=f["name"],
            size_bytes=f["size_bytes"],
            status="indexed" if indexed else "uploaded",
            indexed=indexed,
            uploaded_at=mtime,
        ))
    return FilesListResponse(items=items)


@router.post("/upload", response_model=FileActionResponse, status_code=202)
async def upload_and_index_file(
    file: UploadFile = File(...),
    auth: AuthContext = Depends(require_api_key),
) -> FileActionResponse:
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename is required")

    safe_name = _safe_filename(file.filename)
    if not _ext_allowed(safe_name):
        raise HTTPException(
            status_code=400,
            detail=f"File type not supported. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    dest = settings.DOCUMENTS_DIR / safe_name
    await asyncio.to_thread(dest.write_bytes, data)

    try:
        processor = _get_processor()
        result = await processor.ingest_file(dest, key=safe_name)
        # Reload indexes so new data is immediately searchable
        get_hybrid_searcher().load_indexes()
        return FileActionResponse(
            name=safe_name,
            action="uploaded_and_indexed",
            message=f'File "{safe_name}" đã được tải lên và lập chỉ mục thành công.',
            chunks=result.get("chunks"),
        )
    except Exception as exc:
        logger.exception("Ingestion failed for %s", safe_name)
        raise HTTPException(status_code=500, detail=f"Lập chỉ mục thất bại: {exc}") from exc


@router.post("/reindex/{filename}", response_model=FileActionResponse, status_code=202)
async def reindex_file(
    filename: str,
    auth: AuthContext = Depends(require_api_key),
) -> FileActionResponse:
    dest = settings.DOCUMENTS_DIR / _safe_filename(filename)
    if not dest.exists():
        raise HTTPException(status_code=404, detail=f'File "{filename}" không tồn tại')

    try:
        processor = _get_processor()
        # Delete old index entries first
        await asyncio.to_thread(processor.delete_key, dest.name)
        result = await processor.ingest_file(dest, key=dest.name)
        get_hybrid_searcher().load_indexes()
        return FileActionResponse(
            name=dest.name,
            action="reindexed",
            message=f'File "{dest.name}" đã được lập chỉ mục lại thành công.',
            chunks=result.get("chunks"),
        )
    except Exception as exc:
        logger.exception("Reindex failed for %s", filename)
        raise HTTPException(status_code=500, detail=f"Lập chỉ mục lại thất bại: {exc}") from exc


@router.delete("/{filename}", response_model=FileActionResponse, status_code=200)
async def delete_file(
    filename: str,
    auth: AuthContext = Depends(require_api_key),
) -> FileActionResponse:
    safe_name = _safe_filename(filename)
    dest = settings.DOCUMENTS_DIR / safe_name

    # Remove from indexes
    try:
        processor = _get_processor()
        await asyncio.to_thread(processor.delete_key, safe_name)
        get_hybrid_searcher().load_indexes()
    except Exception as exc:
        logger.warning("Index purge failed for %s: %s", safe_name, exc)

    # Remove file
    if dest.exists():
        await asyncio.to_thread(dest.unlink)

    return FileActionResponse(
        name=safe_name,
        action="deleted",
        message=f'File "{safe_name}" đã được xóa.',
    )


@router.get("/download/{filename}")
async def download_file(
    filename: str,
    auth: AuthContext = Depends(require_api_key),
):
    safe_name = _safe_filename(filename)
    dest = settings.DOCUMENTS_DIR / safe_name
    if not dest.exists():
        raise HTTPException(status_code=404, detail="File not found")
    media_type = mimetypes.guess_type(safe_name)[0] or "application/octet-stream"
    return FileResponse(path=str(dest), filename=safe_name, media_type=media_type)
