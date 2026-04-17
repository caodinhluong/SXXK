from pydantic_settings import BaseSettings
from pathlib import Path
from typing import Optional


class Settings(BaseSettings):
    # -----< API Auth >-----
    CHATBOT_API_KEY: str = "sxxk-chatbot-secret-key"

    # -----< OpenAI & LLM >-----
    OPENAI_API_KEY:       str   = ""
    GENERATE_MODEL:       str   = "gpt-4o-mini"
    EMBEDDING_MODEL:      str   = "text-embedding-3-small"
    EMBEDDING_DIMENSION:  int   = 1536
    TEMPERATURE_MAIN:     float = 0.6
    TEMPERATURE_CHITCHAT: float = 0.8
    MAX_GEN_MAIN:         int   = 600
    MAX_GEN_CHITCHAT:     int   = 150

    # -----< Chunking >-----
    FIXED_CHUNK_SIZE:    int = 800
    FIXED_CHUNK_OVERLAP: int = 100

    # -----< Retrieval / Reranker >-----
    VECTOR_SEARCH_K:  int  = 7
    ELASTIC_SEARCH_K: int  = 7
    RRF_K:            int  = 60
    FUSION_K:         int  = 7
    RERANKER_MODEL:   str  = "jinaai/jina-reranker-v2-base-multilingual"
    USE_RERANKER:     bool = True   # requires CUDA GPU
    RERANK_TOP_K:     int  = 3
    ROUTER_TYPE:      str  = "keyword"  # "keyword" or "semantic"

    # -----< Query Rewriting >-----
    MAX_HISTORY_TOKENS_REWRITE: int   = 250
    TEMPERATURE_REWRITER:       float = 0.2
    K_REWRITE:                  int   = 8
    REWRITER_MODEL:             str   = "gpt-4o-mini"
    REWRITER_TIMEOUT:           float = 8.0
    MAX_REWRITE_OUTPUT_TOKENS:  int   = 100
    MAX_HISTORY_CHARS_REWRITE:  int   = 1200
    REWRITER_CACHE_SIZE:        int   = 512
    REWRITER_CACHE_TTL_SECONDS: int   = 86400

    # -----< Directories >-----
    BASE_DIR:              Path = Path(__file__).parent.parent.parent
    DATA_DIR:              Path = BASE_DIR / "data"
    DOCUMENTS_DIR:         Path = DATA_DIR / "documents"
    VECTOR_STORE_DIR:      Path = DATA_DIR / "vector_store"
    ROUTER_EMBEDDINGS_DIR: Path = VECTOR_STORE_DIR / "router_embeddings"
    BM25_CACHE_DIR:        Path = VECTOR_STORE_DIR / "bm25_store"
    FAISS_CACHE_DIR:       Path = VECTOR_STORE_DIR / "faiss_store"

    # -----< SQLite >-----
    SQLITE_PATH: Path = DATA_DIR / "chatbot.db"

    # -----< CORS >-----
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:5174,http://localhost:3000"

    class Config:
        env_file          = Path(__file__).parent.parent.parent / ".env"
        env_file_encoding = "utf-8"
        extra             = "allow"
        case_sensitive    = True

    def model_post_init(self, __context):
        self.DOCUMENTS_DIR.mkdir(parents=True, exist_ok=True)
        self.VECTOR_STORE_DIR.mkdir(parents=True, exist_ok=True)
        self.ROUTER_EMBEDDINGS_DIR.mkdir(parents=True, exist_ok=True)
        self.BM25_CACHE_DIR.mkdir(parents=True, exist_ok=True)
        self.FAISS_CACHE_DIR.mkdir(parents=True, exist_ok=True)


settings = Settings()
