from datetime import datetime

from bson import ObjectId
from fastapi import APIRouter, HTTPException

from database.mongo import interviews_collection, reports_collection, uploads_collection

router = APIRouter(prefix="/reports", tags=["reports"])


def _serialize(doc: dict) -> dict:
    """Convert MongoDB ObjectId and datetime to JSON-safe types."""
    out = {}
    for k, v in doc.items():
        if isinstance(v, ObjectId):
            out[k] = str(v)
        elif isinstance(v, datetime):
            out[k] = v.isoformat()
        elif isinstance(v, dict):
            out[k] = _serialize(v)
        elif isinstance(v, list):
            out[k] = [_serialize(i) if isinstance(i, dict) else (str(i) if isinstance(i, ObjectId) else i) for i in v]
        else:
            out[k] = v
    return out


@router.get("/")
def get_user_reports(user_email: str):
    """Fetch all past reports for a user, newest first."""
    if not user_email:
        raise HTTPException(status_code=400, detail="user_email is required")

    cursor = reports_collection.find(
        {"user_email": user_email},
        sort=[("created_at", -1)],
    )

    results = []
    for report_doc in cursor:
        # Fetch the linked interview for metadata (source file name, question count etc.)
        interview_id = report_doc.get("interview_id")
        interview = {}
        if interview_id:
            interview = interviews_collection.find_one({"_id": interview_id}) or {}

        # Try to get the upload name from the interview's upload_id
        source_name = "Pasted text"
        upload_id = interview.get("upload_id") or interview.get("upload_id")
        if upload_id:
            upload_doc = uploads_collection.find_one({"_id": upload_id})
            if upload_doc:
                source_name = upload_doc.get("filename") or upload_doc.get("original_name") or "Uploaded file"

        answers = interview.get("answers", [])
        skipped = interview.get("skipped_questions", [])
        violation_log = interview.get("violation_log", [])

        results.append({
            "report_id": str(report_doc["_id"]),
            "created_at": report_doc.get("created_at", datetime.utcnow()).isoformat(),
            "source_name": source_name,
            "questions_answered": len(answers),
            "questions_skipped": len(skipped),
            "violations": len(violation_log),
            "total_outside_fullscreen_seconds": interview.get("total_outside_fullscreen_seconds", 0),
            "report": _serialize(report_doc.get("report", {})),
        })

    return {"reports": results}