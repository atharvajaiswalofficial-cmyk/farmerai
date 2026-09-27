from fastapi import APIRouter, Depends
from schemas import SchemeSearchRequest
from database import get_schemes, search_schemes
from services.scheme_service import get_personalized_schemes
from services.auth_service import get_current_user_optional

router = APIRouter(prefix="/api/schemes", tags=["Government Schemes"])

@router.get("")
def get_all_schemes_route():
    return get_schemes()

@router.post("/search")
def search_schemes_route(req: SchemeSearchRequest):
    results = search_schemes(
        user_type=req.user_type, 
        requirement=req.requirement, 
        state=req.state,
        crop=req.crop,
        landholding=req.landholding
    )
    return {
        "count": len(results),
        "results": results
    }

@router.get("/personalized")
def get_personalized_route(current_user: dict = Depends(get_current_user_optional)):
    user_id = current_user["id"] if current_user else 1
    return get_personalized_schemes(user_id)
