import os
import tempfile

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from openai import OpenAI

router = APIRouter(prefix="/voice", tags=["voice"])


def _count_fillers(text: str) -> int:
    fillers = {"uh", "um", "er", "ah", "like", "you know", "basically", "so", "right"}
    words = text.lower().split()
    return sum(1 for w in words if w in fillers)


@router.post("/transcribe")
async def transcribe_audio(
    audio: UploadFile = File(...),
    duration_seconds: float = Form(default=0.0),
    user_email: str = Form(default=""),
):
    """
    Accepts a WebM/OGG audio blob from the browser MediaRecorder,
    sends it to OpenAI Whisper, returns transcript + speech metrics.
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY not configured")

    audio_bytes = await audio.read()
    if not audio_bytes:
        raise HTTPException(status_code=400, detail="Empty audio file received")

    content_type = audio.content_type or ""
    if "ogg" in content_type:
        suffix = ".ogg"
    elif "wav" in content_type:
        suffix = ".wav"
    elif "mp4" in content_type or "m4a" in content_type:
        suffix = ".mp4"
    else:
        suffix = ".webm"

    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(audio_bytes)
        tmp_path = tmp.name

    try:
        client = OpenAI(api_key=api_key)
        with open(tmp_path, "rb") as f:
            response = client.audio.transcriptions.create(
                model="whisper-1",
                file=f,
                language="en",
                response_format="verbose_json",
                timestamp_granularities=["word"],
            )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Whisper failed: {exc}") from exc
    finally:
        try:
            os.unlink(tmp_path)
        except OSError:
            pass

    transcript = response.text or ""
    words = transcript.strip().split()
    word_count = len(words)
    speaking_rate = round((word_count / duration_seconds) * 60, 1) if duration_seconds > 1 else 0
    filler_count = _count_fillers(transcript)

    word_timestamps = []
    if hasattr(response, "words") and response.words:
        word_timestamps = [
            {"word": w.word, "start": w.start, "end": w.end}
            for w in response.words
        ]

    pauses = []
    if len(word_timestamps) > 1:
        for i in range(1, len(word_timestamps)):
            gap = word_timestamps[i]["start"] - word_timestamps[i - 1]["end"]
            if gap > 1.5:
                pauses.append({
                    "after_word": word_timestamps[i - 1]["word"],
                    "duration_seconds": round(gap, 2),
                })

    return {
        "transcript": transcript,
        "metrics": {
            "word_count": word_count,
            "duration_seconds": duration_seconds,
            "speaking_rate_wpm": speaking_rate,
            "filler_word_count": filler_count,
            "pause_count": len(pauses),
            "pauses": pauses,
            "word_timestamps": word_timestamps,
        },
    }