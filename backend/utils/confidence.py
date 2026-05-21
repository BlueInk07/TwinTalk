from typing import Any


def summarize_confidence_metrics(metrics: dict[str, Any] | None) -> dict[str, Any]:
    metrics = metrics or {}

    eye_contact = _clamp(metrics.get("eye_contact_percentage", 0))
    face_visibility = _clamp(metrics.get("face_visibility_percentage", 0))
    smile = _clamp(metrics.get("smile_consistency_percentage", 0))
    head_movement = float(metrics.get("head_movement_frequency", 0) or 0)

    stability_score = max(0, 100 - min(head_movement * 8, 60))
    confidence_score = round(
        (eye_contact * 0.4 + face_visibility * 0.25 + smile * 0.15 + stability_score * 0.2)
        / 10,
        1,
    )

    if confidence_score >= 8:
        label = "Strong"
    elif confidence_score >= 6:
        label = "Good"
    elif confidence_score >= 4:
        label = "Developing"
    else:
        label = "Needs work"

    return {
        "confidence_score": confidence_score,
        "confidence_label": label,
        "eye_contact": _quality_label(eye_contact),
        "face_visibility": _quality_label(face_visibility),
        "smile_consistency": _quality_label(smile),
        "head_movement_frequency": head_movement,
    }


def _clamp(value: Any) -> float:
    try:
        numeric = float(value)
    except (TypeError, ValueError):
        return 0
    return max(0, min(numeric, 100))


def _quality_label(value: float) -> str:
    if value >= 80:
        return "Excellent"
    if value >= 60:
        return "Good"
    if value >= 40:
        return "Average"
    return "Low"
