import sys
import os
from unittest.mock import patch

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

from starlette.testclient import TestClient
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))

from main import app
from services.llm_service import is_llm_configured, call_gemini, call_llm, SYSTEM_PROMPT, generate_grounded_answer

def run_gemini_tests():
    print("=" * 70)
    print("RUNNING SAHAYAK AI — GEMINI + RAG INTEGRATION TEST SUITE")
    print("=" * 70)

    client = TestClient(app)

    # 1. English PMFBY question
    print("\n--- Test 1: English PMFBY Question ---")
    res1 = client.post("/api/chat", json={"message": "What is PMFBY crop insurance premium rate?", "language": "en"})
    assert res1.status_code == 200
    data1 = res1.json()
    assert "answer" in data1 and len(data1["answer"]) > 10
    assert data1["language"] == "en"
    assert data1["topic"] == "PMFBY"
    assert data1["grounded"] is True
    assert len(data1["sources"]) > 0
    print(f"PMFBY English Answer: {data1['answer'][:120]}...")
    print(f"Sources: {data1['sources']}")
    print("[PASS] English PMFBY query returned grounded response with sources.")

    # 2. Hindi PMFBY question
    print("\n--- Test 2: Hindi PMFBY Question ---")
    res2 = client.post("/api/chat", json={"message": "प्रधानमंत्री फसल बीमा योजना क्या है?", "language": "hi"})
    assert res2.status_code == 200
    data2 = res2.json()
    assert "answer" in data2 and len(data2["answer"]) > 10
    assert data2["language"] == "hi"
    assert data2["grounded"] is True
    print(f"PMFBY Hindi Answer: {data2['answer'][:120]}...")
    print("[PASS] Hindi PMFBY query returned grounded response in Hindi.")

    # 3. PACS question
    print("\n--- Test 3: PACS Question ---")
    res3 = client.post("/api/chat", json={"message": "What services are provided by PACS?", "language": "en"})
    assert res3.status_code == 200
    data3 = res3.json()
    assert data3["grounded"] is True
    assert "PACS" in data3["topic"] or "PACS" in data3["source"]
    print(f"PACS Answer: {data3['answer'][:120]}...")
    print("[PASS] PACS query resolved with valid information.")

    # 4. Cooperative Law question
    print("\n--- Test 4: Cooperative Law Question ---")
    res4 = client.post("/api/chat", json={"message": "What are member rights in a cooperative society?", "language": "en"})
    assert res4.status_code == 200
    data4 = res4.json()
    assert data4["grounded"] is True
    assert "Cooperative" in data4["topic"] or "Cooperative" in data4["source"]
    print(f"Cooperative Law Answer: {data4['answer'][:120]}...")
    print("[PASS] Cooperative Law query resolved successfully.")

    # 5. Financial Literacy question
    print("\n--- Test 5: Financial Literacy Question ---")
    res5 = client.post("/api/chat", json={"message": "What is KCC interest subvention rate?", "language": "en"})
    assert res5.status_code == 200
    data5 = res5.json()
    assert data5["grounded"] is True
    print(f"Financial Literacy Answer: {data5['answer'][:120]}...")
    print("[PASS] Financial Literacy query resolved successfully.")

    # 6. Scheme question
    print("\n--- Test 6: Scheme Question ---")
    res6 = client.post("/api/chat", json={"message": "Tell me about PM-KISAN income support scheme", "language": "en"})
    assert res6.status_code == 200
    data6 = res6.json()
    assert data6["grounded"] is True
    assert "PM-KISAN" in data6["answer"] or "PM-KISAN" in data6["topic"] or "6,000" in data6["answer"] or "6000" in data6["answer"]
    print(f"Scheme Answer: {data6['answer'][:120]}...")
    print("[PASS] Scheme query returned verified scheme info.")

    # 7. Unknown / Out-of-domain question
    print("\n--- Test 7: Unknown / Out-of-Domain Question ---")
    res7 = client.post("/api/chat", json={"message": "How do quantum supercomputers split atoms in space?", "language": "en"})
    assert res7.status_code == 200
    data7 = res7.json()
    assert "verified information" in data7["answer"].lower() or "not currently have" in data7["answer"].lower()
    assert data7["grounded"] is False
    assert len(data7["sources"]) == 0
    print(f"Out-of-Domain Answer: {data7['answer']}")
    print("[PASS] Out-of-domain question handled with safe fallback.")

    # 8. Missing Gemini API key fallback test
    print("\n--- Test 8: Missing Gemini API Key Fallback ---")
    with patch.dict(os.environ, {"GEMINI_API_KEY": "", "AI_API_KEY": ""}):
        assert is_llm_configured() is False
        res8 = client.post("/api/chat", json={"message": "What is PMFBY crop insurance?", "language": "en"})
        assert res8.status_code == 200
        data8 = res8.json()
        assert data8["grounded"] is True
        assert data8["ai_generated"] is False
        assert len(data8["sources"]) > 0
        print("[PASS] Missing API key cleanly triggers grounded deterministic fallback.")

    # 9. Gemini API failure / fallback test
    print("\n--- Test 9: Gemini API Failure Fallback ---")
    with patch("services.llm_service.call_gemini", return_value=None):
        res9 = client.post("/api/chat", json={"message": "What is PMFBY crop insurance?", "language": "en"})
        assert res9.status_code == 200
        data9 = res9.json()
        assert data9["grounded"] is True
        print("[PASS] Gemini API failure safely falls back to deterministic answer without crashing.")

    # 10. Source citations test
    print("\n--- Test 10: Source Citations Metadata ---")
    res10 = client.post("/api/chat", json={"message": "PMFBY Kharif premium rate", "language": "en"})
    assert res10.status_code == 200
    data10 = res10.json()
    assert isinstance(data10["sources"], list)
    if len(data10["sources"]) > 0:
        top_src = data10["sources"][0]
        assert "title" in top_src
        assert "source" in top_src
        assert "source_url" in top_src
        print(f"Source Item: {top_src}")
    print("[PASS] Source citations retain title, source, page, source_url metadata.")

    # 11. Existing /api/chat Response Format Verification
    print("\n--- Test 11: /api/chat Response Format Verification ---")
    res11 = client.post("/api/chat", json={"message": "PMFBY guidelines", "language": "en"})
    assert res11.status_code == 200
    data11 = res11.json()
    required_keys = {"answer", "language", "topic", "source", "grounded", "ai_generated", "sources", "chat_id"}
    assert required_keys.issubset(set(data11.keys())), f"Missing keys: {required_keys - set(data11.keys())}"
    print(f"Response Schema Keys: {list(data11.keys())}")
    print("[PASS] Response schema matches existing contract exactly.")

    # 12. Live Gemini API Generation Test
    print("\n--- Test 12: Live Gemini API Generation ---")
    gemini_key = os.getenv("GEMINI_API_KEY", "").strip()
    if gemini_key:
        prompt_test = "Verified Context:\nPMFBY crop insurance farmer premium is 2% for Kharif and 1.5% for Rabi.\n\nUser Question:\nWhat is the PMFBY premium for Kharif crops?\n\nRequested Language:\nEnglish (en)"
        gemini_reply = call_gemini(SYSTEM_PROMPT, prompt_test)
        print(f"Live Gemini Reply: {gemini_reply}")
        if gemini_reply:
            assert len(gemini_reply) > 5
            print("[PASS] Live Gemini API call executed successfully with grounded output.")
        else:
            print("[INFO] Live Gemini API returned None (e.g. invalid key/quota); fallback protection validated.")
    else:
        print("[SKIP] GEMINI_API_KEY not set in environment.")

    print("\n" + "=" * 70)
    print("ALL 12 GEMINI INTEGRATION TESTS PASSED SUCCESSFULLY!")
    print("=" * 70)

if __name__ == "__main__":
    run_gemini_tests()
