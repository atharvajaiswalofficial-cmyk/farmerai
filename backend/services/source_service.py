from typing import List, Dict, Any
from database import get_official_sources

def list_all_sources(category: str = None) -> List[Dict[str, Any]]:
    """Retrieve verified official government sources."""
    return get_official_sources(category=category)

def get_source_by_domain(domain: str) -> Dict[str, Any]:
    sources = get_official_sources()
    for s in sources:
        if domain.lower() in s["domain"].lower():
            return s
    return {
        "source_name": "Official Government Portal",
        "domain": domain,
        "authority": "Government of India",
        "portal_url": f"https://{domain}"
    }
