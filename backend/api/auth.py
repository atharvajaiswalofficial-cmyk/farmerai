from fastapi import APIRouter, HTTPException, Depends
from schemas import SendOtpRequest, VerifyOtpRequest, OtpResponse, AuthResponse
from services.otp_service import create_and_send_otp, verify_otp_code, is_email
from services.auth_service import create_access_token, get_current_user
from database import get_user_by_identifier, create_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/send-otp", response_model=OtpResponse)
def send_otp_route(req: SendOtpRequest):
    identifier = req.identifier.strip()
    if not identifier:
        raise HTTPException(status_code=400, detail="Phone number or email is required.")
    try:
        res = create_and_send_otp(identifier)
        return res
    except ValueError as ve:
        raise HTTPException(status_code=429 if "wait" in str(ve).lower() else 400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unable to send OTP: {str(e)}")

@router.post("/resend-otp", response_model=OtpResponse)
def resend_otp_route(req: SendOtpRequest):
    return send_otp_route(req)

@router.post("/verify-otp", response_model=AuthResponse)
def verify_otp_route(req: VerifyOtpRequest):
    identifier = req.identifier.strip()
    otp = req.otp.strip()
    
    if not identifier or not otp:
        raise HTTPException(status_code=400, detail="Identifier and OTP code are required.")
        
    try:
        verify_otp_code(identifier, otp)
    except ValueError as ve:
        err_msg = str(ve)
        status_code = 400
        if "expired" in err_msg.lower():
            status_code = 410
        elif "maximum" in err_msg.lower():
            status_code = 429
        raise HTTPException(status_code=status_code, detail=err_msg)
        
    user = get_user_by_identifier(identifier)
    if not user:
        phone = identifier if not is_email(identifier) else None
        email = identifier if is_email(identifier) else None
        name = req.name or (f"Farmer {identifier[-4:]}" if phone else identifier.split("@")[0].capitalize())
        user = create_user(
            name=name,
            phone=phone,
            email=email,
            role=req.role or "farmer",
            state=req.state or "Madhya Pradesh",
            district=req.district or "Hoshangabad",
            pacs_id=req.pacs_id,
            landholding_acres=req.landholding_acres or 2.5,
            primary_crops=req.primary_crops or "Wheat, Soybean",
            preferred_language=req.preferred_language or "en"
        )
        
    token = create_access_token({"sub": identifier, "user_id": user["id"], "role": user.get("role", "farmer")})
    
    return {
        "status": "success",
        "message": "Login successful",
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/logout")
def logout_route(current_user: dict = Depends(get_current_user)):
    return {"status": "success", "message": "Session logged out successfully"}
