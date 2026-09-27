from fastapi import APIRouter, Depends
from schemas import GrievanceGuidanceRequest, GrievanceDraftRequest
from services.grievance_service import get_grievance_guidance_data, generate_formal_complaint_letter
from services.auth_service import get_current_user_optional
from database import create_grievance, get_grievances

router = APIRouter(prefix="/api/grievance", tags=["Grievance Redressal"])

@router.post("/guidance")
def get_guidance_route(req: GrievanceGuidanceRequest):
    return get_grievance_guidance_data(req.category, req.description)

@router.post("/draft")
def draft_grievance_route(req: GrievanceDraftRequest, current_user: dict = Depends(get_current_user_optional)):
    guidance = get_grievance_guidance_data(req.category, req.description)
    
    letter = generate_formal_complaint_letter(
        category=req.category,
        description=req.description,
        farmer_name=req.farmer_name or "Rameshwar Patel",
        district=req.district or "Hoshangabad",
        state=req.state or "Madhya Pradesh",
        contact=req.contact or "+91 98765 43210",
        language=req.language or "en"
    )
    
    user_id = current_user["id"] if current_user else 1
    
    saved = create_grievance(
        user_id=user_id,
        category=req.category,
        description=req.description,
        farmer_name=req.farmer_name,
        district=req.district,
        state=req.state,
        contact=req.contact,
        letter_text=letter,
        status="draft",
        escalation_authority=guidance.get("escalation_authority")
    )
    
    return {
        "grievance_id": saved["id"],
        "status": saved["status"],
        "category": saved["category"],
        "letter_text": letter,
        "escalation_authority": guidance.get("escalation_authority"),
        "helpline": guidance.get("helpline"),
        "urgent_steps": guidance.get("urgent_steps"),
        "required_documents": guidance.get("required_documents"),
        "created_at": saved["created_at"]
    }

# Also support top-level /api/grievances list
@router.get("s")
@router.get("/list")
def list_grievances_route(current_user: dict = Depends(get_current_user_optional)):
    user_id = current_user["id"] if current_user else 1
    return get_grievances(user_id=user_id)
