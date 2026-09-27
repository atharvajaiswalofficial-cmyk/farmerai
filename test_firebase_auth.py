import urllib.request
import urllib.parse
import json

BASE_URL = "http://127.0.0.1:8000/api"

def make_request(path, method="GET", data=None, token=None):
    req = urllib.request.Request(f"{BASE_URL}{path}", method=method)
    req.add_header("Content-Type", "application/json")
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    body = json.dumps(data).encode("utf-8") if data else None
    try:
        with urllib.request.urlopen(req, data=body, timeout=5) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        error_body = None
        try:
            error_body = json.loads(e.read().decode("utf-8"))
        except Exception:
            pass
        return e.code, error_body

def run_auth_tests():
    print("=== TESTING FIREBASE AUTHENTICATION & PERMISSIONS ===")

    # 1. Unauthenticated access to /api/users/me -> 401
    status, _ = make_request("/users/me")
    assert status == 401, f"Expected 401, got {status}"
    print("[PASS] 1. Unauthenticated access to /users/me rejected with 401 Unauthorized")

    # 2. Authenticated user access (new user creation from token)
    user_token = "mock-user-token-user-991234"
    status, user_data = make_request("/users/me", token=user_token)
    assert status == 200, f"Expected 200, got {status}"
    assert user_data["firebase_uid"] == "user-991234"
    assert user_data["role"] == "user"
    local_user_id = user_data["id"]
    print(f"[PASS] 2. User successfully derived from Firebase token (users.id: {local_user_id}, role: {user_data['role']})")

    # 3. Existing user login loads existing profile
    status, existing_user = make_request("/users/me", token=user_token)
    assert status == 200
    assert existing_user["id"] == local_user_id
    print(f"[PASS] 3. Existing user profile recognized by firebase_uid without duplicating record")

    # 4. Chat history strictly linked to verified users.id
    chat_payload = {
        "message": "What is the deadline for PMFBY intimation?",
        "language": "en",
        "user_id": 999999  # Frontend attempts spoofing arbitrary user_id
    }
    status, chat_res = make_request("/chat", method="POST", data=chat_payload, token=user_token)
    assert status == 200
    # Verify in chat history
    status, hist = make_request("/chat/history", token=user_token)
    assert status == 200 and len(hist) > 0
    assert hist[0]["user_id"] == local_user_id, f"Expected {local_user_id}, got {hist[0]['user_id']}"
    print(f"[PASS] 4. Chat strictly attributed to verified users.id {local_user_id} (ignoring spoofed ID)")

    # 5. Grievance strictly linked to verified users.id
    grievance_payload = {
        "category": "Crop Insurance",
        "description": "Surveyor not dispatched after crop damage intimation.",
        "user_id": 888888  # Spoofed user_id
    }
    status, g_res = make_request("/grievance/draft", method="POST", data=grievance_payload, token=user_token)
    assert status == 200
    # Verify in grievances list
    status, g_list = make_request("/grievances", token=user_token)
    assert status == 200 and len(g_list) > 0
    assert g_list[0]["user_id"] == local_user_id, f"Expected {local_user_id}, got {g_list[0]['user_id']}"
    print(f"[PASS] 5. Grievance strictly attributed to verified users.id {local_user_id}")

    # 6. Normal user attempting admin API receives 403 Forbidden
    status, _ = make_request("/admin/stats", token=user_token)
    assert status == 403, f"Expected 403 Forbidden for normal user, got {status}"
    print("[PASS] 6. Normal user blocked from admin APIs with 403 Forbidden")

    # 7. Unauthenticated user attempting admin API receives 401 Unauthorized
    status, _ = make_request("/admin/stats")
    assert status == 401, f"Expected 401 Unauthorized, got {status}"
    print("[PASS] 7. Unauthenticated request to admin APIs blocked with 401 Unauthorized")

    # 8. Admin user accessing admin APIs succeeds
    admin_token = "mock-admin-token"
    status, admin_stats = make_request("/admin/stats", token=admin_token)
    assert status == 200, f"Expected 200 OK for admin user, got {status}"
    assert "totalUsers" in admin_stats and "questionsAsked" in admin_stats
    print(f"[PASS] 8. Admin account authorized to access /api/admin/stats: {admin_stats}")

    print("\n=== ALL 8 FIREBASE AUTHENTICATION & PERMISSION TESTS PASSED ===")

if __name__ == "__main__":
    run_auth_tests()
