import json
import os
import re
from typing import Any

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()


QUESTION_SYSTEM_PROMPT = """
You generate practical interview questions from uploaded resumes, notes, screenshots,
or technical documents. Return only valid JSON with easy, medium, and hard arrays.
"""

EVALUATION_SYSTEM_PROMPT = """
You are a strict but helpful mock-interview evaluator. Return only valid JSON.
Scores must be numbers from 0 to 10.
"""

GEMINI_DEFAULT_MODEL = "gemini-2.5-flash"
GEMINI_FALLBACK_MODELS = (
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash",
    "gemini-2.0-flash-001",
)


def generate_questions_from_text(text: str) -> dict[str, list[str]]:
    prompt = f"""
Generate interview questions from this document.

Create:
- 5 easy
- 5 medium
- 5 hard

Questions should test technical knowledge, communication, and practical understanding.

Document:
{text[:12000]}

Return JSON exactly like:
{{"easy": [], "medium": [], "hard": []}}
"""
    content = _complete_json(QUESTION_SYSTEM_PROMPT, prompt)
    parsed = _parse_json(content)
    return {
        "easy": _normalize_question_list(parsed.get("easy", [])),
        "medium": _normalize_question_list(parsed.get("medium", [])),
        "hard": _normalize_question_list(parsed.get("hard", [])),
    }


def evaluate_answer(
    question: str,
    answer: str,
    transcript_metrics: dict[str, Any],
    confidence_metrics: dict[str, Any],
) -> dict[str, Any]:
    prompt = f"""
Evaluate this interview answer.

Question:
{question}

Answer transcript:
{answer}

Speech metrics:
{json.dumps(transcript_metrics)}

Visual confidence metrics:
{json.dumps(confidence_metrics)}

Return JSON with:
{{
  "confidence": 0,
  "clarity": 0,
  "technical_accuracy": 0,
  "communication": 0,
  "completeness": 0,
  "overall_score": 0,
  "strengths": [],
  "weaknesses": [],
  "improvement_suggestions": [],
  "summary": ""
}}
"""
    return _parse_json(_complete_json(EVALUATION_SYSTEM_PROMPT, prompt))


def generate_final_report(interview: dict[str, Any]) -> dict[str, Any]:
    prompt = f"""
Create a final mock-interview performance report from this interview data:
{json.dumps(interview, default=str)[:14000]}

Return JSON with:
{{
  "overall_score": 0,
  "confidence_score": 0,
  "technical_accuracy": 0,
  "communication": 0,
  "hesitation": "Low|Medium|High",
  "eye_contact": "Low|Average|Good|Excellent",
  "strengths": [],
  "weaknesses": [],
  "improvement_plan": [],
  "summary": ""
}}
"""
    return _parse_json(_complete_json(EVALUATION_SYSTEM_PROMPT, prompt))


def _complete_json(system_prompt: str, user_prompt: str) -> str:
    if os.getenv("OPENAI_API_KEY"):
        client = OpenAI()
        response = client.chat.completions.create(
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.4,
            response_format={"type": "json_object"},
        )
        return response.choices[0].message.content or "{}"

    if os.getenv("GEMINI_API_KEY"):
        import google.generativeai as genai

        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        model_names = _gemini_model_candidates(genai)

        last_error = None
        for model_name in model_names:
            try:
                model = genai.GenerativeModel(model_name)
                response = model.generate_content(f"{system_prompt}\n\n{user_prompt}")
                return response.text or "{}"
            except Exception as exc:
                last_error = exc

        raise RuntimeError(f"Gemini generation failed: {last_error}")

    raise RuntimeError("Set OPENAI_API_KEY or GEMINI_API_KEY to use AI endpoints.")


def _gemini_model_candidates(genai: Any) -> list[str]:
    preferred_model = os.getenv("GEMINI_MODEL", GEMINI_DEFAULT_MODEL)
    candidates = [preferred_model]
    candidates.extend(name for name in GEMINI_FALLBACK_MODELS if name != preferred_model)

    try:
        listed_models = []
        for model in genai.list_models():
            if "generateContent" not in getattr(model, "supported_generation_methods", []):
                continue

            model_name = getattr(model, "name", "")
            if model_name.startswith("models/"):
                model_name = model_name.removeprefix("models/")

            if model_name:
                listed_models.append(model_name)

        preferred_listed = [
            name
            for name in listed_models
            if name.startswith(("gemini-2.5", "gemini-2.0", "gemini-3"))
        ]
        candidates.extend(name for name in preferred_listed if name not in candidates)
        candidates.extend(name for name in listed_models if name not in candidates)
    except Exception:
        pass

    return candidates


def _parse_json(content: str) -> dict[str, Any]:
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", content, re.DOTALL)
        if not match:
            raise ValueError("AI response did not contain valid JSON.")
        return json.loads(match.group(0))


def _normalize_question_list(value: Any) -> list[str]:
    if not isinstance(value, list):
        return []
    return [str(item).strip() for item in value if str(item).strip()][:5]
