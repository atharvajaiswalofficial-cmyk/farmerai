from typing import List, Dict, Any

from rag.retrieval import retrieve_rag_chunks
from config import RAG_TOP_K, RAG_DISTANCE_THRESHOLD


def retrieve_context(
    query: str,
    category: str = None,
    top_k: int = RAG_TOP_K,
    distance_threshold: float = RAG_DISTANCE_THRESHOLD
) -> List[Dict[str, Any]]:
    """
    Retrieve relevant RAG chunks for the user's actual query.

    The query is passed directly to the semantic retrieval layer.
    Results are filtered using the configured distance threshold.
    """

    if not query or not query.strip():
        return []

    query = query.strip()

    try:
        chunks = retrieve_rag_chunks(
            query=query,
            category=category,
            top_k=top_k,
            distance_threshold=distance_threshold
        )

        if not chunks:
            return []

        return chunks

    except Exception as e:
        print(f"[RAG SERVICE] Retrieval error: {e}")
        return []


def build_rag_context(
    query: str,
    category: str = None,
    top_k: int = None
) -> Dict[str, Any]:
    """
    Build structured RAG context and source metadata.

    Important:
    - Uses the user's actual query.
    - Does not use a hardcoded distance threshold.
    - Uses RAG_TOP_K from config unless top_k is explicitly supplied.
    - Returns an empty context when no relevant documents are found.
    """

    if not query or not query.strip():
        return {
            "has_context": False,
            "context_text": "",
            "sources": []
        }

    query = query.strip()

    # Use configured value unless explicitly provided
    if top_k is None:
        top_k = RAG_TOP_K

    # Safety check
    try:
        top_k = max(1, int(top_k))
    except (TypeError, ValueError):
        top_k = RAG_TOP_K

    print(
        f"[RAG SERVICE] Query: '{query}' | "
        f"Category: '{category}' | "
        f"Top K: {top_k} | "
        f"Threshold: {RAG_DISTANCE_THRESHOLD}"
    )

    chunks = retrieve_context(
        query=query,
        category=category,
        top_k=top_k,
        distance_threshold=RAG_DISTANCE_THRESHOLD
    )

    if not chunks:
        print("[RAG SERVICE] No relevant context found.")

        return {
            "has_context": False,
            "context_text": "",
            "sources": []
        }

    print(f"[RAG SERVICE] Retrieved {len(chunks)} relevant chunks.")

    context_blocks = []
    sources = []

    for idx, chunk in enumerate(chunks, 1):

        # Safely extract fields
        title = chunk.get("title", "Unknown")
        category_value = chunk.get("category", "General")
        page = chunk.get("page", "N/A")
        source = chunk.get("source", "Unknown")
        source_url = chunk.get("source_url", "")
        content = chunk.get("content", "")
        department = chunk.get(
            "department",
            "Government of India"
        )

        # Ignore completely empty chunks
        if not content or not str(content).strip():
            continue

        block = (
            f"SOURCE {idx}:\n"
            f"Title: {title}\n"
            f"Category: {category_value}\n"
            f"Page: {page}\n"
            f"Source: {source}\n"
            f"URL: {source_url}\n"
            f"Content: {content}"
        )

        context_blocks.append(block)

        sources.append({
            "title": title,
            "department": department,
            "category": category_value,
            "page": page,
            "source": source,
            "source_url": source_url
        })

    # If all retrieved chunks were empty
    if not context_blocks:
        print("[RAG SERVICE] Retrieved chunks contained no usable content.")

        return {
            "has_context": False,
            "context_text": "",
            "sources": []
        }

    context_text = "\n\n".join(context_blocks)

    return {
        "has_context": True,
        "context_text": context_text,
        "sources": sources
    }
