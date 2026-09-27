import os
from typing import List, Dict, Any
from rag.retrieval import retrieve_rag_chunks
from config import RAG_TOP_K, RAG_DISTANCE_THRESHOLD

def retrieve_context(
    query: str, 
    category: str = None, 
    top_k: int = RAG_TOP_K, 
    distance_threshold: float = RAG_DISTANCE_THRESHOLD
) -> List[Dict[str, Any]]:
    """Retrieve grounded chunks filtered by semantic distance threshold."""
    return retrieve_rag_chunks(query, category=category, top_k=top_k, distance_threshold=distance_threshold)

def build_rag_context(query: str, category: str = None, top_k: int = 2) -> Dict[str, Any]:
    """Build structured context string and sources list."""
    chunks = retrieve_context(query, category=category, top_k=top_k, distance_threshold=0.50)
    
    if not chunks:
        return {
            "has_context": False,
            "context_text": "",
            "sources": []
        }
        
    context_blocks = []
    sources = []
    for idx, c in enumerate(chunks, 1):
        block = f"SOURCE {idx}:\nTitle: {c['title']}\nCategory: {c['category']}\nPage: {c['page']}\nSource: {c['source']}\nURL: {c['source_url']}\nContent: {c['content']}"
        context_blocks.append(block)
        sources.append({
            "title": c["title"],
            "department": c.get("department", "Government of India"),
            "category": c["category"],
            "page": c["page"],
            "source": c["source"],
            "source_url": c["source_url"]
        })
        
    return {
        "has_context": True,
        "context_text": "\n\n".join(context_blocks),
        "sources": sources
    }
