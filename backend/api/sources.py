from fastapi import APIRouter
from services.source_service import list_all_sources

router = APIRouter(prefix="/api/sources", tags=["Official Sources"])

@router.get("")
def get_sources_route(category: str = None):
    return list_all_sources(category=category)
