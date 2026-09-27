import sqlite3
import os
import json
from datetime import datetime
from typing import Optional, List, Dict, Any

from config import DB_PATH

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    # 1. Users table (enhanced with farmer profiling fields)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT UNIQUE,
        email TEXT UNIQUE,
        role TEXT NOT NULL DEFAULT 'farmer',
        state TEXT DEFAULT 'Madhya Pradesh',
        district TEXT DEFAULT 'Hoshangabad',
        pacs_id TEXT,
        landholding_acres REAL DEFAULT 2.5,
        primary_crops TEXT DEFAULT 'Wheat, Soybean, Gram',
        preferred_language TEXT DEFAULT 'en',
        occupation TEXT DEFAULT 'Small & Marginal Farmer',
        category TEXT DEFAULT 'General',
        firebase_uid TEXT UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 2. OTP Verifications table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS otp_verifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        identifier TEXT NOT NULL,
        otp_hash TEXT NOT NULL,
        salt TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        attempts INTEGER DEFAULT 0,
        is_used INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_otp_identifier ON otp_verifications(identifier);")

    # 3. Chat History table (with intent and conversation grouping)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS chat_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        conversation_id TEXT DEFAULT 'default',
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        language TEXT DEFAULT 'en',
        topic TEXT DEFAULT 'General',
        intent TEXT DEFAULT 'GENERAL_AGRICULTURE',
        sources_json TEXT DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)

    # 4. Schemes table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS schemes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        category TEXT NOT NULL,
        user_type TEXT NOT NULL,
        state TEXT NOT NULL DEFAULT 'All India',
        description TEXT,
        benefits TEXT,
        eligibility TEXT,
        application_process TEXT,
        official_url TEXT,
        helpline TEXT,
        target_crops TEXT DEFAULT 'All Crops',
        min_landholding REAL DEFAULT 0.0,
        max_landholding REAL DEFAULT 999.0
    );
    """)

    # 5. Documents table (Official Policy Guidelines)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL UNIQUE,
        category TEXT NOT NULL,
        department TEXT DEFAULT 'Ministry of Agriculture & Farmers Welfare',
        source TEXT NOT NULL,
        file_path TEXT NOT NULL,
        pages INTEGER DEFAULT 1,
        source_url TEXT DEFAULT 'https://agricoop.nic.in',
        version TEXT DEFAULT '1.0',
        publication_date TEXT DEFAULT '2023-01-01',
        effective_date TEXT DEFAULT '2023-01-01',
        last_verified TEXT DEFAULT '2026-09-27',
        status TEXT DEFAULT 'ACTIVE',
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 6. Document Chunks table (RAG Vector / Semantic Retrieval Chunks)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS document_chunks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        document_id INTEGER NOT NULL,
        document_name TEXT NOT NULL,
        category TEXT NOT NULL,
        department TEXT NOT NULL,
        source_url TEXT NOT NULL,
        page_number INTEGER NOT NULL,
        content TEXT NOT NULL,
        language TEXT DEFAULT 'en',
        publication_date TEXT,
        last_updated TEXT,
        state TEXT DEFAULT 'All India',
        document_type TEXT DEFAULT 'Operational Guidelines',
        embedding_json TEXT DEFAULT '[]',
        FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
    );
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_chunks_category ON document_chunks(category);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_chunks_doc_id ON document_chunks(document_id);")

    # 7. Grievances table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS grievances (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        category TEXT NOT NULL,
        description TEXT NOT NULL,
        farmer_name TEXT,
        district TEXT,
        state TEXT,
        contact TEXT,
        letter_text TEXT,
        status TEXT NOT NULL DEFAULT 'draft',
        escalation_authority TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)

    # 8. Official Sources Registry table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS official_sources (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        source_name TEXT NOT NULL UNIQUE,
        domain TEXT NOT NULL,
        authority TEXT NOT NULL,
        priority INTEGER DEFAULT 1,
        categories TEXT NOT NULL,
        portal_url TEXT NOT NULL,
        helpline TEXT,
        is_active INTEGER DEFAULT 1
    );
    """)

    # Automatic column migrations for existing SQLite instances
    def add_col_if_missing(table, column, col_type):
        cursor.execute(f"PRAGMA table_info({table});")
        cols = [c[1] for c in cursor.fetchall()]
        if column not in cols:
            cursor.execute(f"ALTER TABLE {table} ADD COLUMN {column} {col_type};")

    add_col_if_missing("chat_history", "conversation_id", "TEXT DEFAULT 'default'")
    add_col_if_missing("chat_history", "intent", "TEXT DEFAULT 'GENERAL_AGRICULTURE'")
    add_col_if_missing("chat_history", "sources_json", "TEXT DEFAULT '[]'")
    add_col_if_missing("users", "landholding_acres", "REAL DEFAULT 2.5")
    add_col_if_missing("users", "primary_crops", "TEXT DEFAULT 'Wheat, Soybean, Gram'")
    add_col_if_missing("users", "preferred_language", "TEXT DEFAULT 'en'")
    add_col_if_missing("users", "occupation", "TEXT DEFAULT 'Farmer'")
    add_col_if_missing("users", "category", "TEXT DEFAULT 'General'")
    add_col_if_missing("grievances", "escalation_authority", "TEXT")
    add_col_if_missing("documents", "department", "TEXT DEFAULT 'Ministry of Agriculture & Farmers Welfare'")
    add_col_if_missing("documents", "source_url", "TEXT DEFAULT 'https://agricoop.nic.in'")
    add_col_if_missing("documents", "version", "TEXT DEFAULT '1.0'")
    add_col_if_missing("documents", "publication_date", "TEXT DEFAULT '2023-01-01'")
    add_col_if_missing("documents", "effective_date", "TEXT DEFAULT '2023-01-01'")
    add_col_if_missing("documents", "last_verified", "TEXT DEFAULT '2026-09-27'")
    add_col_if_missing("documents", "status", "TEXT DEFAULT 'ACTIVE'")

    # Seed demo user
    cursor.execute("SELECT id FROM users WHERE phone = '9999999999';")
    demo_user = cursor.fetchone()
    if not demo_user:
        cursor.execute("""
        INSERT INTO users (name, phone, role, state, district, pacs_id, landholding_acres, primary_crops, preferred_language, occupation)
        VALUES ('Demo User', '9999999999', 'farmer', 'Madhya Pradesh', 'Hoshangabad', 'PACS-MP-4402', 3.5, 'Soybean, Wheat', 'en', 'Small & Marginal Farmer');
        """)

    # Seed Official Sources
    official_sources = [
        ("Ministry of Cooperation", "cooperation.gov.in", "Government of India", 1, "pacs,cooperative_laws,cooperative_schemes", "https://cooperation.gov.in", "1800-180-1551"),
        ("PMFBY Official Portal", "pmfby.gov.in", "Ministry of Agriculture & Farmers Welfare", 1, "pmfby,crop_insurance,crop_loss", "https://pmfby.gov.in", "14447"),
        ("PM-KISAN Portal", "pmkisan.gov.in", "Ministry of Agriculture & Farmers Welfare", 1, "pm_kisan,dbt,income_support", "https://pmkisan.gov.in", "155261"),
        ("Department of Agriculture & Farmers Welfare", "agriwelfare.gov.in", "Government of India", 1, "agriculture,schemes,kcc", "https://agriwelfare.gov.in", "1800-180-1551"),
        ("NABARD", "nabard.org", "National Bank for Agriculture and Rural Development", 2, "finance,credit,shg,pacs_refinance", "https://www.nabard.org", "022-26539895"),
        ("National Cooperative Development Corporation", "ncdc.in", "Ministry of Cooperation", 2, "cooperative_finance,infra", "https://www.ncdc.in", "011-26962479"),
        ("JanSamarth National Portal", "jansamarth.in", "Ministry of Finance", 2, "credit,kcc,agri_infrastructure", "https://www.jansamarth.in", "1800-11-5526"),
        ("e-NAM (National Agriculture Market)", "enam.gov.in", "Small Farmers Agribusiness Consortium", 2, "market_linkage,mandis", "https://www.enam.gov.in", "1800-270-0224"),
        ("Centralized Public Grievance Redress System (CPGRAMS)", "pgportal.gov.in", "DARPG, Government of India", 1, "grievance,escalation", "https://pgportal.gov.in", "1800-11-0031")
    ]

    for src in official_sources:
        cursor.execute("SELECT id FROM official_sources WHERE source_name = ?;", (src[0],))
        if not cursor.fetchone():
            cursor.execute("""
            INSERT INTO official_sources (source_name, domain, authority, priority, categories, portal_url, helpline)
            VALUES (?, ?, ?, ?, ?, ?, ?);
            """, src)

    # Seed initial schemes
    seed_schemes = [
        ("PMFBY (Pradhan Mantri Fasal Bima Yojana)", "Crop Insurance", "Farmer", "All India", "Comprehensive crop insurance scheme providing financial support to farmers suffering crop loss/damage.", "Kharif 2% premium, Rabi 1.5%, Commercial/Horticulture 5%. Full sum insured coverage.", "All farmers growing notified crops in notified areas including sharecroppers.", "Apply via official PMFBY portal or nearest PACS/Bank branch within 72 hours of loss.", "https://pmfby.gov.in", "14447", "Paddy, Soybean, Cotton, Wheat, Mustard, Gram", 0.0, 999.0),
        ("PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)", "Direct Benefit Transfer", "Farmer", "All India", "Direct income support of ₹6,000 per year in 3 equal installments to all landholding farmer families.", "₹2,000 every 4 months directly credited to Aadhaar-linked bank accounts.", "All landholding farmer families with cultivable land in their names.", "Online registration via PM-KISAN portal or CSC centers with Aadhaar and land records.", "https://pmkisan.gov.in", "155261", "All Crops", 0.0, 999.0),
        ("PACS Computerization Scheme", "Cooperative & Credit", "PACS", "All India", "Centrally sponsored project to computerized 63,000 functional PACS on a unified ERP platform.", "Modernized accounting, transparent fertilizer distribution, direct credit linkage.", "Registered Primary Agricultural Credit Societies across all States and UTs.", "State Cooperative Registrar coordinates PACS onboarding to National ERP.", "https://cooperation.gov.in", "1800-180-1551", "All Crops", 0.0, 999.0),
        ("Kisan Credit Card (KCC) Scheme", "Credit & Finance", "Farmer", "All India", "Concessional institutional credit for crop cultivation, post-harvest expenses, and allied activities.", "Effective interest rate of 4% per annum with prompt repayment incentive (3% subvention).", "Farmers, individual/joint borrowers, SHGs, Joint Liability Groups, sharecroppers.", "Apply at nearest commercial bank, regional rural bank, or cooperative society.", "https://agricoop.nic.in", "1800-115-526", "All Crops", 0.0, 999.0),
        ("Pradhan Mantri Krishi Sinchayee Yojana (PMKSY)", "Irrigation & Water", "Farmer", "All India", "Enhances water use efficiency and expands cultivable area under assured irrigation (Per Drop More Crop).", "Up to 55% subsidy on drip and sprinkler micro-irrigation systems for small/marginal farmers.", "All farmers having cultivable land with water source.", "Apply through District Agriculture Office or State Horticulture Department portal.", "https://pmksy.gov.in", "1800-180-1551", "Horticulture, Vegetables, Sugarcane", 0.1, 10.0),
        ("Soil Health Card Scheme", "Soil & Fertilizer", "Farmer", "All India", "Provides customized soil fertility status and nutrient recommendations to farmers every 2 years.", "Free testing of soil samples and dosage recommendations for fertilizers to reduce input costs.", "All farming families across all agricultural zones.", "Collect soil sample with Village Agriculture Extension Worker or PACS.", "https://soilhealth.dac.gov.in", "1800-180-1551", "All Crops", 0.0, 999.0),
        ("National Beekeeping & Honey Mission (NBHM)", "Allied Agri-Business", "Agri-entrepreneur", "All India", "Promoting scientific beekeeping to increase pollination, crop yield, and honey production income.", "Subsidy of 50-80% on bee boxes, colonies, extraction equipment, and custom hiring centers.", "Farmers, beekeepers, SHGs, Cooperatives, and FPOs.", "Apply online through National Bee Board portal or State Mission.", "https://nbb.gov.in", "011-23382012", "Mustard, Sunflower, Litchi", 0.0, 999.0),
        ("Agriculture Infrastructure Fund (AIF)", "Post-Harvest Infra", "PACS", "All India", "Medium-long term debt financing for post-harvest management infrastructure and community farming assets.", "3% per annum interest subvention up to ₹2 crore for a maximum period of 7 years.", "PACS, FPOs, Agri-entrepreneurs, Startups, and SHGs.", "Submit DPR on online AIF portal for approval and bank loan sanction.", "https://agriinfra.dac.gov.in", "011-23381012", "All Crops", 0.0, 999.0)
    ]

    for s in seed_schemes:
        cursor.execute("SELECT id FROM schemes WHERE name = ?;", (s[0],))
        if not cursor.fetchone():
            cursor.execute("""
            INSERT INTO schemes (name, category, user_type, state, description, benefits, eligibility, application_process, official_url, helpline, target_crops, min_landholding, max_landholding)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            """, s)

    # Seed initial documents
    seed_docs = [
        ("PMFBY Operational Guidelines", "PMFBY", "Ministry of Agriculture & Farmers Welfare", "PMFBY Official Portal", "documents/pmfby_operational_guidelines.pdf", 48, "https://pmfby.gov.in", "2023.2", "2023-07-01", "2023-07-01"),
        ("PM-KISAN Operational Guidelines", "PM-KISAN", "Ministry of Agriculture & Farmers Welfare", "PM-KISAN Official Portal", "documents/pmkisan_operational_guidelines.pdf", 32, "https://pmkisan.gov.in", "3.0", "2023-04-01", "2023-04-01"),
        ("PACS Model Bye-Laws 2023", "PACS", "Ministry of Cooperation", "Ministry of Cooperation", "documents/pacs_model_byelaws_2023.pdf", 24, "https://cooperation.gov.in", "2023", "2023-02-15", "2023-02-15"),
        ("Multi-State Co-operative Societies Act 2002 & Amendments", "Cooperative", "Ministry of Cooperation", "Ministry of Cooperation", "documents/mscs_act_amendments.pdf", 65, "https://cooperation.gov.in", "2023 Amdt", "2023-08-04", "2023-08-04")
    ]

    for d in seed_docs:
        cursor.execute("SELECT id FROM documents WHERE title = ?;", (d[0],))
        if not cursor.fetchone():
            cursor.execute("""
            INSERT INTO documents (title, category, department, source, file_path, pages, source_url, version, publication_date, effective_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            """, d)

    conn.commit()
    conn.close()

