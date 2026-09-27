import math
import re
import hashlib
from typing import List

EMBEDDING_DIM = 128

def generate_multilingual_embedding(text: str) -> List[float]:
    """
    Generate normalized multilingual vector embedding supporting English, Hindi (Devanagari),
    and regional Indian scripts via n-gram hashed feature projection.
    """
    if not text:
        return [0.0] * EMBEDDING_DIM

    # Clean and tokenize
    clean_text = text.lower().strip()
    words = re.findall(r'[\w\u0900-\u097F]+', clean_text)
    
    vec = [0.0] * EMBEDDING_DIM
    
    # 1. Word tokens
    for w in words:
        h = int(hashlib.md5(w.encode('utf-8')).hexdigest(), 16)
        idx = h % EMBEDDING_DIM
        sign = 1.0 if ((h >> 8) & 1) else -1.0
        vec[idx] += sign * (1.0 + math.log(1 + len(w)))
        
    # 2. Character 3-grams for cross-lingual subword matching (e.g. Hinglish / transliteration)
    for i in range(len(clean_text) - 2):
        trigram = clean_text[i:i+3]
        h = int(hashlib.sha256(trigram.encode('utf-8')).hexdigest(), 16)
        idx = h % EMBEDDING_DIM
        sign = 1.0 if ((h >> 4) & 1) else -1.0
        vec[idx] += 0.5 * sign

    # L2 normalize
    norm = math.sqrt(sum(x * x for x in vec))
    if norm > 0:
        vec = [round(x / norm, 6) for x in vec]
        
    return vec

def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    """Compute cosine similarity between two unit vectors."""
    if not v1 or not v2 or len(v1) != len(v2):
        return 0.0
    return sum(a * b for a, b in zip(v1, v2))

def compute_semantic_distance(v1: List[float], v2: List[float]) -> float:
    """Convert similarity to distance (0.0 = identical, 1.0 = orthogonal)."""
    sim = cosine_similarity(v1, v2)
    return round(max(0.0, min(1.0, 1.0 - sim)), 4)
