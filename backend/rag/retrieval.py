from typing import List, Dict, Any

from database import get_document_chunks
from rag.embeddings import (
    generate_multilingual_embedding,
    compute_semantic_distance
)
from rag.reranking import rerank_chunks


# -------------------------------------------------------------------
# Domain keywords
# -------------------------------------------------------------------

DOMAIN_KEYWORDS = {
    "PMFBY": [
        "pmfby",
        "crop insurance",
        "crop insurance scheme",
        "fasal bima",
        "फसल बीमा",
        "फसल",
        "kharif",
        "खरीफ",
        "rabi",
        "रबी",
        "premium",
        "प्रीमियम",
        "claim",
        "क्लेम",
        "loss",
        "damage",
        "नुकसान",
        "बारिश",
        "बारिश से फसल",
    ],

    "PM-KISAN": [
        "pm-kisan",
        "pm kisan",
        "pmkisan",
        "samman nidhi",
        "सम्मान निधि",
        "किसान सम्मान निधि",
        "installment",
        "किस्त",
        "beneficiary",
        "लाभार्थी",
        "farmer payment",
        "किसान पैसा",
    ],

    "PACS": [
        "pacs",
        "primary agricultural credit society",
        "fertilizer",
        "fertiliser",
        "urea",
        "खाद",
        "उर्वरक",
        "बीज",
        "credit society",
        "agricultural credit",
    ],

    "Cooperative": [
        "cooperative",
        "co-operative",
        "cooperative society",
        "सहकारी",
        "सहकारी समिति",
        "समिति",
        "member",
        "सदस्य",
        "bylaw",
        "bye law",
        "bye-laws",
        "mscs",
        "multi state cooperative",
    ],

    "Financial Literacy": [
        "kcc",
        "kisan credit card",
        "किसान क्रेडिट कार्ड",
        "loan",
        "ऋण",
        "interest",
        "ब्याज",
        "credit",
        "subvention",
        "loan interest",
        "कर्ज",
        "कर्ज़",
    ],
}


# -------------------------------------------------------------------
# Clearly unrelated queries
# -------------------------------------------------------------------

OUT_OF_DOMAIN_TERMS = [
    "rocket",
    "mars",
    "quantum",
    "supercomputer",
    "atom",
    "black hole",
    "spacecraft",
    "bitcoin",
    "crypto",
    "cryptocurrency",
    "hollywood",
]


# -------------------------------------------------------------------
# Detect likely category
# -------------------------------------------------------------------

def detect_category(query: str, category: str = None) -> str:
    """
    Determine the likely RAG category from the user's query.

    Explicit category always takes priority.
    """

    if category:
        return category

    query_lower = query.lower()

    matches = []

    for category_name, keywords in DOMAIN_KEYWORDS.items():

        score = 0

        for keyword in keywords:
            if keyword.lower() in query_lower:
                score += 1

        if score > 0:
            matches.append((score, category_name))

    if not matches:
        return None

    # Highest keyword match wins
    matches.sort(reverse=True)

    return matches[0][1]


# -------------------------------------------------------------------
# Out-of-domain detection
# -------------------------------------------------------------------

def is_out_of_domain(query: str) -> bool:
    """
    Reject clearly unrelated questions.

    This is intentionally conservative.
    """

    query_lower = query.lower().strip()

    if not query_lower:
        return True

    for term in OUT_OF_DOMAIN_TERMS:
        if term in query_lower:
            return True

    return False


# -------------------------------------------------------------------
# Main RAG retrieval
# -------------------------------------------------------------------

