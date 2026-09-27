import os
import sys
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(__file__))

from database import init_db
from rag.ingestion import seed_all_documents

# Import API Routers
from api.auth import router as auth_router
from api.chat import router as chat_router
from api.schemes import router as schemes_router
from api.profile import router as profile_router
from api.pmfby import router as pmfby_router
from api.pacs import router as pacs_router
from api.cooperative import router as coop_router
from api.financial import router as fin_router
from api.grievance import router as grievance_router
from api.voice import router as voice_router
from api.admin import router as admin_router
from api.sources import router as sources_router

# Initialize database schema
init_db()

# Ingest seeded PDFs into vector chunks if not already present
try:
    seed_all_documents(os.path.dirname(__file__))
except Exception as e:
    print(f"Warning: Initial document seeding skipped: {e}")

app = FastAPI(
    title="Sahayak AI (सहायक AI) API",
    description="Multilingual Agricultural, Cooperative & Scheme Intelligence Platform for Indian Farmers & Rural Communities",
    version="2.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root / Landing
@app.get("/")
def get_root():
    return {
        "service": "Sahayak AI Backend API",
        "status": "online",
        "version": "2.0.0",
        "docs_url": "/docs",
        "features": [
            "Grounded Multilingual RAG",
            "PMFBY 72h Crop Claim Guide",
            "PACS & Subsidized Fertilizer Hub",
            "Smart Scheme Recommender",
            "AI Grievance Draft Generator",
            "Real Voice Input (STT) & Speech Output (TTS)",
            "Official Source Registry"
        ]
    }

# Health Check
@app.get("/api/health")
def get_health():
    return {
        "status": "ok",
        "service": "Sahayak AI",
        "version": "2.0.0"
    }

# Mount All Modular Routers
app.include_router(auth_router)
app.include_router(chat_router)
app.include_router(schemes_router)
app.include_router(profile_router)
app.include_router(pmfby_router)
app.include_router(pacs_router)
app.include_router(coop_router)
app.include_router(fin_router)
app.include_router(grievance_router)
app.include_router(voice_router)
app.include_router(admin_router)
app.include_router(sources_router)
