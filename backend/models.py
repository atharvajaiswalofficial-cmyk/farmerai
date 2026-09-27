from dataclasses import dataclass
from typing import Optional, List
from datetime import datetime

@dataclass
class User:
    id: int
    name: str
    phone: Optional[str]
    email: Optional[str]
    role: str
    state: Optional[str]
    district: Optional[str]
    pacs_id: Optional[str]
    landholding_acres: Optional[float]
    primary_crops: Optional[str]
    preferred_language: str
    firebase_uid: Optional[str]
    created_at: datetime

@dataclass
class DocumentChunk:
    id: int
    document_id: int
    document_name: str
    category: str
    department: str
    source_url: str
    page_number: int
    content: str
    language: str
    publication_date: Optional[str]
    last_updated: Optional[str]
    state: Optional[str]
    document_type: str
