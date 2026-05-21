from datetime import datetime

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from database.mongo import uploads_collection
from services.pdf_service import extract_text_from_bytes

router = APIRouter(prefix="/upload", tags=["upload"])


@router.post("")
async def upload_document(
    file: UploadFile = File(...),
    user_email: str | None = Form(default=None),
):
    data = await file.read()

    if not data:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    try:
        extracted_text = extract_text_from_bytes(file.filename or "", data)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"Text extraction failed: {exc}") from exc

    if not extracted_text:
        raise HTTPException(
            status_code=422,
            detail="No readable text found. Try a clearer file or screenshot.",
        )

    upload = {
        "user_email": user_email,
        "filename": file.filename,
        "content_type": file.content_type,
        "extracted_text": extracted_text,
        "char_count": len(extracted_text),
        "created_at": datetime.utcnow(),
    }
    result = uploads_collection.insert_one(upload)

    return {
        "upload_id": str(result.inserted_id),
        "filename": file.filename,
        "char_count": len(extracted_text),
        "preview": extracted_text[:600],
    }