# User CRUD helper functions
def get_demo_user() -> Optional[Dict[str, Any]]:
    conn = get_connection()
    row = conn.execute("SELECT * FROM users WHERE phone = '9999999999' OR role = 'farmer' LIMIT 1;").fetchone()
    conn.close()
    return dict(row) if row else None

def get_user(user_id: int) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    row = conn.execute("SELECT * FROM users WHERE id = ?;", (user_id,)).fetchone()
    conn.close()
    return dict(row) if row else None

def get_user_by_identifier(identifier: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    clean_id = identifier.strip()
    row = conn.execute("SELECT * FROM users WHERE phone = ? OR email = ? OR firebase_uid = ?;", (clean_id, clean_id, clean_id)).fetchone()
    conn.close()
    return dict(row) if row else None

def get_user_by_firebase_uid(uid: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    row = conn.execute("SELECT * FROM users WHERE firebase_uid = ?;", (uid,)).fetchone()
    conn.close()
    return dict(row) if row else None

def create_user(
    name: str, 
    phone: str = None, 
    email: str = None, 
    role: str = "farmer", 
    state: str = "Madhya Pradesh", 
    district: str = "Hoshangabad", 
    pacs_id: str = None,
    landholding_acres: float = 2.5,
    primary_crops: str = "Wheat, Soybean",
    preferred_language: str = "en",
    occupation: str = "Farmer",
    firebase_uid: str = None
) -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO users (name, phone, email, role, state, district, pacs_id, landholding_acres, primary_crops, preferred_language, occupation, firebase_uid)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, (name, phone, email, role, state, district, pacs_id, landholding_acres, primary_crops, preferred_language, occupation, firebase_uid))
    user_id = cursor.lastrowid
    conn.commit()
    row = conn.execute("SELECT * FROM users WHERE id = ?;", (user_id,)).fetchone()
    conn.close()
    return dict(row)

def update_user_profile(user_id: int, data: dict) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    allowed_fields = [
        "name", "phone", "email", "state", "district", "pacs_id", 
        "landholding_acres", "primary_crops", "preferred_language", 
        "occupation", "category", "role"
    ]
    fields = []
    values = []
    for k, v in data.items():
        if k in allowed_fields:
            fields.append(f"{k} = ?")
            values.append(v)
    if fields:
        values.append(user_id)
        cursor.execute(f"UPDATE users SET {', '.join(fields)} WHERE id = ?;", tuple(values))
        conn.commit()
    row = conn.execute("SELECT * FROM users WHERE id = ?;", (user_id,)).fetchone()
    conn.close()
    return dict(row) if row else None

# Chat CRUD helper functions
def save_chat(
    user_id: int, 
    question: str, 
    answer: str, 
    language: str = "en", 
    topic: str = "General",
    intent: str = "GENERAL_AGRICULTURE",
    sources: list = None,
    conversation_id: str = "default"
) -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    sources_str = json.dumps(sources or [])
    cursor.execute("""
    INSERT INTO chat_history (user_id, conversation_id, question, answer, language, topic, intent, sources_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    """, (user_id, conversation_id, question, answer, language, topic, intent, sources_str))
    chat_id = cursor.lastrowid
    conn.commit()
    row = conn.execute("SELECT * FROM chat_history WHERE id = ?;", (chat_id,)).fetchone()
    conn.close()
    result = dict(row)
    result["sources"] = json.loads(result.get("sources_json") or "[]")
    return result

def get_chat_history(user_id: int = None, limit: int = 50, conversation_id: str = None) -> List[Dict[str, Any]]:
    conn = get_connection()
    query = "SELECT * FROM chat_history WHERE 1=1"
    params = []
    if user_id:
        query += " AND user_id = ?"
        params.append(user_id)
    if conversation_id:
        query += " AND conversation_id = ?"
        params.append(conversation_id)
    query += " ORDER BY created_at DESC LIMIT ?;"
    params.append(limit)
    
    rows = conn.execute(query, tuple(params)).fetchall()
    conn.close()
    results = []
    for r in rows:
        d = dict(r)
        d["sources"] = json.loads(d.get("sources_json") or "[]")
        results.append(d)
    return results

def clear_chat_history(user_id: int, conversation_id: str = None):
    conn = get_connection()
    if conversation_id:
        conn.execute("DELETE FROM chat_history WHERE user_id = ? AND conversation_id = ?;", (user_id, conversation_id))
    else:
        conn.execute("DELETE FROM chat_history WHERE user_id = ?;", (user_id,))
    conn.commit()
    conn.close()

# Schemes CRUD helper functions
def get_schemes() -> List[Dict[str, Any]]:
    conn = get_connection()
    rows = conn.execute("SELECT * FROM schemes ORDER BY id ASC;").fetchall()
    conn.close()
    return [dict(r) for r in rows]

def search_schemes(
    user_type: str = None, 
    requirement: str = None, 
    state: str = None,
    crop: str = None,
    landholding: float = None
) -> List[Dict[str, Any]]:
    conn = get_connection()
    query = "SELECT * FROM schemes WHERE 1=1"
    params = []
    if user_type and user_type.lower() != "all":
        query += " AND (user_type LIKE ? OR user_type = 'All India')"
        params.append(f"%{user_type}%")
    if requirement and requirement.lower() != "all":
        query += " AND (category LIKE ? OR description LIKE ? OR name LIKE ?)"
        params.extend([f"%{requirement}%", f"%{requirement}%", f"%{requirement}%"])
    if state and state.lower() != "all india" and state.lower() != "all":
        query += " AND (state = 'All India' OR state LIKE ?)"
        params.append(f"%{state}%")
    if crop and crop.lower() != "all":
        query += " AND (target_crops = 'All Crops' OR target_crops LIKE ?)"
        params.append(f"%{crop}%")
    if landholding is not None:
        query += " AND min_landholding <= ? AND max_landholding >= ?"
        params.extend([landholding, landholding])
    
    rows = conn.execute(query, tuple(params)).fetchall()
    conn.close()
    return [dict(r) for r in rows]

# Documents & Chunks CRUD helper functions
def create_document(
    title: str, 
    category: str, 
    source: str, 
    file_path: str, 
    pages: int = 1,
    department: str = "Ministry of Agriculture & Farmers Welfare",
    source_url: str = "https://agricoop.nic.in",
    version: str = "1.0",
    publication_date: str = "2023-01-01"
) -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO documents (title, category, department, source, file_path, pages, source_url, version, publication_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, (title, category, department, source, file_path, pages, source_url, version, publication_date))
    doc_id = cursor.lastrowid
    conn.commit()
    row = conn.execute("SELECT * FROM documents WHERE id = ?;", (doc_id,)).fetchone()
    conn.close()
    return dict(row)

def get_documents() -> List[Dict[str, Any]]:
    conn = get_connection()
    rows = conn.execute("SELECT * FROM documents ORDER BY id ASC;").fetchall()
    conn.close()
    return [dict(r) for r in rows]

def delete_document(doc_id: int) -> bool:
    conn = get_connection()
    conn.execute("DELETE FROM documents WHERE id = ?;", (doc_id,))
    conn.commit()
    conn.close()
    return True

def save_document_chunk(
    document_id: int,
    document_name: str,
    category: str,
    department: str,
    source_url: str,
    page_number: int,
    content: str,
    language: str = "en",
    publication_date: str = None,
    last_updated: str = None,
    state: str = "All India",
    document_type: str = "Operational Guidelines",
    embedding: list = None
) -> int:
    conn = get_connection()
    cursor = conn.cursor()
    emb_str = json.dumps(embedding or [])
    cursor.execute("""
    INSERT INTO document_chunks (document_id, document_name, category, department, source_url, page_number, content, language, publication_date, last_updated, state, document_type, embedding_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, (document_id, document_name, category, department, source_url, page_number, content, language, publication_date, last_updated, state, document_type, emb_str))
    chunk_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return chunk_id

def get_document_chunks(category: str = None, limit: int = 500) -> List[Dict[str, Any]]:
    conn = get_connection()
    if category and category.lower() != "all":
        rows = conn.execute("SELECT * FROM document_chunks WHERE category = ? LIMIT ?;", (category, limit)).fetchall()
    else:
        rows = conn.execute("SELECT * FROM document_chunks LIMIT ?;", (limit,)).fetchall()
    conn.close()
    results = []
    for r in rows:
        d = dict(r)
        d["embedding"] = json.loads(d.get("embedding_json") or "[]")
        results.append(d)
    return results

def delete_document_chunks(document_id: int):
    conn = get_connection()
    conn.execute("DELETE FROM document_chunks WHERE document_id = ?;", (document_id,))
    conn.commit()
    conn.close()

# Grievances CRUD helper functions
def create_grievance(
    user_id: int, 
    category: str, 
    description: str, 
    farmer_name: str = None, 
    district: str = None, 
    state: str = None, 
    contact: str = None, 
    letter_text: str = None, 
    status: str = "draft",
    escalation_authority: str = None
) -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO grievances (user_id, category, description, farmer_name, district, state, contact, letter_text, status, escalation_authority)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, (user_id, category, description, farmer_name, district, state, contact, letter_text, status, escalation_authority))
    g_id = cursor.lastrowid
    conn.commit()
    row = conn.execute("SELECT * FROM grievances WHERE id = ?;", (g_id,)).fetchone()
    conn.close()
    return dict(row)

def get_grievances(user_id: int = None) -> List[Dict[str, Any]]:
    conn = get_connection()
    if user_id:
        rows = conn.execute("SELECT * FROM grievances WHERE user_id = ? ORDER BY created_at DESC;", (user_id,)).fetchall()
    else:
        rows = conn.execute("SELECT * FROM grievances ORDER BY created_at DESC;").fetchall()
    conn.close()
    return [dict(r) for r in rows]

def update_grievance_status(grievance_id: int, status: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    conn.execute("UPDATE grievances SET status = ? WHERE id = ?;", (status, grievance_id))
    conn.commit()
    row = conn.execute("SELECT * FROM grievances WHERE id = ?;", (grievance_id,)).fetchone()
    conn.close()
    return dict(row) if row else None

# Official Sources helper functions
def get_official_sources(category: str = None) -> List[Dict[str, Any]]:
    conn = get_connection()
    if category:
        rows = conn.execute("SELECT * FROM official_sources WHERE is_active = 1 AND categories LIKE ? ORDER BY priority ASC;", (f"%{category}%",)).fetchall()
    else:
        rows = conn.execute("SELECT * FROM official_sources WHERE is_active = 1 ORDER BY priority ASC, id ASC;").fetchall()
    conn.close()
    return [dict(r) for r in rows]