def retrieve_rag_chunks(
    query: str,
    category: str = None,
    top_k: int = 5,
    distance_threshold: float = 0.45
) -> List[Dict[str, Any]]:
    """
    Semantic retrieval over official document chunks.

    IMPORTANT:
    This function does NOT inject hardcoded answers.

    The user's actual query is embedded and compared against
    the available document chunks.
    """

    # ---------------------------------------------------------------
    # Validate query
    # ---------------------------------------------------------------

    if not query or not query.strip():
        print("[RAG] Empty query.")
        return []

    query = query.strip()

    print(f"[RAG] Query: {query}")

    # ---------------------------------------------------------------
    # Out-of-domain check
    # ---------------------------------------------------------------

    if is_out_of_domain(query):
        print("[RAG] Query classified as clearly out-of-domain.")
        return []

    # ---------------------------------------------------------------
    # Detect category
    # ---------------------------------------------------------------

    detected_category = detect_category(
        query=query,
        category=category
    )

    print(f"[RAG] Requested category: {category}")
    print(f"[RAG] Detected category: {detected_category}")

    # ---------------------------------------------------------------
    # Load database chunks
    # ---------------------------------------------------------------

    try:
        # IMPORTANT:
        # Do NOT force a category filter here when category is not
        # explicitly supplied.
        #
        # Otherwise a query can accidentally search only one category.

        db_chunks = get_document_chunks(
            category=category,
            limit=500
        )

    except Exception as e:
        print(f"[RAG] Database retrieval error: {e}")
        return []

    if not db_chunks:
        print("[RAG] No document chunks found in database.")
        return []

    print(f"[RAG] Database chunks loaded: {len(db_chunks)}")

    # ---------------------------------------------------------------
    # Generate query embedding
    # ---------------------------------------------------------------

    try:
        query_embedding = generate_multilingual_embedding(query)

    except Exception as e:
        print(f"[RAG] Query embedding error: {e}")
        return []

    if not query_embedding:
        print("[RAG] Query embedding is empty.")
        return []

    # ---------------------------------------------------------------
    # Semantic similarity search
    # ---------------------------------------------------------------

    matched_chunks = []

    for chunk in db_chunks:

        if not chunk:
            continue

        content = chunk.get("content", "")

        if not content:
            continue

        # -----------------------------------------------------------
        # Optional category preference
        #
        # We DO NOT completely reject other categories here.
        # Semantic similarity should still decide relevance.
        # -----------------------------------------------------------

        chunk_category = chunk.get("category", "")

        # -----------------------------------------------------------
        # Existing embedding
        # -----------------------------------------------------------

        chunk_embedding = chunk.get("embedding")

        try:

            if not chunk_embedding:

                chunk_embedding = generate_multilingual_embedding(
                    content
                )

            if not chunk_embedding:
                continue

            distance = compute_semantic_distance(
                query_embedding,
                chunk_embedding
            )

        except Exception as e:
            print(
                f"[RAG] Embedding comparison failed "
                f"for chunk: {e}"
            )
            continue

        # -----------------------------------------------------------
        # Distance filtering
        # -----------------------------------------------------------

        if distance > distance_threshold:
            continue

        # -----------------------------------------------------------
        # Build normalized chunk
        # -----------------------------------------------------------

        normalized_chunk = {
            "title": chunk.get(
                "document_name",
                chunk.get("title", "Official Document")
            ),

            "category": chunk_category,

            "department": chunk.get(
                "department",
                "Government of India"
            ),

            "page": chunk.get(
                "page_number",
                chunk.get("page", "N/A")
            ),

            "source": chunk.get(
                "department",
                chunk.get("source", "Official Government Source")
            ),

            "source_url": chunk.get(
                "source_url",
                ""
            ),

            "content": content,

            "distance": float(distance),
        }

        # -----------------------------------------------------------
        # Category preference
        #
        # If the query clearly belongs to a category, slightly
        # improve ranking for matching documents.
        #
        # We DO NOT replace their actual semantic distance.
        # -----------------------------------------------------------

        if detected_category:

            if chunk_category:
                if detected_category.lower() in str(
                    chunk_category
                ).lower():
                    normalized_chunk["category_match"] = True
                else:
                    normalized_chunk["category_match"] = False
            else:
                normalized_chunk["category_match"] = False

        else:
            normalized_chunk["category_match"] = False

        matched_chunks.append(normalized_chunk)

    # ---------------------------------------------------------------
    # Nothing relevant found
    # ---------------------------------------------------------------

    if not matched_chunks:
        print(
            f"[RAG] No chunks passed distance threshold "
            f"{distance_threshold}."
        )

        return []

    # ---------------------------------------------------------------
    # Remove duplicates
    # ---------------------------------------------------------------

    unique_chunks = []

    seen = set()

    for chunk in matched_chunks:

        content_key = (
            chunk.get("title", ""),
            chunk.get("page", ""),
            chunk.get("content", "")[:300]
        )

        if content_key in seen:
            continue

        seen.add(content_key)
        unique_chunks.append(chunk)

    matched_chunks = unique_chunks

    # ---------------------------------------------------------------
    # Sort by semantic distance first
    # ---------------------------------------------------------------

    matched_chunks.sort(
        key=lambda x: x.get("distance", 999)
    )

    print(
        f"[RAG] {len(matched_chunks)} chunks passed "
        f"semantic filtering."
    )

    # ---------------------------------------------------------------
    # Show top candidates for debugging
    # ---------------------------------------------------------------

    for index, chunk in enumerate(
        matched_chunks[:10],
        start=1
    ):

        print(
            f"[RAG] Candidate {index}: "
            f"{chunk.get('title')} | "
            f"category={chunk.get('category')} | "
            f"distance={chunk.get('distance'):.4f}"
        )

    # ---------------------------------------------------------------
    # Reranking
    # ---------------------------------------------------------------

    try:

        reranked = rerank_chunks(
            query,
            matched_chunks,
            top_k=top_k
        )

    except Exception as e:

        print(f"[RAG] Reranking error: {e}")

        # Safe fallback:
        # use semantic ranking if reranker fails.

        reranked = matched_chunks[:top_k]

    # ---------------------------------------------------------------
    # Final result
    # ---------------------------------------------------------------

    if not reranked:
        print("[RAG] Reranker returned no results.")
        return []

    print(
        f"[RAG] Final retrieved chunks: "
        f"{len(reranked)}"
    )

    for index, chunk in enumerate(
        reranked,
        start=1
    ):

        print(
            f"[RAG] Final {index}: "
            f"{chunk.get('title')} | "
            f"distance={chunk.get('distance', 'N/A')}"
        )

    return reranked
