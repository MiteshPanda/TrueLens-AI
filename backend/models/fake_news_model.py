"""
Fake news detection model — combined linguistic + web-verification pipeline.

Two-stage analysis:
  Stage 1 (always runs): Linguistic heuristic — sensationalism, source language,
                          emotional triggers, all-caps, exclamation density.
  Stage 2 (when online):  Web cross-check via DuckDuckGo — searches for key
                          claims, scores source credibility, checks for
                          debunking by known fact-checkers.

Final verdict = weighted fusion of both stages.

Author: Mitesh Panda | Roll: R322QRA05
"""
from __future__ import annotations

import re
from typing import Optional

from backend.utils.preprocess import clean_text, extract_key_tokens

# ── Linguistic signal word lists ──────────────────────────────────────────────

_FAKE_SIGNALS = {
    "shocking", "unbelievable", "bombshell", "exposed", "exclusive",
    "urgent", "conspiracy", "hoax", "scam", "fraud",
    "secret", "hidden", "cover-up", "deep state", "fake",
    "lies", "propaganda", "manipulated", "clickbait", "miracle",
    "cure", "banned", "censored", "wake up", "sheeple",
    "globalist", "illuminati", "they don't want you to know",
    "mainstream media", "satanic", "destroy", "obliterate",
    "outrage", "outraged", "furious", "disgusting", "horrifying",
    "breaking", "you won't believe",
}

_REAL_SIGNALS = {
    "according to", "study shows", "researchers found", "published",
    "peer reviewed", "university", "institute", "report", "data",
    "statistics", "evidence", "confirmed", "verified", "official",
    "spokesperson", "announced", "government", "policy", "legislation",
    "court", "trial", "verdict", "elected", "vote", "parliament",
    "journal", "cited", "source", "investigation", "documented",
}


def _linguistic_score(text: str) -> tuple[float, list[str]]:
    """
    Return (fake_probability 0–1, list of signal descriptions).
    Pure text analysis — no network calls.
    """
    lower = text.lower()
    signals: list[str] = []

    fake_hits = sum(1 for w in _FAKE_SIGNALS if w in lower)
    real_hits = sum(1 for w in _REAL_SIGNALS if w in lower)

    # ALL-CAPS words (≥4 chars)
    caps = len(re.findall(r'\b[A-Z]{4,}\b', text))
    if caps >= 3:
        fake_hits += caps // 2
        signals.append(f"{caps} ALL-CAPS words detected")

    # Exclamation marks
    excl = text.count('!')
    if excl >= 2:
        fake_hits += excl // 2
        signals.append(f"{excl} exclamation marks")

    # Question marks (rhetorical questions common in fake news)
    qmarks = text.count('?')
    if qmarks >= 3:
        fake_hits += qmarks // 3

    # No verifiable source references
    has_numbers = bool(re.search(r'\d{4}|\d+%|\$[\d,]+', text))
    if not has_numbers and real_hits == 0:
        fake_hits += 1
        signals.append("no verifiable statistics or sources")

    # Short, punchy text with lots of fake words
    word_count = len(text.split())
    if word_count < 60 and fake_hits > 2:
        fake_hits += 1
        signals.append("very short, sensationalist text")

    total = fake_hits + real_hits + 1
    raw = fake_hits / total
    # Sigmoid-like smoothing
    fake_prob = max(0.05, min(0.95, raw * 1.15 + 0.05))

    if fake_hits > real_hits:
        signals.insert(0, f"{fake_hits} sensationalist/emotional signal(s) found")
    if real_hits > 0:
        signals.append(f"{real_hits} credible-language signal(s) found")

    return fake_prob, signals


def _fuse_scores(
    ling_fake_prob: float,
    web_evidence: Optional[dict],
) -> tuple[float, float]:
    """
    Adaptive fusion: web weight scales with how decisive the web verdict is.
      - Web decisive  (score < 0.35 or > 0.65) → web_weight = 0.70
      - Web uncertain (score near 0.50)          → web_weight = 0.35
      - Web not searched                         → linguistics only
    """
    web_searched = bool(web_evidence and web_evidence.get("searched"))
    if not web_searched:
        final_fake = ling_fake_prob
    else:
        web_score = float(web_evidence.get("web_score", 0.5))
        web_fake  = 1.0 - web_score
        # Certainty: 0 = web is neutral, 1 = web is fully decided
        certainty  = min(1.0, abs(web_score - 0.5) / 0.30)
        web_weight = 0.35 + certainty * 0.40      # range [0.35, 0.75]
        ling_weight = 1.0 - web_weight
        final_fake = ling_weight * ling_fake_prob + web_weight * web_fake

    final_fake = max(0.04, min(0.96, final_fake))
    confidence = round(final_fake if final_fake >= 0.5 else 1.0 - final_fake, 4)
    return final_fake, confidence



