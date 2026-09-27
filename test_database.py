import sqlite3
import os
import sys

# Ensure backend directory is in path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))

from database import (
    init_db,
    get_connection,
    get_demo_user,
    create_user,
    get_user,
    save_chat,
    get_chat_history,
    search_schemes,
    get_schemes,
    create_document,
    get_documents,
    create_grievance,
    get_grievances,
    update_grievance_status
)

def test_database_layer():
    print("=== TESTING SAHAYAK AI DATABASE LAYER ===")
    
    # 1. Initialize Database
    init_db()
    conn = get_connection()
    cursor = conn.cursor()

    # 2. Check Tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = [r[0] for r in cursor.fetchall()]
    print(f"Tables present: {tables}")

    required_tables = ["users", "chat_history", "schemes", "documents", "grievances"]
    for t in required_tables:
        assert t in tables, f"Missing table: {t}"
    print("[PASS] All 5 required tables exist!")

    # 3. Test Foreign Key Enforcement
    cursor.execute("PRAGMA foreign_keys;")
    fk_status = cursor.fetchone()[0]
    print(f"Foreign Keys Enabled: {bool(fk_status)}")
    assert fk_status == 1, "Foreign keys are not enabled!"
    print("[PASS] Foreign key constraints active!")

    # 4. Test Demo User
    demo = get_demo_user()
    print(f"Demo User: {demo}")
    assert demo is not None
    assert demo["name"] == "Demo User"
    assert demo["phone"] == "9999999999"
    print("[PASS] Demo user created & fetched successfully!")

    # 5. Test Chat History (Relationship to User)
    chat = save_chat(demo["id"], "What is PMFBY?", "PMFBY is a crop insurance scheme.")
    print(f"Saved Chat: {chat}")
    assert chat["user_id"] == demo["id"]
    
    history = get_chat_history(demo["id"])
    assert len(history) > 0
    assert history[0]["question"] == "What is PMFBY?"
    print("[PASS] Chat history recorded and linked to user_id!")

    # 6. Test Schemes Seed & Search
    all_schemes = get_schemes()
    print(f"Schemes count: {len(all_schemes)}")
    assert len(all_schemes) >= 8, f"Expected at least 8 seeded schemes, got {len(all_schemes)}"
    
    # Search scheme
    search_res = search_schemes(user_type="Farmer", requirement="Crop Insurance", state="All India")
    print(f"Search results for Crop Insurance: {len(search_res)}")
    assert any("pmfby" in s["name"].lower() for s in search_res)
    print("[PASS] Schemes table seeded and searched successfully!")

    # 7. Test Documents Table
    docs = get_documents()
    print(f"Documents count: {len(docs)}")
    assert len(docs) >= 4
    print("[PASS] Documents metadata table verified!")

    # 8. Test Grievances (Relationship to User)
    grievance = create_grievance(
        user_id=demo["id"],
        category="crop_insurance",
        description="Delayed survey after hailstorm loss.",
        status="draft"
    )
    print(f"Created Grievance: {grievance}")
    assert grievance["user_id"] == demo["id"]
    assert grievance["status"] == "draft"

    # Update status
    updated_g = update_grievance_status(grievance["id"], "in_progress")
    assert updated_g["status"] == "in_progress"
    
    g_list = get_grievances(demo["id"])
    assert len(g_list) > 0
    print("[PASS] Grievances stored and status updated successfully!")

    conn.close()
    print("=== ALL DATABASE UNIT TESTS PASSED ===")

if __name__ == "__main__":
    test_database_layer()
