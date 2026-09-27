from fastapi import APIRouter
from services.knowledge_service import get_cooperative_knowledge

router = APIRouter(prefix="/api/cooperative", tags=["Cooperative Laws"])

@router.get("")
def get_cooperative_route():
    return get_cooperative_knowledge()
