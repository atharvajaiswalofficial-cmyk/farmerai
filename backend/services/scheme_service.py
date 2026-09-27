from typing import List, Dict, Any
from database import search_schemes, get_user

def get_personalized_schemes(user_id: int) -> Dict[str, Any]:
    """Retrieve schemes customized to the user's saved profile."""
    user = get_user(user_id) if user_id else None
    
    state = user.get("state") if user else "All India"
    landholding = user.get("landholding_acres") if user else 2.5
    crops = user.get("primary_crops") if user else "All Crops"
    user_type = user.get("role", "Farmer").capitalize() if user else "Farmer"

    schemes = search_schemes(
        user_type=user_type,
        state=state,
        landholding=landholding
    )

    return {
        "user_profile": {
            "name": user.get("name") if user else "Farmer",
            "state": state,
            "district": user.get("district") if user else "Hoshangabad",
            "landholding_acres": landholding,
            "primary_crops": crops
        },
        "matched_schemes_count": len(schemes),
        "schemes": schemes
    }
