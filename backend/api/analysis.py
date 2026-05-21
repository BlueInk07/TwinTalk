from datetime import datetime

from bson import ObjectId
from fastapi import APIRouter, HTTPException

from database.mongo import interviews_collection, reports_collection
from models.interview import FinalReportRequest
from services.ai_service import generate_final_report

router = APIRouter(prefix="/analysis", tags=["analysis"])


@router.post("/report")
def create_report(payload: FinalReportRequest):
    try:
        interview_id = ObjectId(payload.interview_id)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid interview_id") from exc

    interview = interviews_collection.find_one({"_id": interview_id})
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    if payload.user_email and interview.get("user_email") != payload.user_email:
        raise HTTPException(status_code=403, detail="Interview does not belong to user")

    try:
        report = generate_final_report(interview)
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Report generation failed: {exc}") from exc

    record = {
        "interview_id": interview_id,
        "user_email": interview.get("user_email"),
        "report": report,
        "created_at": datetime.utcnow(),
    }
    result = reports_collection.insert_one(record)

    return {"report_id": str(result.inserted_id), "report": report}
