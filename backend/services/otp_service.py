import os
import secrets
import string
import hashlib
import time
import smtplib
import urllib.request
import urllib.parse
import json
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
from database import get_connection

logger = logging.getLogger("sahayak.otp")
logging.basicConfig(level=logging.INFO)

OTP_EXPIRY_MINUTES = int(os.getenv("OTP_EXPIRY_MINUTES", "5"))
OTP_RESEND_COOLDOWN_SECONDS = int(os.getenv("OTP_RESEND_COOLDOWN_SECONDS", "60"))
MAX_OTP_ATTEMPTS = int(os.getenv("MAX_OTP_ATTEMPTS", "3"))

def hash_otp(otp: str, salt: str) -> str:
    """Hash OTP with salt using SHA-256."""
    return hashlib.sha256((otp + salt).encode("utf-8")).hexdigest()

def generate_secure_otp(length: int = 6) -> str:
    """Generate cryptographically secure numeric OTP."""
    digits = string.digits
    return "".join(secrets.choice(digits) for _ in range(length))

def is_email(identifier: str) -> bool:
    """Check if identifier is an email address."""
    return "@" in identifier and "." in identifier

def clean_phone(phone: str) -> str:
    """Standardize phone number to 10 digits for Indian numbers."""
    cleaned = "".join(c for c in phone if c.isdigit())
    if len(cleaned) > 10 and cleaned.startswith("91"):
        cleaned = cleaned[2:]
    return cleaned

def send_via_fast2sms(phone: str, otp: str) -> bool:
    """Send OTP via Fast2SMS Quick OTP API."""
    api_key = os.getenv("FAST2SMS_API_KEY", "").strip()
    if not api_key:
        raise ValueError("FAST2SMS_API_KEY is not configured in .env")
    
    clean_num = clean_phone(phone)
    url = "https://www.fast2sms.com/dev/bulkV2"
    headers = {
        "authorization": api_key,
        "Content-Type": "application/x-www-form-urlencoded"
    }
    data = urllib.parse.urlencode({
        "variables_values": otp,
        "route": "otp",
        "numbers": clean_num
    }).encode("utf-8")
    
    req = urllib.request.Request(url, data=data, headers=headers)
    with urllib.request.urlopen(req, timeout=10) as response:
        res_data = json.loads(response.read().decode("utf-8"))
        if res_data.get("return") is True:
            logger.info("Fast2SMS OTP sent successfully to %s", clean_num[-4:].rjust(len(clean_num), '*'))
            return True
        else:
            msg = res_data.get("message", ["Delivery failed"])[0] if isinstance(res_data.get("message"), list) else str(res_data.get("message"))
            raise RuntimeError(f"Fast2SMS error: {msg}")

def send_via_twilio(phone: str, otp: str) -> bool:
    """Send OTP via Twilio REST API."""
    account_sid = os.getenv("TWILIO_ACCOUNT_SID", "").strip()
    auth_token = os.getenv("TWILIO_AUTH_TOKEN", "").strip()
    from_number = os.getenv("TWILIO_PHONE_NUMBER", "").strip()
    
    if not account_sid or not auth_token or not from_number:
        raise ValueError("Twilio credentials (ACCOUNT_SID, AUTH_TOKEN, PHONE_NUMBER) are not configured in .env")
    
    # Ensure E.164 format
    to_number = phone.strip()
    if not to_number.startswith("+"):
        clean_num = clean_phone(to_number)
        to_number = f"+91{clean_num}" if len(clean_num) == 10 else f"+{clean_num}"
        
    url = f"https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Messages.json"
    
    # Twilio HTTP Basic Auth
    import base64
    auth_str = f"{account_sid}:{auth_token}"
    auth_header = "Basic " + base64.b64encode(auth_str.encode("ascii")).decode("ascii")
    
    data = urllib.parse.urlencode({
        "To": to_number,
        "From": from_number,
        "Body": f"Your Sahayak AI verification code is {otp}. Valid for {OTP_EXPIRY_MINUTES} minutes. Do not share this OTP with anyone."
    }).encode("utf-8")
    
    req = urllib.request.Request(url, data=data, headers={"Authorization": auth_header})
    with urllib.request.urlopen(req, timeout=10) as response:
        if response.status in [200, 201]:
            logger.info("Twilio OTP sent successfully to %s", to_number[-4:].rjust(len(to_number), '*'))
            return True
        else:
            raise RuntimeError(f"Twilio returned status {response.status}")

