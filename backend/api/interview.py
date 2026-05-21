from datetime import datetime

from bson import ObjectId
from fastapi import APIRouter, HTTPException

from database.mongo import interviews_collection, questions_collection, uploads_collection
from models.interview import AnswerEvaluationRequest, QuestionGenerationRequest
from services.ai_service import evaluate_answer, generate_questions_from_text
from utils.confidence import summarize_confidence_metrics
from utils.scoring import analyze_transcript

router = APIRouter(prefix="/interview", tags=["interview"])


@router.post("/questions")
def generate_questions(payload: QuestionGenerationRequest):
    source_text = payload.text
    upload_object_id = None

    if payload.upload_id:
        try:
            upload_object_id = ObjectId(payload.upload_id)
        except Exception as exc:
            raise HTTPException(status_code=400, detail="Invalid upload_id") from exc

        upload = uploads_collection.find_one({"_id": upload_object_id})
        if not upload:
            raise HTTPException(status_code=404, detail="Upload not found")
        source_text = upload.get("extracted_text")

    if not source_text:
        raise HTTPException(status_code=400, detail="Provide upload_id or text")

    try:
        questions = generate_questions_from_text(source_text)
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Question generation failed: {exc}") from exc

    record = {
        "user_email": payload.user_email,
        "upload_id": upload_object_id,
        "questions": questions,
        "created_at": datetime.utcnow(),
    }
    result = questions_collection.insert_one(record)

    return {"question_set_id": str(result.inserted_id), "questions": questions}


@router.post("/evaluate")
def evaluate_interview_answer(payload: AnswerEvaluationRequest):
    transcript_metrics = analyze_transcript(
        payload.answer,
        duration_seconds=payload.duration_seconds,
        pauses=payload.pauses,
    )
    confidence_metrics = summarize_confidence_metrics(payload.visual_metrics)

    try:
        llm_evaluation = evaluate_answer(
            payload.question,
            payload.answer,
            transcript_metrics,
            confidence_metrics,
        )
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Answer evaluation failed: {exc}") from exc

    answer_record = {
        "question": payload.question,
        "answer": payload.answer,
        "transcript_metrics": transcript_metrics,
        "confidence_metrics": confidence_metrics,
        "llm_evaluation": llm_evaluation,
        "created_at": datetime.utcnow(),
    }

    if payload.interview_id:
        try:
            interview_id = ObjectId(payload.interview_id)
        except Exception as exc:
            raise HTTPException(status_code=400, detail="Invalid interview_id") from exc

        interviews_collection.update_one(
            {"_id": interview_id},
            {
                "$setOnInsert": {
                    "user_email": payload.user_email,
                    "created_at": datetime.utcnow(),
                },
                "$push": {"answers": answer_record},
                "$set": {"updated_at": datetime.utcnow()},
            },
            upsert=True,
        )
        response_interview_id = payload.interview_id
    else:
        result = interviews_collection.insert_one(
            {
                "user_email": payload.user_email,
                "answers": [answer_record],
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
            }
        )
        response_interview_id = str(result.inserted_id)

    return {
        "interview_id": response_interview_id,
        "transcript_metrics": transcript_metrics,
        "confidence_metrics": confidence_metrics,
        "evaluation": llm_evaluation,
    }
