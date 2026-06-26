import json
import os
import random
import re
import uuid
from typing import Any

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()


QUESTION_SYSTEM_PROMPT = """
You are an expert technical interviewer with 15+ years of experience conducting interviews
at top tech companies. You deeply analyse documents and generate highly specific, varied,
and insightful interview questions that directly test the candidate on what is actually
written in their document. You never repeat questions. Return only valid JSON.
"""

EVALUATION_SYSTEM_PROMPT = """
You are an experienced, fair, and encouraging mock-interview evaluator. Your job is to
assess whether the candidate demonstrated a clear and correct understanding of the concept
— not whether they used specific keywords or matched an exact answer.

A good answer can be phrased in many valid ways. Reward:
- Correct conceptual understanding
- Relevant examples and practical knowledge
- Clarity of thought and communication
- Completeness relative to the difficulty of the question

Penalise only for factual errors, vague non-answers, or missing critical concepts.
Return only valid JSON. All scores must be numbers between 0 and 10.
"""

GEMINI_DEFAULT_MODEL = "gemini-2.5-flash"
GEMINI_FALLBACK_MODELS = (
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash",
    "gemini-2.0-flash-001",
)

# ─── Question angle banks ─────────────────────────────────────────────────────
# Injected randomly so the same document yields different question sets each run.

EASY_ANGLES = [
    "definitions and basic concepts",
    "what each tool or technology does",
    "terminology used in the document",
    "the purpose of the projects or tasks described",
    "factual recall from the document",
    "what the candidate did in each role or project",
    "basic how-does-it-work questions on the listed technologies",
]

MEDIUM_ANGLES = [
    "why specific design or technical decisions were made",
    "how components or systems interact with each other",
    "trade-offs between the technologies or approaches mentioned",
    "how the candidate would debug or troubleshoot described systems",
    "how the candidate would extend or improve what is described",
    "real-world application of the concepts mentioned",
    "comparing the approaches in the document with alternatives",
]

HARD_ANGLES = [
    "architectural decisions and their long-term consequences",
    "scalability and performance implications of the described work",
    "edge cases and failure modes in the systems described",
    "security considerations relevant to the described work",
    "how to optimise or refactor the described solutions",
    "system design questions derived from the described experience",
    "deep technical accuracy challenges on the advanced topics mentioned",
]


def generate_questions_from_text(text: str) -> dict[str, list[str]]:
    # Pick random angles so each generation is different even for the same document
    easy_angle = random.choice(EASY_ANGLES)
    medium_angle = random.choice(MEDIUM_ANGLES)
    hard_angle = random.choice(HARD_ANGLES)

    # Unique seed so the model knows this is a fresh request
    seed = uuid.uuid4().hex[:8]

    prompt = f"""
[Request ID: {seed}]

You are interviewing a candidate based ONLY on the document below.
Do NOT generate generic interview questions. Every question must be directly tied
to something specific that appears in the document — a technology, project, role,
tool, decision, or concept that is actually mentioned.

STRICT RULES:
- All 15 questions must be completely different from each other.
- No two questions may ask the same thing in different words.
- Do not ask "What is X?" for the same X more than once across all difficulty levels.
- Questions must be specific enough that someone who did NOT write this document
  would struggle to answer them without reading it.

QUESTION ANGLES TO USE THIS TIME:
- Easy questions should focus on: {easy_angle}
- Medium questions should focus on: {medium_angle}
- Hard questions should focus on: {hard_angle}

DIFFICULTY GUIDE:
- Easy: Recall and basic understanding. A junior candidate with the experience
  described should answer confidently.
- Medium: Applied understanding. Requires genuine experience with what is described.
- Hard: Deep expertise. Requires the candidate to reason, analyse, or design beyond
  surface-level knowledge.

Document:
{text[:12000]}

Return JSON exactly like this (no extra keys, no markdown):
{{"easy": ["q1", "q2", "q3", "q4", "q5"], "medium": ["q1", "q2", "q3", "q4", "q5"], "hard": ["q1", "q2", "q3", "q4", "q5"]}}
"""
    content = _complete_json(QUESTION_SYSTEM_PROMPT, prompt, temperature=0.9)
    parsed = _parse_json(content)

    easy = _normalize_question_list(parsed.get("easy", []))
    medium = _normalize_question_list(parsed.get("medium", []))
    hard = _normalize_question_list(parsed.get("hard", []))

    # Deduplicate across all levels — remove any question that appears in an earlier level
    seen: set[str] = set()
    easy = _deduplicate(easy, seen)
    medium = _deduplicate(medium, seen)
    hard = _deduplicate(hard, seen)

    return {"easy": easy, "medium": medium, "hard": hard}


