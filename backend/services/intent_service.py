import re
from services.language_service import detect_language

def classify_query(text: str) -> dict:
    """
    Classify query into 20 granular agricultural / cooperative intents and map to appropriate RAG category.
    """
    text_lower = text.lower()
    lang = detect_language(text)

    # 1. PMFBY & Crop Loss
    if any(k in text_lower for k in ["barish", "बारिश", "damage", "nuksan", "नुकसान", "destroy", "flood", "hailstorm", "सूखा", "बाढ़", "ओलावृष्टि"]):
        return {"intent": "CROP_LOSS", "topic": "PMFBY", "category": "PMFBY", "language": lang}
    if any(k in text_lower for k in ["pmfby", "fasal bima", "crop insurance", "premium", "फसल बीमा", "बीमा", "क्लेम", "claim intimation"]):
        return {"intent": "PMFBY", "topic": "PMFBY", "category": "PMFBY", "language": lang}

    # 2. PM-KISAN
    if any(k in text_lower for k in ["pm-kisan", "pm kisan", "samman nidhi", "6,000", "6000", "installment", "सम्मान निधि", "किस्त", "dbt"]):
        return {"intent": "PM_KISAN", "topic": "PM-KISAN", "category": "PM-KISAN", "language": lang}

    # 3. PACS & Fertilizer
    if any(k in text_lower for k in ["urea", "dap", "fertilizer", "khad", "उर्वरक", "खाद", "यूरिया"]):
        return {"intent": "PACS_SERVICE", "topic": "PACS", "category": "PACS", "language": lang}
    if any(k in text_lower for k in ["pacs", "credit society", "samiti", "समिति", "सहकारी समिति"]):
        return {"intent": "PACS_SERVICE", "topic": "PACS", "category": "PACS", "language": lang}

    # 4. Cooperative Governance & Member Rights
    if any(k in text_lower for k in ["member right", "agm", "vote", "dividend", "अधिकार", "मतदान", "लाभांश"]):
        return {"intent": "COOPERATIVE_MEMBER_RIGHT", "topic": "Cooperative Laws", "category": "Cooperative", "language": lang}
    if any(k in text_lower for k in ["mscs", "cooperative law", "bylaw", "बायला", "उप-नियम", "सहकारी कानून", "section 84"]):
        return {"intent": "COOPERATIVE_LAW", "topic": "Cooperative Laws", "category": "Cooperative", "language": lang}

    # 5. Financial Literacy & KCC
    if any(k in text_lower for k in ["kcc", "kisan credit card", "केसीसी", "किसान क्रेडिट कार्ड"]):
        return {"intent": "KCC", "topic": "Financial Literacy", "category": "Financial Literacy", "language": lang}
    if any(k in text_lower for k in ["loan", "interest", "subvention", "shg", "ऋण", "ब्याज", "सबवेंशन"]):
        return {"intent": "FINANCIAL_LITERACY", "topic": "Financial Literacy", "category": "Financial Literacy", "language": lang}

    # 6. Grievance Redressal
    if any(k in text_lower for k in ["complaint", "grievance", "fraud", "shikayat", "शिकायत", "cpgrams", "dgrc", "ombudsman"]):
        return {"intent": "GRIEVANCE", "topic": "Grievance", "category": "Grievance", "language": lang}

    # 7. Schemes & Subsidies
    if any(k in text_lower for k in ["eligible", "eligibility", "पात्रता", "criteria"]):
        return {"intent": "SCHEME_ELIGIBILITY", "topic": "Schemes", "category": "Schemes", "language": lang}
    if any(k in text_lower for k in ["apply", "application", "आवेदन", "फॉर्म", "portal"]):
        return {"intent": "SCHEME_APPLICATION", "topic": "Schemes", "category": "Schemes", "language": lang}
    if any(k in text_lower for k in ["scheme", "yojana", "subsidy", "योजना", "अनुदान"]):
        return {"intent": "SCHEME_SEARCH", "topic": "Schemes", "category": "Schemes", "language": lang}

    # 8. Allied Agriculture Services
    if any(k in text_lower for k in ["soil", "soil health", "मिट्टी", "मृदा"]):
        return {"intent": "SOIL_HEALTH", "topic": "Soil Health", "category": "Schemes", "language": lang}
    if any(k in text_lower for k in ["tractor", "harvester", "machinery", "उपकरण", "मशीनरी", "chc"]):
        return {"intent": "FARM_MECHANIZATION", "topic": "Farm Machinery", "category": "PACS", "language": lang}
    if any(k in text_lower for k in ["mandi", "enam", "e-nam", "मंडी", "भाव"]):
        return {"intent": "E_NAM", "topic": "e-NAM", "category": "Schemes", "language": lang}

    # 9. Out-of-Domain Detection
    if any(k in text_lower for k in ["quantum", "supercomputer", "atom", "space", "bitcoin", "crypto", "hollywood", "rocket", "mars"]):
        return {"intent": "UNKNOWN", "topic": "Unknown", "category": "Out of Domain", "language": lang}

    return {"intent": "GENERAL_AGRICULTURE", "topic": "General", "category": "Agriculture Guidance", "language": lang}
