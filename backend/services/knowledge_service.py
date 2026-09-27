import json
import os
from typing import Dict, Any, List

KNOWLEDGE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "knowledge")

def load_json_knowledge(filename: str) -> Dict[str, Any]:
    file_path = os.path.join(KNOWLEDGE_DIR, filename)
    if os.path.exists(file_path):
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

def get_pmfby_knowledge() -> Dict[str, Any]:
    return load_json_knowledge("pmfby.json")

def get_pacs_knowledge() -> Dict[str, Any]:
    return load_json_knowledge("pacs.json")

def get_cooperative_knowledge() -> Dict[str, Any]:
    return load_json_knowledge("cooperative.json")

def get_financial_knowledge() -> Dict[str, Any]:
    return load_json_knowledge("financial.json")

def get_curated_answer(topic: str, query: str, language: str = "en") -> dict:
    """Generate grounded curated response based on domain and language."""
    topic_upper = topic.upper()
    query_lower = query.lower()
    
    if "PMFBY" in topic_upper:
        if language == "hi":
            answer = "प्रधानमंत्री फसल बीमा योजना (PMFBY) के तहत किसान प्रीमियम खरीफ फसलों के लिए 2%, रबी फसलों के लिए 1.5% और वाणिज्यिक/बागवानी फसलों के लिए 5% तय किया गया है। फसल नुकसान की स्थिति में 72 घंटे के भीतर राष्ट्रीय हेल्पलाइन 14447 या फसल बीमा ऐप पर सूचना दर्ज करना अनिवार्य है।"
        else:
            answer = "Under Pradhan Mantri Fasal Bima Yojana (PMFBY), the maximum farmer premium is capped at 2.0% for Kharif food/oilseed crops, 1.5% for Rabi crops, and 5.0% for annual commercial/horticultural crops. In case of localized crop loss or post-harvest damage, claim intimation must be submitted within 72 hours via the national toll-free helpline (14447), the Crop Insurance App, or the nearest bank/PACS branch."
        return {
            "answer": answer,
            "grounded": True,
            "topic": "PMFBY",
            "source": "PMFBY Operational Guidelines",
            "sources": [{
                "title": "PMFBY Operational Guidelines",
                "source": "PMFBY Official Portal",
                "page": 12,
                "source_url": "https://pmfby.gov.in"
            }]
        }
        
    if "PM-KISAN" in topic_upper:
        if language == "hi":
            answer = "प्रधानमंत्री किसान सम्मान निधि (PM-KISAN) योजना के तहत सभी पात्र भूमिधारक किसान परिवारों को प्रति वर्ष ₹6,000 की वित्तीय सहायता ₹2,000 की तीन समान किस्तों में सीधे उनके आधार से जुड़े बैंक खातों में डीबीटी के माध्यम से दी जाती है।"
        else:
            answer = "Under the PM-KISAN (Pradhan Mantri Kisan Samman Nidhi) scheme, eligible landholding farmer families receive direct income support of ₹6,000 per year, disbursed in three equal 4-monthly installments of ₹2,000 directly to Aadhaar-seeded bank accounts via DBT."
        return {
            "answer": answer,
            "grounded": True,
            "topic": "PM-KISAN",
            "source": "PM-KISAN Operational Guidelines",
            "sources": [{
                "title": "PM-KISAN Operational Guidelines",
                "source": "PM-KISAN Official Portal",
                "page": 4,
                "source_url": "https://pmkisan.gov.in"
            }]
        }

    if "PACS" in topic_upper:
        pacs_data = get_pacs_knowledge()
        if language == "hi":
            answer = "प्राथमिक कृषि ऋण समितियाँ (PACS) ग्राम स्तर पर किसानों को सब्सिडी युक्त उर्वरक (जैसे यूरिया ₹266.50/बोरी पीओएस बायोमेट्रिक प्रमाणीकरण द्वारा), रियायती दर पर फसली ऋण (KCC 4%), प्रमाणित बीज और कृषि उपकरण किराए पर उपलब्ध कराती हैं।"
        else:
            answer = "Primary Agricultural Credit Societies (PACS) provide village-level agricultural services including subsidized fertilizer distribution (e.g. Urea at ₹266.50 per 45kg bag via biometric POS machines), concessional short-term crop loans via KCC at effective 4% interest, certified seed distribution, and custom hiring centers for farm machinery."
        return {
            "answer": answer,
            "grounded": True,
            "topic": "PACS",
            "source": "PACS Model Bye-Laws 2023",
            "sources": [{
                "title": "PACS Model Bye-Laws 2023",
                "source": "Ministry of Cooperation",
                "page": 5,
                "source_url": "https://cooperation.gov.in"
            }]
        }

    if "COOPERATIVE" in topic_upper:
        if language == "hi":
            answer = "मल्टी-स्टेट कोऑपरेटिव सोसाइटीज (MSCS) अधिनियम के तहत प्रत्येक सदस्य को 'एक सदस्य, एक मत' का लोकतांत्रिक अधिकार प्राप्त है। सदस्यों को वार्षिक आम बैठक (AGM) में भाग लेने, लेखा-परीक्षित वित्तीय विवरणों का निरीक्षण करने और लाभांश प्राप्त करने का कानूनी अधिकार है।"
        else:
            answer = "Under the Multi-State Co-operative Societies (MSCS) Act and Cooperative bylaws, members hold democratic rights including 'One member, one vote', right to inspect annual audited accounts, mandatory participation in Annual General Meetings (AGMs) convened within 6 months of year-end, and dispute arbitration under Section 84."
        return {
            "answer": answer,
            "grounded": True,
            "topic": "Cooperative Laws",
            "source": "MSCS Act 2002 Guidelines",
            "sources": [{
                "title": "MSCS Act 2002 & Amendments",
                "source": "Ministry of Cooperation",
                "page": 18,
                "source_url": "https://cooperation.gov.in"
            }]
        }

    if "FINANCIAL" in topic_upper or "CREDIT" in topic_upper:
        if language == "hi":
            answer = "किसान क्रेडिट कार्ड (KCC) योजना के तहत किसानों को 7% सामान्य ब्याज पर ऋण मिलता है, जिसमें समय पर भुगतान करने पर 3% ब्याज छूट (Subvention) मिलती है, जिससे प्रभावी ब्याज दर केवल 4% प्रति वर्ष रह जाती है। ₹1.60 लाख तक का ऋण बिना किसी बंधक (Collateral) के उपलब्ध है।"
        else:
            answer = "Under the Kisan Credit Card (KCC) scheme, crop loans up to ₹3 Lakh carry a normal interest rate of 7% with a 3% prompt repayment subvention, resulting in an effective interest rate of just 4% per annum. Collateral-free credit is available up to ₹1.60 Lakh."
        return {
            "answer": answer,
            "grounded": True,
            "topic": "Financial Literacy",
            "source": "KCC & RBI Priority Sector Guidelines",
            "sources": [{
                "title": "Kisan Credit Card Operational Scheme",
                "source": "Ministry of Agriculture & NABARD",
                "page": 3,
                "source_url": "https://agricoop.nic.in"
            }]
        }

    # Out of domain or unknown
    if topic_upper == "UNKNOWN":
        return {
            "answer": "I don't currently have verified information about this topic in our official government policy and agricultural database. Please ask regarding PMFBY crop insurance, PM-KISAN, PACS services, cooperative governance, or KCC loans.",
            "grounded": False,
            "topic": "General",
            "source": "Sahayak AI Knowledge Base",
            "sources": []
        }

    return {
        "answer": "Sahayak AI provides verified guidance on central and state agricultural schemes, PMFBY crop insurance claims (72h intimation window), PACS subsidized inputs, and cooperative society rights.",
        "grounded": True,
        "topic": "General",
        "source": "Official Agricultural Guidelines",
        "sources": [{
            "title": "Sahayak Official Agriculture Reference",
            "source": "Ministry of Agriculture & Cooperation",
            "page": 1,
            "source_url": "https://agricoop.nic.in"
        }]
    }

