from typing import List, Dict, Any

COLLECTIONS = {
    "pmfby": {
        "name": "pmfby",
        "title": "PMFBY & Crop Loss Guidelines",
        "categories": ["PMFBY", "Crop Insurance", "Crop Loss", "Disaster Relief"],
        "default_sources": ["pmfby.gov.in"]
    },
    "pm_kisan": {
        "name": "pm_kisan",
        "title": "PM-KISAN Direct Benefit Transfer",
        "categories": ["PM-KISAN", "Income Support", "DBT"],
        "default_sources": ["pmkisan.gov.in"]
    },
    "pacs": {
        "name": "pacs",
        "title": "Primary Agricultural Credit Societies Hub",
        "categories": ["PACS", "Fertilizer", "Seed", "Cooperative Credit"],
        "default_sources": ["cooperation.gov.in"]
    },
    "cooperative_laws": {
        "name": "cooperative_laws",
        "title": "Multi-State Co-operative Societies Act & Bylaws",
        "categories": ["Cooperative", "MSCS Act", "Member Rights", "Governance"],
        "default_sources": ["cooperation.gov.in", "indiacode.nic.in"]
    },
    "finance": {
        "name": "finance",
        "title": "KCC, Agricultural Credit & Banking Safety",
        "categories": ["Financial Literacy", "KCC", "Agricultural Credit", "SHG"],
        "default_sources": ["agriwelfare.gov.in", "nabard.org", "rbi.org.in"]
    },
    "government_schemes": {
        "name": "government_schemes",
        "title": "Central & State Agricultural Schemes",
        "categories": ["Schemes", "Subsidies", "Irrigation", "Soil Health"],
        "default_sources": ["agriwelfare.gov.in", "pmksy.gov.in"]
    },
    "grievance": {
        "name": "grievance",
        "title": "Grievance Redressal & CPGRAMS Procedures",
        "categories": ["Grievance", "Complaint", "Redressal", "Escalation"],
        "default_sources": ["pgportal.gov.in"]
    }
}

def get_collection_for_category(category: str) -> str:
    cat_lower = category.lower()
    for col_key, col_val in COLLECTIONS.items():
        if any(c.lower() in cat_lower for c in col_val["categories"]):
            return col_key
    return "government_schemes"
