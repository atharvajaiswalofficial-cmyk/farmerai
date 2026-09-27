import os
from pathlib import Path
from typing import List, Dict, Any
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR.parent / ".env")
load_dotenv(BASE_DIR / ".env")

# Database
DB_PATH = os.getenv("DATABASE_URL", str(BASE_DIR / "sahayak.db"))

# Security
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "sahayak-ai-super-secure-production-jwt-key-2026")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30
OTP_EXPIRY_MINUTES = int(os.getenv("OTP_EXPIRY_MINUTES", "5"))
OTP_RESEND_COOLDOWN_SECONDS = int(os.getenv("OTP_RESEND_COOLDOWN_SECONDS", "60"))
MAX_OTP_ATTEMPTS = int(os.getenv("MAX_OTP_ATTEMPTS", "3"))

# LLM & AI
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
AI_API_KEY = os.getenv("AI_API_KEY", "")
AI_MODEL = os.getenv("AI_MODEL", "gpt-4o-mini")
AI_BASE_URL = os.getenv("AI_BASE_URL", "https://api.openai.com/v1")

# RAG & Embeddings
RAG_STORE_DIR = str(BASE_DIR / "rag_store")
DOCUMENTS_DIR = str(BASE_DIR / "documents")
KNOWLEDGE_DIR = str(BASE_DIR / "knowledge")
RAG_TOP_K = int(os.getenv("RAG_TOP_K", "5"))
RAG_DISTANCE_THRESHOLD = float(os.getenv("RAG_DISTANCE_THRESHOLD", "0.45"))

# Supported Languages Configuration
SUPPORTED_LANGUAGES: Dict[str, Dict[str, str]] = {
    "en": {"name": "English", "native": "English", "code": "en", "voice_code": "en-IN"},
    "hi": {"name": "Hindi", "native": "हिंदी", "code": "hi", "voice_code": "hi-IN"},
    "mr": {"name": "Marathi", "native": "मराठी", "code": "mr", "voice_code": "mr-IN"},
    "gu": {"name": "Gujarati", "native": "ગુજરાતી", "code": "gu", "voice_code": "gu-IN"},
    "pa": {"name": "Punjabi", "native": "ਪੰਜਾਬੀ", "code": "pa", "voice_code": "pa-IN"},
    "bn": {"name": "Bengali", "native": "বাংলা", "code": "bn", "voice_code": "bn-IN"},
    "ta": {"name": "Tamil", "native": "தமிழ்", "code": "ta", "voice_code": "ta-IN"},
    "te": {"name": "Telugu", "native": "తెలుగు", "code": "te", "voice_code": "te-IN"},
    "kn": {"name": "Kannada", "native": "ಕನ್ನಡ", "code": "kn", "voice_code": "kn-IN"},
    "ml": {"name": "Malayalam", "native": "മലയാളം", "code": "ml", "voice_code": "ml-IN"},
    "or": {"name": "Odia", "native": "ଓଡ଼ିଆ", "code": "or", "voice_code": "or-IN"},
    "as": {"name": "Assamese", "native": "অসমীয়া", "code": "as", "voice_code": "as-IN"}
}
