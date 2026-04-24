"""
Wikipedia-based claim verifier for fake news detection.
Uses Wikipedia's free public API — no keys, no rate limits (polite usage).

Pipeline:
  1. Extract key named entities + claim from text.
  2. Search Wikipedia for up to 4 relevant articles.
  3. Fetch each article's full introduction (plain text).
  4. Score: phrase-match confirmation & debunking on FULL intro text.
  5. Return structured evidence with Wikipedia citations.
"""
from __future__ import annotations

import json
import re
import time
import urllib.parse
import urllib.request
from typing import Optional

WIKI_API = "https://en.wikipedia.org/w/api.php"
HEADERS  = {"User-Agent": "TruthLensAI/1.0 (educational project)"}

# ── Phrase-level signals ──────────────────────────────────────────────────────

_DEBUNK: list[str] = [
    "never won","did not win","has not won","hasn't won","have not won",
    "never won a","never won the","has never won",
    "did not happen","no evidence","is false","is fake","is misleading",
    "is misinformation","debunked","is a hoax","fabricated","manipulated",
    "conspiracy theory","false claim","not true","never happened",
    "is not true","was not","cannot be confirmed","no record of",
    "never achieved","has not been verified","was defeated","was eliminated",
    "did not qualify","failed to","did not reach",
]

_CONFIRM: list[str] = [
    "according to","study shows","researchers found","officially announced",
    "is true","confirmed by","evidence shows","data shows","verified by",
    "peer-reviewed","published in","clinical trial","reported by",
    "has been proven","officials say","scientists confirm","experts say",
    "won the","became champion","was awarded","is the winner",
    "successfully","achieved","accomplished",
]

# ── Wikipedia API helpers ─────────────────────────────────────────────────────

def _wiki_get(params: dict) -> dict:
    url = WIKI_API + "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=8) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except Exception as exc:
        print(f"[WikiVerifier] API error: {exc}")
        return {}


def _search_titles(query: str, limit: int = 3) -> list[str]:
    """Return Wikipedia page titles matching query."""
    data = _wiki_get({
        "action": "query", "list": "search",
        "srsearch": query, "srlimit": limit,
        "srprop": "title", "format": "json",
    })
    return [r["title"] for r in data.get("query", {}).get("search", [])]


def _get_extract(title: str, sentences: int = 12) -> str:
    """Fetch plain-text introduction of a Wikipedia article."""
    data = _wiki_get({
        "action": "query", "prop": "extracts",
        "exintro": True, "explaintext": True,
        "exsentences": sentences,
        "titles": title, "format": "json",
        "redirects": True,
    })
    pages = data.get("query", {}).get("pages", {})
    for page in pages.values():
        return page.get("extract", "")
    return ""


def _score_text(text: str) -> tuple[int, int]:
    lower = text.lower()
    deb = sum(1 for p in _DEBUNK  if p in lower)
    con = sum(1 for p in _CONFIRM if p in lower)
    return deb, con


# ── Query extraction ──────────────────────────────────────────────────────────

def _extract_queries(text: str) -> list[str]:
    sentences = [s.strip() for s in re.split(r"[.!?]", text) if len(s.strip()) > 12]
    queries: list[str] = []

    if sentences:
        queries.append(sentences[0][:120])

    ne = re.findall(r"\b(?:[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})\b", text)
    ne_unique = list(dict.fromkeys(ne))
    if ne_unique:
        q = " ".join(ne_unique[:4])[:100]
        if q not in queries:
            queries.append(q)

    if sentences:
        q = sentences[0][:80] + " Wikipedia"
        if q not in queries:
            queries.append(q)

    return queries[:3]


# ── Main public function ──────────────────────────────────────────────────────

def verify_claims(text: str, max_queries: int = 3) -> dict:
    """
    Verify text claims using Wikipedia.

    Scoring:
      Base 0.50 (neutral).
      +0.22 per article with ≥1 confirm phrase
      +0.08 per confirm phrase (cap 0.24)
      -0.22 per article with ≥1 debunk phrase
      -0.18 per debunk phrase  (cap 0.50)
      -0.15 if query returns no Wikipedia articles (obscure/unverified claim)
    """
    queries = _extract_queries(text)
    if not queries:
        return _uncertain([], False, "Could not extract claims from text.")

    articles: list[dict] = []
    seen_titles: set[str] = set()

    for q in queries[:max_queries]:
        try:
            titles = _search_titles(q, limit=3)
        except Exception:
            titles = []

        for title in titles:
            if title in seen_titles:
                continue
            seen_titles.add(title)
            try:
                extract = _get_extract(title, sentences=12)
            except Exception:
                extract = ""

            if not extract:
                continue

            deb, con = _score_text(extract)
            articles.append({
                "title":   title,
                "url":     f"https://en.wikipedia.org/wiki/{urllib.parse.quote(title)}",
                "domain":  "wikipedia.org",
                "snippet": extract[:250],
                "credibility":     "high",
                "debunk_signals":  deb,
                "confirm_signals": con,
            })
        time.sleep(0.15)

    if not articles:
        return _uncertain(queries, True,
                          "No Wikipedia articles found for this claim — "
                          "may be an obscure, unverifiable, or fabricated claim.")

    debunk_tot  = sum(a["debunk_signals"]  for a in articles)
    confirm_tot = sum(a["confirm_signals"] for a in articles)
    confirming  = [a for a in articles if a["confirm_signals"] > 0]
    debunking   = [a for a in articles if a["debunk_signals"]  > 0]

    score = 0.50
    score += min(len(confirming) * 0.22, 0.44)
    score += min(confirm_tot    * 0.08, 0.24)
    score -= min(len(debunking) * 0.22, 0.44)
    score -= min(debunk_tot     * 0.18, 0.50)
    if not articles:
        score -= 0.15

    score = max(0.04, min(0.96, score))

    if   score >= 0.62: web_label = "REAL"
    elif score <= 0.40: web_label = "FAKE"
    else:               web_label = "UNCERTAIN"

    parts: list[str] = []
    if confirming:
        parts.append(f"{len(confirming)} Wikipedia article(s) support the claim "
                     f"({', '.join(a['title'] for a in confirming[:2])})")
    if debunking:
        parts.append(f"{len(debunking)} Wikipedia article(s) contradict the claim "
                     f"({', '.join(a['title'] for a in debunking[:2])})")
    if not parts:
        parts.append(f"{len(articles)} Wikipedia article(s) found — no strong signal")

    return {
        "queries":               queries,
        "sources":               articles[:8],
        "web_score":             round(score, 4),
        "web_label":             web_label,
        "high_cred_count":       len(articles),
        "low_cred_count":        0,
        "debunk_count":          debunk_tot,
        "confirm_count":         confirm_tot,
        "confirming_cred_count": len(confirming),
        "web_summary":           "Wikipedia fact-check: " + "; ".join(parts) + ".",
        "searched":              True,
    }


def _uncertain(queries: list[str], searched: bool, msg: str) -> dict:
    return {
        "queries": queries, "sources": [], "web_score": 0.45,
        "web_label": "UNCERTAIN", "high_cred_count": 0, "low_cred_count": 0,
        "debunk_count": 0, "confirm_count": 0, "confirming_cred_count": 0,
        "web_summary": msg, "searched": searched,
    }