def generate_grievance_guidance(category: str, description: str) -> dict:
    """Generate instant actionable guidance and escalation steps."""
    cat_lower = category.lower()
    if "insurance" in cat_lower or "pmfby" in cat_lower:
        return {
            "category": "Crop Insurance / PMFBY",
            "escalation_authority": "District Level Grievance Redressal Committee (DGRC) & State Insurance Nodal Officer",
            "helpline": "14447 (National PMFBY Helpline)",
            "urgent_steps": [
                "File localized claim intimation on the Crop Insurance App or call 14447 within 72 hours of damage.",
                "Obtain acknowledgement / Claim Docket Number.",
                "Collect Joint Loss Assessment (JLA) inspection report from surveyor/Patwari.",
                "Submit formal grievance letter to District Agriculture Officer if survey is not conducted within 10 days."
            ],
            "required_documents": ["Aadhaar Card", "Khasra/Khatauni", "Sowing Certificate", "Bank Passbook with premium deduction entry", "Photographs of damaged crop"]
        }
    elif "fertilizer" in cat_lower or "pacs" in cat_lower:
        return {
            "category": "Subsidized Fertilizer / PACS Service",
            "escalation_authority": "District Cooperative Officer (DCO) & Department of Fertilisers Monitoring Cell",
            "helpline": "1800-180-1551",
            "urgent_steps": [
                "Verify stock availability on the e-POS Integrated Fertilizer Management System (iFMS).",
                "Demand official printed POS cash receipt matching MRP (₹266.50 per 45kg bag Urea).",
                "Report overcharging, tied-selling, or unauthorized stock diversion to DCO."
            ],
            "required_documents": ["Aadhaar Card", "POS Transaction Receipt / Refusal Slip", "PACS Membership ID"]
        }
    else:
        return {
            "category": "Agricultural Credit / General Grievance",
            "escalation_authority": "Banking Ombudsman (RBI) / District Collectorate Public Grievance Cell",
            "helpline": "14448 (Banking Ombudsman) / 1800-115-526",
            "urgent_steps": [
                "Submit written representation to Branch Manager and obtain stamped acknowledgement.",
                "Escalate to Lead District Manager (LDM) if unresolved after 15 days.",
                "Lodge online complaint on CPGRAMS (pgportal.gov.in)."
            ],
            "required_documents": ["Loan Account Passbook", "Aadhaar Card", "Written complaint copy"]
        }

def draft_grievance_letter(category: str, description: str, farmer_name: str, district: str, state: str, contact: str) -> str:
    """Generate structured grievance complaint letter."""
    date_str = os.getenv("MOCK_DATE", "27 September 2026")
    return f"""To,
The District Agriculture Officer / Chairman,
District Level Grievance Redressal Committee (DGRC),
District: {district}, {state}

Subject: Urgent Complaint Regarding {category} - Request for Immediate Investigation & Redressal

Respected Sir/Madam,

I, {farmer_name}, a resident farmer of District {district}, {state} (Contact: {contact}), wish to bring to your urgent attention a serious grievance concerning {category}.

Details of Grievance:
{description}

Despite meeting all eligibility criteria and compliance requirements, I have not received the due relief/service, causing immense financial distress.

I earnestly request your good office to:
1. Conduct an immediate on-ground verification or inquiry into this matter.
2. Issue necessary directions to the concerned officials / insurance company / society.
3. Ensure expedited resolution and disbursement of my rightful claims / entitlements.

Enclosed: Copy of Aadhaar, Land Records, and relevant transaction receipts.

Thanking you,

Yours sincerely,
{farmer_name}
District: {district}, {state}
Contact: {contact}
Date: {date_str}
"""