# ── BERT pipeline (lazy-loaded, optional) ────────────────────────────────────

_pipeline: Optional[object] = None
_BERT_MODEL = "distilbert-base-uncased-finetuned-sst-2-english"


def _load_bert():
    global _pipeline
    if _pipeline is None:
        try:
            from transformers import pipeline  # type: ignore
            _pipeline = pipeline(
                "text-classification",
                model=_BERT_MODEL,
                truncation=True,
                max_length=512,
            )
        except Exception as exc:
            print(f"[FakeNewsModel] BERT not available: {exc}")
            _pipeline = "FAILED"
    return _pipeline


# ── Public API ────────────────────────────────────────────────────────────────

def predict_text(
    text: str,
    use_bert: bool = False,
    use_web: bool = True,
) -> dict:
    """
    Classify news text as Real or Fake using a two-stage pipeline.

    Stage 1 — Linguistic analysis (always):
        Heuristic scoring on sensationalist / credible language patterns.

    Stage 2 — Web cross-check (when use_web=True):
        Searches DuckDuckGo for key claims from the text, scores source
        credibility (Reuters/BBC/Snopes etc.) and debunking signals.
        Requires: pip install duckduckgo-search

    Parameters
    ----------
    text     : Raw news article or headline.
    use_bert : Attempt BERT pipeline (requires transformers + model download).
    use_web  : Run web cross-check (requires internet + duckduckgo-search).

    Returns
    -------
    dict with keys: label, confidence, explanation, top_words, model_used,
                    linguistic_score, web_evidence (if searched)
    """
    text = clean_text(text)
    if not text or len(text) < 10:
        return {
            "label": "UNKNOWN", "confidence": 0.0,
            "explanation": "Input too short.",
            "top_words": [], "model_used": "none",
            "linguistic_score": None, "web_evidence": None,
        }

    # ── Stage 1: Linguistic ──────────────────────────────────────────────────
    ling_fake_prob, ling_signals = _linguistic_score(text)
    top_words = extract_key_tokens(text, top_n=8)
    model_used = "linguistic_heuristic"

    # Optionally upgrade with BERT
    if use_bert:
        pipe = _load_bert()
        if pipe and pipe != "FAILED":
            try:
                res = pipe(text[:1024])[0]
                raw = res["label"].upper()
                sc = float(res["score"])
                bert_fake = (1.0 - sc) if raw in ("LABEL_1", "POSITIVE") else sc
                ling_fake_prob = 0.5 * ling_fake_prob + 0.5 * bert_fake
                model_used = f"linguistic+{_BERT_MODEL}"
            except Exception as exc:
                print(f"[FakeNewsModel] BERT inference error: {exc}")

    # ── Stage 2: Web verification ────────────────────────────────────────────
    web_evidence: Optional[dict] = None
    if use_web:
        try:
            from backend.utils.web_verifier import verify_claims
            web_evidence = verify_claims(text, max_queries=3)
        except Exception as exc:
            print(f"[FakeNewsModel] Web verifier error: {exc}")
            web_evidence = None

    # ── Fusion ───────────────────────────────────────────────────────────────
    final_fake, confidence = _fuse_scores(ling_fake_prob, web_evidence)
    label = "FAKE" if final_fake >= 0.5 else "REAL"

    # ── Explanation ──────────────────────────────────────────────────────────
    _web_active = bool(web_evidence and web_evidence.get("searched"))
    parts = []
    if ling_signals:
        parts.append("Linguistic analysis: " + "; ".join(ling_signals[:3]))
    if _web_active:
        parts.append(web_evidence.get("web_summary", ""))
    explanation = " | ".join(p for p in parts if p)
    if not explanation:
        explanation = (
            "Credible language patterns detected — consistent with factual reporting."
            if label == "REAL" else
            "Sensationalist language and unverified claims detected."
        )

    if _web_active:
        model_used += "+web_verify"

    return {
        "label": label,
        "confidence": confidence,
        "explanation": explanation,
        "top_words": top_words,
        "model_used": model_used,
        "linguistic_score": round(ling_fake_prob, 4),
        "web_evidence": web_evidence,
    }
