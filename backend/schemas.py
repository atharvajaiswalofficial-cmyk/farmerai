from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

# Auth Schemas
class SendOtpRequest(BaseModel):
    identifier: str = Field(..., description="Phone number or Email address")

class VerifyOtpRequest(BaseModel):
    identifier: str = Field(..., description="Phone number or Email address")
    otp: str = Field(..., description="6-digit verification OTP code")
    name: Optional[str] = Field(None, description="Farmer or Member Name")
    role: Optional[str] = Field("farmer", description="Role: farmer, pacs_member, cooperative_member, admin")
    state: Optional[str] = Field("Madhya Pradesh", description="State")
    district: Optional[str] = Field("Hoshangabad", description="District")
    pacs_id: Optional[str] = Field(None, description="Primary Agricultural Credit Society ID")
    landholding_acres: Optional[float] = Field(2.5, description="Cultivable Landholding in acres")
    primary_crops: Optional[str] = Field("Wheat, Soybean", description="Major cultivated crops")
    preferred_language: Optional[str] = Field("en", description="Preferred Language code")

class OtpResponse(BaseModel):
    status: str
    message: str
    identifier: str
    cooldown_seconds: int = 60
    expires_in_seconds: int = 300

class AuthResponse(BaseModel):
    status: str
    message: str
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

# User & Profile Schemas
class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    pacs_id: Optional[str] = None
    landholding_acres: Optional[float] = None
    primary_crops: Optional[str] = None
    preferred_language: Optional[str] = None
    occupation: Optional[str] = None
    category: Optional[str] = None
    role: Optional[str] = None

# Chat & Citations Schemas
class SourceCitation(BaseModel):
    title: str
    department: Optional[str] = "Government of India"
    source: str
    page: Optional[int] = 1
    source_url: Optional[str] = None
    snippet: Optional[str] = None
    publication_date: Optional[str] = None
    document_type: Optional[str] = "Operational Guidelines"

class ChatRequest(BaseModel):
    message: str
    language: Optional[str] = "en"
    input_mode: Optional[str] = "text"
    user_id: Optional[int] = None
    conversation_id: Optional[str] = "default"
    use_profile: Optional[bool] = True

class ChatResponse(BaseModel):
    success: bool = True
    answer: str
    language: str
    input_mode: Optional[str] = "text"
    topic: str
    intent: Optional[str] = "GENERAL_AGRICULTURE"
    source: str
    grounded: bool
    ai_generated: bool
    sources: List[SourceCitation] = []
    audio_url: Optional[str] = None
    chat_id: Optional[int] = None
    suggested_actions: Optional[List[str]] = []

# Schemes Schemas
class SchemeSearchRequest(BaseModel):
    user_type: Optional[str] = "Farmer"
    requirement: Optional[str] = None
    state: Optional[str] = "All India"
    crop: Optional[str] = None
    landholding: Optional[float] = None

# Grievance Schemas
class GrievanceGuidanceRequest(BaseModel):
    category: str
    description: str

class GrievanceDraftRequest(BaseModel):
    category: str
    description: str
    farmer_name: Optional[str] = "Rameshwar Patel"
    district: Optional[str] = "Hoshangabad"
    state: Optional[str] = "Madhya Pradesh"
    contact: Optional[str] = "+91 98765 43210"
    user_id: Optional[int] = None
    language: Optional[str] = "en"

# Voice Schemas
class VoiceTranscribeRequest(BaseModel):
    audio_base64: str = Field(..., description="Base64 encoded audio bytes")
    language: Optional[str] = "hi"
    audio_format: Optional[str] = "wav"

class VoiceTranscribeResponse(BaseModel):
    status: str
    transcript: str
    detected_language: str
    confidence: float = 0.95

class VoiceSynthesizeRequest(BaseModel):
    text: str
    language: Optional[str] = "hi"
    voice_gender: Optional[str] = "female"

class VoiceSynthesizeResponse(BaseModel):
    status: str
    audio_base64: str
    mime_type: str = "audio/mp3"
    language: str

# Official Source Schema
class OfficialSourceResponse(BaseModel):
    id: int
    source_name: str
    domain: str
    authority: str
    priority: int
    categories: str
    portal_url: str
    helpline: Optional[str]
    is_active: bool
