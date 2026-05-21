import re
from typing import Any


FILLER_WORDS = {
    "um",
    "uh",
    "like",
    "basically",
    "actually",
    "literally",
    "you know",
    "i mean",
}


def analyze_transcript(
    transcript: str,
    duration_seconds: float | None = None,
    pauses: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    words = re.findall(r"\b[\w']+\b", transcript.lower())
    word_count = len(words)
    minutes = max((duration_seconds or 0) / 60, 0.01)
    words_per_minute = round(word_count / minutes)

    filler_counts = {
        filler: len(re.findall(rf"\b{re.escape(filler)}\b", transcript.lower()))
        for filler in FILLER_WORDS
    }
    total_fillers = sum(filler_counts.values())

    pause_list = pauses or []
    long_pauses = [
        pause for pause in pause_list if float(pause.get("duration_seconds", 0)) >= 2
    ]

    hesitation = "Low"
    if total_fillers >= 8 or len(long_pauses) >= 4:
        hesitation = "High"
    elif total_fillers >= 4 or len(long_pauses) >= 2:
        hesitation = "Medium"

    return {
        "word_count": word_count,
        "words_per_minute": words_per_minute,
        "filler_counts": filler_counts,
        "total_fillers": total_fillers,
        "pause_count": len(pause_list),
        "long_pause_count": len(long_pauses),
        "hesitation": hesitation,
    }
