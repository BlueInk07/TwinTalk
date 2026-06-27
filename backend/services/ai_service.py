import json
import os
import random
import re
from typing import Any

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()


QUESTION_SYSTEM_PROMPT = """
You are an expert technical interviewer who generates highly specific, document-aware
interview questions. Your questions must be directly grounded in the candidate's actual
experience, projects, skills, and technologies mentioned in the document — never generic.
Return only valid JSON with easy, medium, and hard arrays. No duplicate questions.
"""

EVALUATION_SYSTEM_PROMPT = """
You are a senior technical interviewer evaluating a mock interview response.
Be fair but thorough. Multiple valid phrasings of a correct answer should all score well.
Do NOT penalize for wording differences — focus on conceptual accuracy, completeness, and clarity.
Return only valid JSON. Scores must be numbers from 0 to 10.
"""

GEMINI_DEFAULT_MODEL = "gemini-2.5-flash"
GEMINI_FALLBACK_MODELS = (
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash",
    "gemini-2.0-flash-001",
)


def generate_questions_from_text(text: str) -> dict[str, list[str]]:
    # Randomise instruction phrasing so repeated calls produce different questions
    angle_variations = [
        "Focus on practical application and real scenarios the candidate would have faced.",
        "Emphasise problem-solving and how the candidate would handle edge cases.",
        "Probe for depth of understanding — not just definitions, but the 'why' behind decisions.",
        "Focus on trade-offs, comparisons, and when the candidate would choose one approach over another.",
        "Emphasise past experiences, mistakes made, and lessons learned.",
    ]
    difficulty_angles = [
        "For easy: basic definitions and recall. For medium: application and reasoning. For hard: architecture, trade-offs, and leadership.",
        "For easy: explain concepts simply. For medium: solve realistic problems. For hard: design systems or defend decisions under pressure.",
        "For easy: foundational knowledge. For medium: debugging and optimisation. For hard: system design and strategic thinking.",
    ]
    salt = random.randint(1000, 9999)  # forces the model to see a unique prompt each time

    prompt = f"""
You are interviewing a candidate based on the document below.
Generate 15 unique, document-specific interview questions (5 easy, 5 medium, 5 hard).

Rules:
- Every question MUST reference something specific from the document (a technology, project, skill, role, or achievement).
- Do NOT ask generic questions like "What is OOP?" or "Tell me about yourself." unless directly relevant to something in the document.
- No two questions should be similar or overlap in what they test.
- {random.choice(angle_variations)}
- {random.choice(difficulty_angles)}
- Variation seed: {salt}

Document:
{text[:12000]}

Return JSON exactly like:
{{"easy": ["q1","q2","q3","q4","q5"], "medium": ["q1","q2","q3","q4","q5"], "hard": ["q1","q2","q3","q4","q5"]}}
"""
    content = _complete_json(QUESTION_SYSTEM_PROMPT, prompt, temperature=0.9)
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
You are evaluating a candidate's spoken interview answer. Use the rubric below strictly.

QUESTION ASKED:
{question}

CANDIDATE'S ANSWER:
{answer}

SPEECH METRICS (hesitation, pace, filler words):
{json.dumps(transcript_metrics)}

VISUAL/CONFIDENCE METRICS:
{json.dumps(confidence_metrics)}

SCORING RUBRIC — score each dimension 0–10:

1. technical_accuracy (0–10):
   - 9–10: Correct, detailed, shows deep understanding
   - 7–8:  Mostly correct, minor gaps or imprecision
   - 5–6:  Partially correct, key ideas present but incomplete
   - 3–4:  Some relevant points but significant errors or omissions
   - 0–2:  Incorrect or irrelevant answer
   NOTE: Award full marks if the candidate demonstrates understanding using their own words,
   analogies, or a different valid phrasing. Do NOT penalise for not using exact terminology.

2. completeness (0–10):
   - Does the answer address all aspects of the question?
   - Did the candidate give examples or context where appropriate?

3. clarity (0–10):
   - Is the answer easy to follow and logically structured?
   - Is it concise without being too brief?

4. communication (0–10):
   - Use speech_metrics to factor in pace, filler words, and hesitation.
   - A fluent, well-paced answer should score 8–10 even if not perfect.

5. confidence (0–10):
   - Use both visual_metrics and speech tone/hesitation.
   - If no visual metrics available, base this primarily on speech fluency.

6. overall_score: weighted average — technical_accuracy × 0.35 + completeness × 0.25 + clarity × 0.20 + communication × 0.10 + confidence × 0.10

For strengths and weaknesses, be specific to what the candidate actually said — not generic feedback.

The "summary" field must be exactly 1–2 plain sentences max. Format: was the answer on point? which relevant topics did they mention? what key thing was missing? No scores, no labels, no jargon. Example: "Answer was clear and covered the main boiling indicators. Missed the role of temperature timing in the process."

Return ONLY this JSON:
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
    return _parse_json(_complete_json(EVALUATION_SYSTEM_PROMPT, prompt, temperature=0.3))


def generate_final_report(interview: dict[str, Any]) -> dict[str, Any]:
    skipped = interview.get("skipped_questions", [])
    skipped_count = len(skipped)
    answered_count = len(interview.get("answers", []))
    skipped_note = (
        f"\n\nNote: The candidate skipped {skipped_count} question(s): "
        + ", ".join(f'"{q.get("question", q)}"' for q in skipped)
        if skipped_count
        else "\n\nNote: The candidate did not skip any questions."
    )

    prompt = f"""
Create a final mock-interview performance report from this interview data:
{json.dumps(interview, default=str)[:14000]}

Additional context:
- Questions answered: {answered_count}
- Questions skipped: {skipped_count}{skipped_note}

Skipping questions should be reflected in the completeness and overall scores.
A higher skip rate indicates lower preparedness and should lower the overall score meaningfully.
If questions were skipped, mention this explicitly in weaknesses and the improvement plan.

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
    return _parse_json(_complete_json(EVALUATION_SYSTEM_PROMPT, prompt, temperature=0.3))


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
                model = genai.GenerativeModel(model_name)
                generation_config = genai.types.GenerationConfig(temperature=temperature)
                response = model.generate_content(
                    f"{system_prompt}\n\n{user_prompt}",
                    generation_config=generation_config,
                )
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