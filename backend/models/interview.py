from typing import Any

from pydantic import BaseModel, Field



class QuestionGenerationRequest(BaseModel):
    upload_id: str | None = None
    text: str | None = None
    user_email: str | None = None


class AnswerEvaluationRequest(BaseModel):
    interview_id: str | None = None
    user_email: str | None = None
    question: str
    answer: str
    duration_seconds: float | None = None
    pauses: list[dict[str, Any]] = Field(default_factory=list)
    visual_metrics: dict[str, Any] = Field(default_factory=dict)


class FinalReportRequest(BaseModel):
    interview_id: str
    user_email: str | None = None
    skipped_questions: list[dict[str, Any]] = []  # ← add this line
