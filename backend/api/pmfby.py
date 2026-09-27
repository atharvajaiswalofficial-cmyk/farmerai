from fastapi import APIRouter
from services.knowledge_service import get_pmfby_knowledge

router = APIRouter(prefix="/api/pmfby", tags=["PMFBY"])

@router.get("")
def get_pmfby_route():
    return get_pmfby_knowledge()