def evaluate_answer(
    question: str,
    answer: str,
    transcript_metrics: dict[str, Any],
    confidence_metrics: dict[str, Any],
) -> dict[str, Any]:
    prompt = f"""
Evaluate this mock interview answer fairly and thoroughly.

QUESTION:
{question}

CANDIDATE'S ANSWER:
{answer}

SPEECH METRICS (from speech recognition):
{json.dumps(transcript_metrics)}

VISUAL CONFIDENCE METRICS:
{json.dumps(confidence_metrics)}

EVALUATION INSTRUCTIONS:
1. Read the answer carefully and judge whether it correctly addresses the question.
2. A correct answer does NOT need to use specific keywords. Judge conceptual correctness.
3. If the answer is partially correct, award partial credit — do not give 0 for an
   answer that contains some correct understanding.
4. Use the full 0–10 range. A perfect answer earns 9–10. A completely wrong or
   empty answer earns 0–2. Most real answers fall between 4 and 8.
5. Strengths and weaknesses must be specific to THIS answer, not generic advice.
6. Improvement suggestions must be actionable and specific.

Return JSON with this exact structure:
{{
  "confidence": <number 0-10>,
  "clarity": <number 0-10>,
  "technical_accuracy": <number 0-10>,
  "communication": <number 0-10>,
  "completeness": <number 0-10>,
  "overall_score": <number 0-10, weighted average of above>,
  "strengths": ["specific strength 1", "specific strength 2"],
  "weaknesses": ["specific weakness 1", "specific weakness 2"],
  "improvement_suggestions": ["actionable suggestion 1", "actionable suggestion 2"],
  "summary": "2-3 sentence personalised summary of this specific answer"
}}
"""
    return _parse_json(_complete_json(EVALUATION_SYSTEM_PROMPT, prompt, temperature=0.3))


def generate_final_report(interview: dict[str, Any]) -> dict[str, Any]:
    prompt = f"""
Create a detailed final performance report for this mock interview session.

Interview Data:
{json.dumps(interview, default=str)[:14000]}

INSTRUCTIONS:
- Calculate overall_score as the true average of all individual question scores.
- Be honest but encouraging in the summary.
- Improvement plan items must be specific and actionable, not generic advice.
- Strengths and weaknesses must reflect patterns across ALL answers, not just one.

Return JSON with this exact structure:
{{
  "overall_score": <number 0-10>,
  "confidence_score": <number 0-10>,
  "technical_accuracy": <number 0-10>,
  "communication": <number 0-10>,
  "hesitation": "Low|Medium|High",
  "eye_contact": "Low|Average|Good|Excellent",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "improvement_plan": ["step 1", "step 2", "step 3"],
  "summary": "3-4 sentence personalised summary of the full interview performance"
}}
"""
    return _parse_json(_complete_json(EVALUATION_SYSTEM_PROMPT, prompt, temperature=0.3))


# ─── Internal helpers ─────────────────────────────────────────────────────────


def _complete_json(system_prompt: str, user_prompt: str, temperature: float = 0.7) -> str:
    if os.getenv("OPENAI_API_KEY"):
        client = OpenAI()
        response = client.chat.completions.create(
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=temperature,
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
                model = genai.GenerativeModel(
                    model_name,
                    generation_config={"temperature": temperature},
                )
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


def _deduplicate(questions: list[str], seen: set[str]) -> list[str]:
    """Remove questions whose normalised form has already appeared in a previous level."""
    result = []
    for q in questions:
        key = q.lower().strip()
        if key not in seen:
            seen.add(key)
            result.append(q)
    return result