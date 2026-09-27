import re
from typing import List, Dict, Any

def score_lexical_overlap(query: str, text: str) -> float:
    """Compute lexical term overlap score."""
    q_words = set(re.findall(r'[\w\u0900-\u097F]+', query.lower()))
    if not q_words:
        return 0.0
    t_words = set(re.findall(r'[\w\u0900-\u097F]+', text.lower()))
    overlap = len(q_words.intersection(t_words))
    return overlap / len(q_words)

def rerank_chunks(query: str, chunks: List[Dict[str, Any]], top_k: int = 5) -> List[Dict[str, Any]]:
    """
    Rerank retrieved chunks by blending vector similarity distance and lexical keyword relevance.
    """
    scored = []
    for c in chunks:
        lexical = score_lexical_overlap(query, c.get("content", ""))
        distance = c.get("distance", 0.5)
        # Higher score is better: (1 - distance) * 0.6 + lexical * 0.4
        composite_score = (1.0 - distance) * 0.6 + (lexical * 0.4)
        scored.append({
            **c,
            "composite_score": round(composite_score, 4)
        })

    # Sort descending by composite score
    scored.sort(key=lambda x: x["composite_score"], reverse=True)
    return scored[:top_k]
