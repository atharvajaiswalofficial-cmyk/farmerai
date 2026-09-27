from fastapi import APIRouter
from services.knowledge_service import get_pacs_knowledge

router = APIRouter(prefix="/api/pacs", tags=["PACS Hub"])

@router.get("")
def get_pacs_route():
    return get_pacs_knowledge()
