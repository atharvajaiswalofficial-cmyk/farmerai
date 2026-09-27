from fastapi import APIRouter
from services.knowledge_service import get_financial_knowledge

router = APIRouter(prefix="/api/financial", tags=["Financial Literacy"])

@router.get("")
def get_financial_route():
    return get_financial_knowledge()
