from io import BytesIO
from pathlib import Path

import fitz
import pytesseract
from docx import Document
from PIL import Image


SUPPORTED_EXTENSIONS = {".pdf", ".docx", ".txt", ".png", ".jpg", ".jpeg", ".webp"}


def _extension(filename: str) -> str:
    return Path(filename or "").suffix.lower()


def extract_text_from_bytes(filename: str, data: bytes) -> str:
    ext = _extension(filename)

    if ext not in SUPPORTED_EXTENSIONS:
        raise ValueError(
            "Unsupported file type. Upload PDF, DOCX, TXT, PNG, JPG, JPEG, or WEBP."
        )

    if ext == ".pdf":
        return _extract_pdf(data)

    if ext == ".docx":
        return _extract_docx(data)

    if ext == ".txt":
        return _extract_txt(data)

    return _extract_image(data)


def _extract_pdf(data: bytes) -> str:
    text_parts = []
    with fitz.open(stream=data, filetype="pdf") as document:
        for page in document:
            text_parts.append(page.get_text("text"))
    return _clean_text("\n".join(text_parts))


def _extract_docx(data: bytes) -> str:
    document = Document(BytesIO(data))
    paragraphs = [paragraph.text for paragraph in document.paragraphs]
    return _clean_text("\n".join(paragraphs))


def _extract_txt(data: bytes) -> str:
    for encoding in ("utf-8", "utf-16", "latin-1"):
        try:
            return _clean_text(data.decode(encoding))
        except UnicodeDecodeError:
            continue
    return _clean_text(data.decode("utf-8", errors="ignore"))


def _extract_image(data: bytes) -> str:
    image = Image.open(BytesIO(data))
    return _clean_text(pytesseract.image_to_string(image))


def _clean_text(text: str) -> str:
    lines = [line.strip() for line in text.splitlines()]
    return "\n".join(line for line in lines if line)
