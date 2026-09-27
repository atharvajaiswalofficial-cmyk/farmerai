from fastapi import APIRouter, Depends, HTTPException
from schemas import UpdateProfileRequest
from database import get_demo_user, create_user, update_user_profile, get_user
from services.auth_service import get_current_user

router = APIRouter(tags=["User Profile"])

@router.get("/api/users/me")
@router.get("/api/profile")
def get_user_me_route(current_user: dict = Depends(get_current_user)):
    return current_user

@router.put("/api/users/profile")
@router.put("/api/profile")
def update_profile_route(req: UpdateProfileRequest, current_user: dict = Depends(get_current_user)):
    updated = update_user_profile(current_user["id"], req.model_dump(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail="User not found")
    return updated

@router.get("/api/users/demo")
def get_demo_user_route():
    demo = get_demo_user()
    if not demo:
        demo = create_user(name="Demo User", phone="9999999999", role="farmer")
    return demo
