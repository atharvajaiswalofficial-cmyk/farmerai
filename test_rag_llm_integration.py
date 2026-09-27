import sys
import os
try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

from starlette.testclient import TestClient
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))

from main import app
from services.rag_service import retrieve_context, build_rag_context
from services.llm_service import is_llm_configured, SYSTEM_PROMPT, build_user_prompt
from services.intent_service import detect_language

def run_integration_tests():
    print("=" * 70)
    print("RUNNING SAHAYAK AI RAG + LLM INTEGRATION TEST SUITE")
    print("=" * 70)

    # 1. Test Distance Thresholding
    print("\n--- 1. Testing RAG Distance Threshold Filtering ---")
    relevant = retrieve_context("What is the PMFBY premium rate for Kharif?", category="PMFBY", top_k=3, distance_threshold=0.45)
    print(f"Relevant query chunks retrieved (threshold=0.45): {len(relevant)}")
    assert len(relevant) > 0, "Expected at least 1 relevant chunk for PMFBY"
    for c in relevant:
        assert c["distance"] <= 0.45, f"Chunk distance {c['distance']} exceeds threshold 0.45"
    print(f"[PASS] Relevant chunks within distance threshold (Top distance: {round(relevant[0]['distance'], 4)})")

    # Test unrelated query with strict threshold
    irrelevant = retrieve_context("How to build a rocket engine to fly to mars?", top_k=3, distance_threshold=0.35)
    print(f"Irrelevant query chunks retrieved (threshold=0.35): {len(irrelevant)}")
    assert len(irrelevant) == 0, "Expected 0 chunks for completely unrelated inquiry"
    print("[PASS] Irrelevant query filtered out by distance threshold.")

    # 2. Test Context Building Format (Rule 6)
    print("\n--- 2. Testing Context Building Format ---")
    rag_ctx = build_rag_context("What is PMFBY crop insurance?", category="PMFBY", top_k=2)
    assert rag_ctx["has_context"] is True
    assert "SOURCE 1" in rag_ctx["context_text"]
    assert "Title: PMFBY Operational Guidelines" in rag_ctx["context_text"]
    assert "Category: PMFBY" in rag_ctx["context_text"]
    assert "Page:" in rag_ctx["context_text"]
    assert "URL:" in rag_ctx["context_text"]
    assert "Content:" in rag_ctx["context_text"]
    print("[PASS] Context text formatted with Title, Category, Page, Source, URL, Content.")

    # 3. Test Structured Sources Array (Rule 11 & 12)
    print("\n--- 3. Testing Structured Sources Array ---")
    assert len(rag_ctx["sources"]) > 0
    top_source = rag_ctx["sources"][0]
    print("Source item structure:", top_source)
    assert "title" in top_source
    assert "page" in top_source
    assert "source" in top_source
    assert "source_url" in top_source
    assert top_source["page"] is not None
    print("[PASS] Structured sources metadata array properly formatted.")

    # 4. Test LLM Service Prompts (Rule 7 & 8)
    print("\n--- 4. Testing LLM Service Prompts ---")
    assert "You are Sahayak AI" in SYSTEM_PROMPT
    assert "Answer using ONLY the verified context provided to you" in SYSTEM_PROMPT
    assert "Do not invent government schemes" in SYSTEM_PROMPT
    assert "Always answer in the requested language" in SYSTEM_PROMPT
    user_prompt_hi = build_user_prompt(rag_ctx["context_text"], "पीएमएफबीवाई क्या है?", "hi")
    assert "Requested Language:\nHindi (hi)" in user_prompt_hi
    print(f"LLM Configured: {is_llm_configured()}")
    print("[PASS] LLM System and User Prompts adhere strictly to grounding specifications.")

    # 5. Test Language Detection (Rule 10)
    print("\n--- 5. Testing Language Detection ---")
    assert detect_language("फसल बीमा की अंतिम तिथि क्या है?") == "hi"
    assert detect_language("PMFBY kya hai?") == "hi"
    assert detect_language("What is the insurance compensation process?") == "en"
    print("[PASS] Devanagari, Hinglish, and English accurately detected.")

    client = TestClient(app)

    # 6. Test Chat API Response Structure (Rule 11) - PMFBY
    print("\n--- 6. Testing /api/chat with PMFBY (RAG Enabled) ---")
    res = client.post("/api/chat", json={"message": "What is PMFBY crop insurance?", "language": "en"})
    assert res.status_code == 200
    data = res.json()
    print("Response fields:", list(data.keys()))
    assert "answer" in data and len(data["answer"]) > 20
    assert data.get("grounded") is True
    assert "ai_generated" in data
    assert isinstance(data.get("sources"), list) and len(data["sources"]) > 0
    assert data["sources"][0].get("title") == "PMFBY Operational Guidelines"
    assert data["sources"][0].get("page") is not None
    assert data["sources"][0].get("source_url") == "https://pmfby.gov.in"
    print(f"PMFBY Answer: {data['answer'][:120]}...")
    print(f"Sources: {data['sources']}")
    print("[PASS] PMFBY chat response matches grounded RAG schema.")

    # 7. Test Multilingual Hindi Response
    print("\n--- 7. Testing /api/chat with Hindi Language ---")
    res_hi = client.post("/api/chat", json={"message": "फसल बीमा योजना के तहत क्लेम कैसे करें?", "language": "hi"})
    assert res_hi.status_code == 200
    data_hi = res_hi.json()
    assert data_hi["language"] == "hi"
    assert data_hi["grounded"] is True
    print(f"Hindi Answer: {data_hi['answer'][:120]}...")
    print("[PASS] Multilingual response generated in Hindi.")

    # 8. Test Structured Knowledge Fallback (PACS)
    print("\n--- 8. Testing /api/chat with PACS (Structured Knowledge) ---")
    res_pacs = client.post("/api/chat", json={"message": "How does a PACS credit society work?", "language": "en"})
    assert res_pacs.status_code == 200
    data_pacs = res_pacs.json()
    assert data_pacs.get("grounded") is True
    assert isinstance(data_pacs.get("ai_generated"), bool)
    assert len(data_pacs.get("sources", [])) > 0
    assert "PACS" in data_pacs["sources"][0]["title"]
    print(f"PACS Answer: {data_pacs['answer'][:120]}...")
    print(f"PACS Source: {data_pacs['sources']}")
    print("[PASS] Structured knowledge fallback response matches schema.")

    # 9. Test Irrelevant / Unknown Inquiry Fallback (Rule 5)
    print("\n--- 9. Testing /api/chat with Completely Unrelated Inquiry ---")
    res_unknown = client.post("/api/chat", json={"message": "How do quantum supercomputers split atoms in space?", "language": "en"})
    assert res_unknown.status_code == 200
    data_unknown = res_unknown.json()
    assert "I don't currently have verified information about this topic" in data_unknown["answer"]
    assert data_unknown.get("grounded") is False
    assert data_unknown.get("ai_generated") is False
    assert len(data_unknown.get("sources", [])) == 0
    print(f"Unknown Query Response: {data_unknown['answer']}")
    print("[PASS] Unrelated inquiry cleanly returns safe fallback with grounded=False.")

    # 10. Test Active LLM Generation with Mock Provider (Rule 2, 7, 8, 11)
    print("\n--- 10. Testing Active LLM Generation Flow ---")
    from unittest.mock import patch
    with patch("services.llm_service.is_llm_configured", return_value=True), \
         patch("services.llm_service.call_llm", return_value="Under PMFBY, maximum farmer premium is capped at 2% for Kharif crops.") as mock_call:
        res_llm = client.post("/api/chat", json={"message": "What is the PMFBY premium for Kharif?", "language": "en"})
        assert res_llm.status_code == 200
        data_llm = res_llm.json()
        assert data_llm["ai_generated"] is True
        assert data_llm["grounded"] is True
        assert len(data_llm["sources"]) > 0
        assert "maximum farmer premium is capped at 2%" in data_llm["answer"]
        mock_call.assert_called_once()
        print(f"LLM Answer: {data_llm['answer']}")
        print(f"ai_generated: {data_llm['ai_generated']}, grounded: {data_llm['grounded']}")
        print("[PASS] Active LLM generation returns ai_generated=True, grounded=True, and valid sources.")

    print("\n" + "=" * 70)
    print("ALL RAG + LLM INTEGRATION TESTS PASSED SUCCESSFULLY!")
    print("=" * 70)

if __name__ == "__main__":
    run_integration_tests()