def send_via_smtp(email: str, otp: str) -> bool:
    """Send OTP via SMTP Email."""
    smtp_host = os.getenv("SMTP_HOST", "").strip()
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER", "").strip()
    smtp_password = os.getenv("SMTP_PASSWORD", "").strip()
    smtp_from = os.getenv("SMTP_FROM_EMAIL", smtp_user).strip()
    
    if not smtp_host or not smtp_user or not smtp_password:
        raise ValueError("SMTP credentials (SMTP_HOST, SMTP_USER, SMTP_PASSWORD) are not configured in .env")
    
    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"Sahayak AI Verification Code: {otp}"
    msg["From"] = f"Sahayak AI <{smtp_from}>"
    msg["To"] = email
    
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #16a34a; text-align: center;">Sahayak AI (सहायक AI)</h2>
        <p style="font-size: 16px; color: #334155;">Hello,</p>
        <p style="font-size: 15px; color: #334155;">Your verification code to log in to Sahayak AI is:</p>
        <div style="background-color: #f0fdf4; border: 2px dashed #16a34a; border-radius: 8px; text-align: center; padding: 15px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #15803d;">{otp}</span>
        </div>
        <p style="font-size: 14px; color: #64748b;">This OTP is valid for <strong>{OTP_EXPIRY_MINUTES} minutes</strong>. Please do not share this code with anyone.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #94a3b8; text-align: center;">Empowering Indian Farmers & Rural Cooperatives</p>
    </div>
    """
    msg.attach(MIMEText(html, "html"))
    
    server = smtplib.SMTP(smtp_host, smtp_port, timeout=10)
    server.starttls()
    server.login(smtp_user, smtp_password)
    server.sendmail(smtp_from, [email], msg.as_string())
    server.quit()
    logger.info("SMTP Email OTP sent successfully to %s", email)
    return True

def dispatch_otp(identifier: str, otp: str):
    """Dispatch OTP through configured provider with fallback."""
    provider = os.getenv("OTP_PROVIDER", "").lower().strip()
    
    # 1. Email identifier -> SMTP
    if is_email(identifier):
        if provider == "smtp" or os.getenv("SMTP_HOST"):
            send_via_smtp(identifier, otp)
            return
        else:
            # Fallback dev logging
            logger.info("[DEV CONSOLE OTP] Email OTP for %s: %s", identifier, otp)
            return
            
    # 2. Phone identifier -> Fast2SMS, Twilio, or Dev Console
    if provider == "fast2sms":
        send_via_fast2sms(identifier, otp)
    elif provider == "twilio":
        send_via_twilio(identifier, otp)
    elif os.getenv("FAST2SMS_API_KEY"):
        send_via_fast2sms(identifier, otp)
    elif os.getenv("TWILIO_ACCOUNT_SID") and os.getenv("TWILIO_AUTH_TOKEN"):
        send_via_twilio(identifier, otp)
    else:
        # Development / Default mode: Log securely to backend server terminal
        logger.info("[DEV CONSOLE OTP] SMS OTP for %s: %s (Valid for %d min)", identifier, otp, OTP_EXPIRY_MINUTES)

def create_and_send_otp(identifier: str) -> dict:
    """Generate, store, and dispatch OTP with cooldown enforcement."""
    clean_id = identifier.strip()
    if not clean_id:
        raise ValueError("Phone number or Email address is required.")
        
    conn = get_connection()
    cursor = conn.cursor()
    
    # Check rate limit / resend cooldown
    cursor.execute("""
    SELECT id, created_at, expires_at FROM otp_verifications
    WHERE identifier = ? AND is_used = 0
    ORDER BY created_at DESC LIMIT 1;
    """, (clean_id,))
    latest = cursor.fetchone()
    
    if latest:
        created_time = datetime.strptime(latest["created_at"], "%Y-%m-%d %H:%M:%S")
        elapsed_seconds = (datetime.utcnow() - created_time).total_seconds()
        if elapsed_seconds < OTP_RESEND_COOLDOWN_SECONDS:
            remaining = int(OTP_RESEND_COOLDOWN_SECONDS - elapsed_seconds)
            conn.close()
            raise ValueError(f"Please wait {remaining} seconds before requesting a new OTP.")
            
    # Generate OTP & Salt
    otp = generate_secure_otp(6)
    salt = secrets.token_hex(16)
    otp_hash = hash_otp(otp, salt)
    
    now = datetime.utcnow()
    expires_at = now + timedelta(minutes=OTP_EXPIRY_MINUTES)
    
    cursor.execute("""
    INSERT INTO otp_verifications (identifier, otp_hash, salt, expires_at, created_at, attempts, is_used)
    VALUES (?, ?, ?, ?, ?, 0, 0);
    """, (clean_id, otp_hash, salt, expires_at.strftime("%Y-%m-%d %H:%M:%S"), now.strftime("%Y-%m-%d %H:%M:%S")))
    
    conn.commit()
    conn.close()
    
    # Dispatch via provider
    try:
        dispatch_otp(clean_id, otp)
    except Exception as e:
        logger.error("Failed to deliver OTP to %s: %s", clean_id, str(e))
        raise RuntimeError(f"Unable to send OTP: {str(e)}")
        
    return {
        "status": "success",
        "message": "OTP sent successfully",
        "identifier": clean_id,
        "cooldown_seconds": OTP_RESEND_COOLDOWN_SECONDS,
        "expires_in_seconds": OTP_EXPIRY_MINUTES * 60
    }

def verify_otp_code(identifier: str, otp_code: str) -> bool:
    """Verify submitted OTP code against active record."""
    clean_id = identifier.strip()
    clean_otp = otp_code.strip()
    
    if not clean_id or not clean_otp:
        raise ValueError("Identifier and OTP code are required.")
        
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
    SELECT id, otp_hash, salt, expires_at, attempts, is_used FROM otp_verifications
    WHERE identifier = ? AND is_used = 0
    ORDER BY created_at DESC LIMIT 1;
    """, (clean_id,))
    record = cursor.fetchone()
    
    if not record:
        conn.close()
        raise ValueError("No active OTP request found. Please request a new OTP.")
        
    record_id = record["id"]
    attempts = record["attempts"]
    expires_at = datetime.strptime(record["expires_at"], "%Y-%m-%d %H:%M:%S")
    
    # Check max attempts
    if attempts >= MAX_OTP_ATTEMPTS:
        cursor.execute("UPDATE otp_verifications SET is_used = 1 WHERE id = ?;", (record_id,))
        conn.commit()
        conn.close()
        raise ValueError("Maximum OTP verification attempts exceeded. Please request a new OTP.")
        
    # Check expiry
    if datetime.utcnow() > expires_at:
        cursor.execute("UPDATE otp_verifications SET is_used = 1 WHERE id = ?;", (record_id,))
        conn.commit()
        conn.close()
        raise ValueError("OTP has expired. Please request a new OTP.")
        
    # Verify hash
    expected_hash = record["otp_hash"]
    computed_hash = hash_otp(clean_otp, record["salt"])
    
    if not secrets.compare_digest(expected_hash, computed_hash):
        new_attempts = attempts + 1
        cursor.execute("UPDATE otp_verifications SET attempts = ? WHERE id = ?;", (new_attempts, record_id))
        conn.commit()
        conn.close()
        remaining_attempts = MAX_OTP_ATTEMPTS - new_attempts
        if remaining_attempts > 0:
            raise ValueError(f"Invalid OTP code. {remaining_attempts} attempts remaining.")
        else:
            raise ValueError("Invalid OTP. Maximum attempts exceeded. Please request a new OTP.")
            
    # Mark as used (Single-use)
    cursor.execute("UPDATE otp_verifications SET is_used = 1 WHERE id = ?;", (record_id,))
    conn.commit()
    conn.close()
    return True
