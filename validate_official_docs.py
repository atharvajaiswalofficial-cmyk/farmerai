import os
import sys
import sqlite3
import urllib.request
import json

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))

from database import init_db, get_connection, get_documents

def validate_documents_setup():
    print("=== SAHAYAK AI OFFICIAL DOCUMENTS VALIDATION ===")
    
    # 1. Verify physical PDF files
    pmfby_pdf = os.path.join(os.path.dirname(__file__), "backend", "documents", "pmfby_operational_guidelines.pdf")
    pmkisan_pdf = os.path.join(os.path.dirname(__file__), "backend", "documents", "pmkisan_operational_guidelines.pdf")

    assert os.path.exists(pmfby_pdf), "pmfby_operational_guidelines.pdf does not exist!"
    with open(pmfby_pdf, "rb") as f:
        header = f.read(4)
        assert header == b"%PDF", f"pmfby_operational_guidelines.pdf is not a valid PDF! (header: {header})"
    size_pmfby = os.path.getsize(pmfby_pdf) / 1024
    print(f"[PASS] File 1: pmfby_operational_guidelines.pdf exists ({size_pmfby:.1f} KB) and is a valid PDF.")

    assert os.path.exists(pmkisan_pdf), "pmkisan_operational_guidelines.pdf does not exist!"
    with open(pmkisan_pdf, "rb") as f:
        header = f.read(4)
        assert header == b"%PDF", f"pmkisan_operational_guidelines.pdf is not a valid PDF! (header: {header})"
    size_pmkisan = os.path.getsize(pmkisan_pdf) / 1024
    print(f"[PASS] File 2: pmkisan_operational_guidelines.pdf exists ({size_pmkisan:.1f} KB) and is a valid PDF.")

    # 2. Verify Database Idempotent Seeding
    init_db()
    docs_first_run = get_documents()
    print(f"Total documents after init: {len(docs_first_run)}")
    
    # Check PMFBY and PM-KISAN metadata
    pmfby_meta = next((d for d in docs_first_run if d["title"] == "PMFBY Operational Guidelines"), None)
    assert pmfby_meta is not None, "PMFBY metadata not found in database!"
    assert pmfby_meta["file_path"] == "documents/pmfby_operational_guidelines.pdf"
    assert pmfby_meta["category"] == "PMFBY"
    assert pmfby_meta["source"] == "PMFBY Official Portal"
    print(f"[PASS] PMFBY metadata verified in database: {pmfby_meta}")

    pmkisan_meta = next((d for d in docs_first_run if d["title"] == "PM-KISAN Operational Guidelines"), None)
    assert pmkisan_meta is not None, "PM-KISAN metadata not found in database!"
    assert pmkisan_meta["file_path"] == "documents/pmkisan_operational_guidelines.pdf"
    assert pmkisan_meta["category"] == "PM-KISAN"
    assert pmkisan_meta["source"] == "PM-KISAN Official Portal"
    print(f"[PASS] PM-KISAN metadata verified in database: {pmkisan_meta}")

    # 3. Duplicate Protection Test: Re-run init_db 3 times
    init_db()
    init_db()
    init_db()
    docs_subsequent_runs = get_documents()
    assert len(docs_subsequent_runs) == len(docs_first_run), (
        f"Duplicate protection failed! Initial: {len(docs_first_run)}, after 3 re-inits: {len(docs_subsequent_runs)}"
    )
    print(f"[PASS] Duplicate protection verified: Exactly {len(docs_subsequent_runs)} documents preserved across re-inits.")

    # 4. Existing APIs validation (via running backend or test client)
    BASE_URL = "http://127.0.0.1:8000/api"
    def check_api(name, endpoint, method="GET", payload=None):
        req = urllib.request.Request(f"{BASE_URL}{endpoint}", method=method)
        req.add_header("Content-Type", "application/json")
        data = json.dumps(payload).encode("utf-8") if payload else None
        with urllib.request.urlopen(req, data=data, timeout=5) as r:
            assert r.status == 200, f"Endpoint {endpoint} failed with status {r.status}"
            body = json.loads(r.read().decode("utf-8"))
            print(f"[PASS] Existing API {method} {endpoint} functioning properly.")
            return body

    check_api("Chat", "/chat", "POST", {"message": "What is PMFBY?", "language": "en"})
    check_api("Schemes Search", "/schemes/search", "POST", {"user_type": "Farmer", "requirement": "Crop Insurance"})
    check_api("Grievance Guidance", "/grievance/guidance", "POST", {"category": "crop_insurance", "description": "Survey delayed."})
    check_api("Grievance Draft", "/grievance/draft", "POST", {"category": "Crop Insurance", "description": "Survey delayed."})
    check_api("Documents Endpoint", "/documents")

    print("=== ALL OFFICIAL DOCUMENT AND API VALIDATIONS COMPLETED SUCCESSFULLY ===")

if __name__ == "__main__":
    validate_documents_setup()
