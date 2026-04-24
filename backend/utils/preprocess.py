"""
Text preprocessing utilities for the fake news detection pipeline.
"""
import re
import string


# Common English stopwords (inline to avoid NLTK dependency)
_STOPWORDS = {
    "a", "an", "the", "and", "or", "but", "is", "are", "was", "were",
    "be", "been", "being", "have", "has", "had", "do", "does", "did",
    "will", "would", "could", "should", "may", "might", "must", "shall",
    "to", "of", "in", "for", "on", "with", "at", "by", "from", "as",
    "it", "its", "this", "that", "these", "those", "i", "we", "you",
    "he", "she", "they", "me", "us", "him", "her", "them", "my", "our",
    "your", "his", "her", "their", "what", "which", "who", "whom", "how",
    "when", "where", "why", "not", "no", "nor", "so", "yet", "both",
    "either", "neither", "just", "than", "then", "there", "here",
}


def clean_text(text: str) -> str:
    """Clean and normalize input text."""
    if not text:
        return ""
    # Remove HTML tags
    text = re.sub(r"<[^>]+>", " ", text)
    # Normalize whitespace
    text = re.sub(r"\s+", " ", text).strip()
    return text


def tokenize_simple(text: str) -> list[str]:
    """Simple whitespace + punctuation tokenizer."""
    text = text.lower()
    text = text.translate(str.maketrans("", "", string.punctuation))
    tokens = text.split()
    return [t for t in tokens if t and t not in _STOPWORDS]


def extract_key_tokens(text: str, top_n: int = 10) -> list[str]:
    """Extract the most frequent non-stopword tokens."""
    tokens = tokenize_simple(text)
    freq: dict[str, int] = {}
    for t in tokens:
        freq[t] = freq.get(t, 0) + 1
    sorted_tokens = sorted(freq.items(), key=lambda x: x[1], reverse=True)
    return [t for t, _ in sorted_tokens[:top_n]]
