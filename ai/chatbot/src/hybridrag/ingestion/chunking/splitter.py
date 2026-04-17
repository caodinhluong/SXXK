from functools import lru_cache
from langchain_text_splitters import RecursiveCharacterTextSplitter
import tiktoken
from src.config.settings import settings

# Markdown-aware separators: split on headers first, then paragraphs, sentences, words
_MD_SEPARATORS = [
    "\n## ", "\n### ", "\n#### ",   # markdown headings
    "\n\n",                          # blank line (paragraph)
    "\n",                            # single newline
    " ",                             # word boundary
    "",                              # character
]


class TextSplitter:
    def __init__(
        self,
        chunk_size: int = settings.FIXED_CHUNK_SIZE,
        chunk_overlap: int = settings.FIXED_CHUNK_OVERLAP,
        encoding_name: str = "cl100k_base",
    ):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.encoding_name = encoding_name

    @lru_cache(maxsize=1)
    def _load_encoder(self):
        return tiktoken.get_encoding(self.encoding_name)

    def _token_len(self, text: str) -> int:
        return len(self._load_encoder().encode(text))

    def split_text(self, text: str) -> list[str]:
        splitter = RecursiveCharacterTextSplitter(
            separators=_MD_SEPARATORS,
            chunk_size=self.chunk_size,
            chunk_overlap=self.chunk_overlap,
            length_function=self._token_len,
            is_separator_regex=False,
            keep_separator=True,
        )
        chunks = splitter.split_text(text)
        # Filter empty chunks and strip leading/trailing whitespace
        return [c.strip() for c in chunks if c.strip()]
