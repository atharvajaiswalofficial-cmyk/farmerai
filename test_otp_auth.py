import urllib.request
import urllib.parse
import json
import time
import sqlite3
import os
import sys

# Ensure backend directory is in path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))

BASE_URL = "http://127.0.0.1:8000/api"
DB_PATH = os.path.join(os.path.dirname(__file__), "backend", "sahayak.db")

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

def get_latest_otp_salt(identifier):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    row = conn.execute("SELECT * FROM otp_verifications WHERE identifier = ? AND is_used = 0 ORDER BY created_at DESC LIMIT 1;", (identifier,)).fetchone()
    conn.close()
    return dict(row) if row else None

def set_otp_expired(identifier):
    conn = sqlite3.connect(DB_PATH)
    conn.execute("UPDATE otp_verifications SET expires_at = '2020-01-01 00:00:00' WHERE identifier = ? AND is_used = 0;", (identifier,))
    conn.commit()
    conn.close()

def run_otp_tests():
    print("=" * 70)
    print("RUNNING SAHAYAK AI - LOGIN + OTP AUTHENTICATION TEST SUITE")
    print("=" * 70)

    test_phone = "9876543210"

    # Clear old test data
    conn = sqlite3.connect(DB_PATH)
    conn.execute("DELETE FROM otp_verifications WHERE identifier IN (?, ?);", (test_phone, "farmer.rameshwar@example.com"))
    conn.commit()
    conn.close()

    # 1. Send OTP Request
    print("\n--- Test 1: Send OTP API (Valid Phone) ---")
    status, res = make_request("/auth/send-otp", method="POST", data={"identifier": test_phone})
    assert status == 200, f"Expected 200, got {status}: {res}"
    assert res["status"] == "success"
    assert res["message"] == "OTP sent successfully"
    assert "cooldown_seconds" in res
    assert "expires_in_seconds" in res
    # Ensure OTP is NEVER exposed in the API response
    assert "otp" not in res and "code" not in res
    print(f"[PASS] OTP requested successfully. Cooldown: {res['cooldown_seconds']}s, Expiry: {res['expires_in_seconds']}s")

    # 2. Resend Cooldown Enforcement (Immediate request within cooldown)
    print("\n--- Test 2: Resend Cooldown / Rate Limiting ---")
    status_cool, res_cool = make_request("/auth/send-otp", method="POST", data={"identifier": test_phone})
    assert status_cool in [400, 429], f"Expected 429 or 400, got {status_cool}: {res_cool}"
    assert "wait" in res_cool.get("detail", "").lower()
    print(f"[PASS] Resend rate-limiting enforced: '{res_cool.get('detail')}'")

    # 3. Wrong OTP Rejection & Max Attempt Tracking
    print("\n--- Test 3: Wrong OTP Rejection ---")
    status_wrong, res_wrong = make_request("/auth/verify-otp", method="POST", data={
        "identifier": test_phone,
        "otp": "000000" # Deliberately wrong OTP
    })
    assert status_wrong == 400
    assert "invalid" in res_wrong.get("detail", "").lower()
    print(f"[PASS] Wrong OTP rejected cleanly: '{res_wrong.get('detail')}'")

    # 4. Expired OTP Rejection
    print("\n--- Test 4: Expired OTP Rejection ---")
    set_otp_expired(test_phone)
    status_exp, res_exp = make_request("/auth/verify-otp", method="POST", data={
        "identifier": test_phone,
        "otp": "123456"
    })
    assert status_exp in [400, 410]
    assert "expired" in res_exp.get("detail", "").lower()
    print(f"[PASS] Expired OTP rejected: '{res_exp.get('detail')}'")

    # 5. Send Fresh OTP for Verification
    print("\n--- Test 5: Send Fresh OTP for Verification ---")
    conn = sqlite3.connect(DB_PATH)
    conn.execute("DELETE FROM otp_verifications WHERE identifier = ?;", (test_phone,))
    conn.commit()
    conn.close()

    status, res = make_request("/auth/send-otp", method="POST", data={"identifier": test_phone})
    assert status == 200

    from services.otp_service import hash_otp
    active_rec = get_latest_otp_salt(test_phone)
    assert active_rec is not None
    target_hash = active_rec["otp_hash"]
    target_salt = active_rec["salt"]
    
    valid_code = None
    for code_num in range(1000000):
        code_str = f"{code_num:06d}"
        if hash_otp(code_str, target_salt) == target_hash:
            valid_code = code_str
            break
    assert valid_code is not None, "Failed to match test OTP code"
    print(f"[INFO] Cryptographic hash verified for OTP code ({len(valid_code)} digits)")

    # 6. Correct OTP Verification & JWT Token Issuance
    print("\n--- Test 6: Verify Correct OTP & Issue JWT Session ---")
    status_verify, res_verify = make_request("/auth/verify-otp", method="POST", data={
        "identifier": test_phone,
        "otp": valid_code,
        "name": "Rameshwar Patel",
        "state": "Madhya Pradesh",
        "district": "Hoshangabad",
        "role": "farmer"
    })
    assert status_verify == 200
    assert res_verify["status"] == "success"
    assert "access_token" in res_verify
    assert res_verify["user"]["phone"] == test_phone
    auth_token = res_verify["access_token"]
    user_id = res_verify["user"]["id"]
    print(f"[PASS] Login successful! Token issued. User ID: {user_id}, Name: {res_verify['user']['name']}")

    # 7. Single-Use OTP Enforcement (Replaying same OTP must fail)
    print("\n--- Test 7: Single-Use OTP Enforcement ---")
    status_replay, res_replay = make_request("/auth/verify-otp", method="POST", data={
        "identifier": test_phone,
        "otp": valid_code
    })
    assert status_replay in [400, 410]
    print(f"[PASS] Replayed OTP rejected: '{res_replay.get('detail')}'")

    # 8. Session Persistence & User Profile Retrieval (/api/users/me)
    print("\n--- Test 8: Verify Authenticated Session with JWT ---")
    status_me, res_me = make_request("/users/me", token=auth_token)
    assert status_me == 200
    assert res_me["id"] == user_id
    assert res_me["phone"] == test_phone
    print(f"[PASS] /api/users/me returned authenticated user profile: {res_me['name']} ({res_me['phone']})")

    # 9. Email OTP Delivery Test
    print("\n--- Test 9: Email Identifier OTP Request ---")
    test_email = "farmer.rameshwar@example.com"
    status_email, res_email = make_request("/auth/send-otp", method="POST", data={"identifier": test_email})
    assert status_email == 200
    assert res_email["status"] == "success"
    print(f"[PASS] Email OTP generated & queued for delivery to {test_email}")

    print("\n" + "=" * 70)
    print("ALL 9 LOGIN + OTP AUTHENTICATION TESTS PASSED SUCCESSFULLY!")
    print("=" * 70)

if __name__ == "__main__":
    run_otp_tests()
