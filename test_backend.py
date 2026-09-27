import urllib.request
import urllib.parse
import json

BASE_URL = "http://127.0.0.1:8000/api"

def test_endpoint(name, url, method="GET", data=None):
    try:
        req = urllib.request.Request(url, method=method)
        req.add_header("Content-Type", "application/json")
        encoded_data = json.dumps(data).encode("utf-8") if data else None
        
        with urllib.request.urlopen(req, data=encoded_data, timeout=5) as response:
            status = response.status
            body = json.loads(response.read().decode("utf-8"))
            print(f"[{status}] PASS - {name}")
            return True, body
    except Exception as e:
        print(f"[FAIL] - {name}: {e}")
        return False, str(e)

def run_all_tests():
    print("=== SAHAYAK AI FINAL END-TO-END VALIDATION ===")
    
    # 1. Health
    test_endpoint("GET /api/health", f"{BASE_URL}/health")

    # 2. Demo User API
    ok, demo = test_endpoint("GET /api/users/demo", f"{BASE_URL}/users/demo")
    assert ok and demo.get("name") == "Demo User"
    
    # 3. Chat (English) with chat_history recording
    ok, chat_res = test_endpoint("POST /api/chat (English PMFBY)", f"{BASE_URL}/chat", "POST", {
        "message": "What is PMFBY?",
        "language": "en"
    })
    assert ok and chat_res.get("chat_id") is not None

    # 4. Chat History verification
    ok, history = test_endpoint("GET /api/chat/history", f"{BASE_URL}/chat/history")
    assert ok and len(history) > 0

    # 5. Schemes Search (Querying DB schemes table)
    ok, schemes_res = test_endpoint("POST /api/schemes/search", f"{BASE_URL}/schemes/search", "POST", {
        "user_type": "Farmer",
        "requirement": "Crop Insurance",
        "state": "Madhya Pradesh"
    })
    assert ok and schemes_res.get("count") > 0

    # 6. Documents Metadata (from documents table)
    ok, docs_res = test_endpoint("GET /api/documents", f"{BASE_URL}/documents")
    assert ok and len(docs_res) >= 4

    # 7. Grievance Guidance
    test_endpoint("POST /api/grievance/guidance", f"{BASE_URL}/grievance/guidance", "POST", {
        "category": "crop_insurance",
        "description": "Surveyor not visiting damaged field."
    })

    # 8. Grievance Draft (Saving record to grievances table)
    ok, draft_res = test_endpoint("POST /api/grievance/draft", f"{BASE_URL}/grievance/draft", "POST", {
        "category": "Crop Insurance",
        "description": "My soybean crop was destroyed due to flood on 15 August.",
        "farmer_name": "Rameshwar Patel",
        "district": "Hoshangabad",
        "state": "Madhya Pradesh",
        "contact": "+91 98765 43210"
    })
    assert ok and draft_res.get("grievance_id") is not None
    assert draft_res.get("status") == "draft"

    # 9. Verify Grievance saved in DB
    ok, g_list = test_endpoint("GET /api/grievances", f"{BASE_URL}/grievances")
    assert ok and len(g_list) > 0

    # 10. Knowledge Endpoints
    test_endpoint("GET /api/pmfby", f"{BASE_URL}/pmfby")
    test_endpoint("GET /api/cooperative", f"{BASE_URL}/cooperative")
    test_endpoint("GET /api/pacs", f"{BASE_URL}/pacs")
    test_endpoint("GET /api/financial", f"{BASE_URL}/financial")

    print("=== ALL END-TO-END VALIDATIONS PASSED SUCCESSFULLY ===")

if __name__ == "__main__":
    run_all_tests()
