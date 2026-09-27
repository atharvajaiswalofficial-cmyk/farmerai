import os
from datetime import datetime
from typing import Dict, Any

def get_grievance_guidance_data(category: str, description: str) -> Dict[str, Any]:
    cat_lower = category.lower()
    if "insurance" in cat_lower or "pmfby" in cat_lower or "crop" in cat_lower:
        return {
            "category": "Crop Insurance / PMFBY",
            "escalation_authority": "District Level Grievance Redressal Committee (DGRC) & State Insurance Nodal Officer",
            "helpline": "14447 (National PMFBY Helpline)",
            "portal": "https://pmfby.gov.in / https://pgportal.gov.in",
            "urgent_steps": [
                "File localized claim intimation on the Crop Insurance App or call 14447 within 72 hours of damage.",
                "Obtain official claim registration / docket tracking number.",
                "Collect Joint Loss Assessment (JLA) survey report copy.",
                "Submit formal written grievance to District Agriculture Officer if survey is not executed within 10 days."
            ],
            "required_documents": [
                "Aadhaar Card copy",
                "Land Possession Certificate (Khasra / Khatauni)",
                "Crop Sowing Certificate from Patwari",
                "Bank Passbook with premium debit entry",
                "Field damage photographs with date"
            ]
        }
    elif "fertilizer" in cat_lower or "pacs" in cat_lower or "urea" in cat_lower:
        return {
            "category": "Subsidized Fertilizer / PACS Service",
            "escalation_authority": "District Cooperative Officer (DCO) & Department of Fertilisers Monitoring Cell",
            "helpline": "1800-180-1551 (Kisan Call Centre)",
            "portal": "https://cooperation.gov.in / https://fert.nic.in",
            "urgent_steps": [
                "Check live stock availability on e-POS machine.",
                "Demand printed computerized cash memo with exact ₹266.50/45kg Urea MRP.",
                "Report overcharging or forced bundling to District Cooperative Registrar."
            ],
            "required_documents": [
                "Aadhaar Card copy",
                "POS Transaction / Refusal receipt",
                "PACS Membership ID card"
            ]
        }
    else:
        return {
            "category": "Agricultural Credit / General Grievance",
            "escalation_authority": "Banking Ombudsman (RBI) / District Collectorate Public Grievance Cell",
            "helpline": "14448 (Banking Ombudsman) / 1800-115-526",
            "portal": "https://cms.rbi.org.in / https://pgportal.gov.in",
            "urgent_steps": [
                "Submit written representation to Bank Branch Manager and obtain stamped acknowledgement.",
                "Escalate to Lead District Manager (LDM) if unresolved after 15 days.",
                "Lodge online complaint on CPGRAMS (pgportal.gov.in)."
            ],
            "required_documents": [
                "Loan Account Passbook copy",
                "Aadhaar Card copy",
                "Previous written complaint acknowledgement"
            ]
        }

def generate_formal_complaint_letter(
    category: str, 
    description: str, 
    farmer_name: str, 
    district: str, 
    state: str, 
    contact: str,
    language: str = "en"
) -> str:
    date_str = datetime.now().strftime("%d %B %Y")
    
    if language == "hi":
        return f"""सेवा में,
जिला कृषि अधिकारी / अध्यक्ष,
जिला स्तरीय शिकायत निवारण समिति (DGRC),
जिला: {district}, {state}

विषय: {category} के संबंध में त्वरित जांच एवं समाधान हेतु औपचारिक शिकायत पत्र

महोदय/महोदया,

मैं, {farmer_name}, निवासी जिला {district}, {state} (संपर्क: {contact}), इस पत्र के माध्यम से {category} के संबंध में अपनी गंभीर समस्या आपके संज्ञान में लाना चाहता हूँ।

शिकायत का विवरण:
{description}

मैंने सभी आवश्यक पात्रता शर्तों और दिशा-निर्देशों का विधिवत पालन किया है, फिर भी मुझे निर्धारित समयावधि में उचित राहत/सेवा प्राप्त नहीं हुई है।

अतः आपसे विनम्र निवेदन है कि:
1. इस प्रकरण की तत्काल स्थलीय जांच कराई जाए।
2. संबंधित बीमा कंपनी / सहकारी समिति / बैंक को नियमानुसार त्वरित कार्रवाई के निर्देश दिए जाएं।
3. मेरे वाजिब हक/क्लेम का शीघ्र भुगतान सुनिश्चित किया जाए।

संलग्नक: आधार कार्ड, खसरा/खतौनी नकल, बैंक पासबुक एवं संबंधित साक्ष्य।

सधन्यवाद,

भवदीय,
{farmer_name}
जिला: {district}, {state}
दूरभाष: {contact}
दिनांक: {date_str}
"""

    return f"""To,
The District Agriculture Officer / Chairman,
District Level Grievance Redressal Committee (DGRC),
District: {district}, {state}

Subject: Formal Complaint Regarding {category} - Request for Immediate Investigation & Redressal

Respected Sir/Madam,

I, {farmer_name}, a resident farmer of District {district}, {state} (Contact: {contact}), wish to bring to your urgent attention a serious grievance concerning {category}.

Details of Grievance:
{description}

Despite fulfilling all required eligibility criteria and compliance standards under official government guidelines, I have not received the due settlement/service, causing undue financial distress.

I earnestly request your good office to:
1. Initiate an immediate on-ground verification or inquiry into this matter.
2. Issue necessary directions to the concerned officials / insurance company / society.
3. Ensure expedited resolution and disbursement of my rightful claims / entitlements.

Enclosed: Copy of Aadhaar, Land Records, Bank Passbook, and transaction receipts.

Thanking you,

Yours sincerely,
{farmer_name}
District: {district}, {state}
Contact: {contact}
Date: {date_str}
"""
