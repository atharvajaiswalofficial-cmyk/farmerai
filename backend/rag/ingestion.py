import os
import re
from typing import List, Dict, Any
from pypdf import PdfReader
from database import get_connection, save_document_chunk, delete_document_chunks
from rag.embeddings import generate_multilingual_embedding

def clean_extracted_text(text: str) -> str:
    """Remove header/footer noise and excessive whitespace."""
    if not text:
        return ""
    text = re.sub(r'[\r\t]+', ' ', text)
    text = re.sub(r'Page\s+\d+\s+of\s+\d+', '', text, flags=re.IGNORECASE)
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = re.sub(r' {2,}', ' ', text)
    return text.strip()

def chunk_text(text: str, chunk_size: int = 400, overlap: int = 80) -> List[str]:
    """Split text into semantic paragraphs with window overlap."""
    words = text.split()
    if not words:
        return []
        
    chunks = []
    start = 0
    while start < len(words):
        end = min(start + chunk_size, len(words))
        chunk_words = words[start:end]
        chunks.append(" ".join(chunk_words))
        if end >= len(words):
            break
        start += (chunk_size - overlap)
    return chunks

def ingest_pdf_document(
    doc_id: int, 
    file_path: str, 
    document_name: str, 
    category: str, 
    department: str = "Ministry of Agriculture & Farmers Welfare",
    source_url: str = "https://agricoop.nic.in",
    publication_date: str = "2023-01-01"
) -> int:
    """
    Extract text page by page from PDF, chunk, embed, and store in database chunks table.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"PDF file not found at {file_path}")

    # Clear previous chunks for idempotency
    delete_document_chunks(doc_id)

    reader = PdfReader(file_path)
    total_pages = len(reader.pages)
    total_chunks = 0

    for page_idx, page in enumerate(reader.pages, 1):
        raw_text = page.extract_text() or ""
        cleaned = clean_extracted_text(raw_text)
        if len(cleaned) < 30:
            continue
            
        page_chunks = chunk_text(cleaned, chunk_size=250, overlap=50)
        for chunk in page_chunks:
            emb = generate_multilingual_embedding(chunk)
            save_document_chunk(
                document_id=doc_id,
                document_name=document_name,
                category=category,
                department=department or "Ministry of Agriculture & Farmers Welfare",
                source_url=source_url or "https://agricoop.nic.in",
                page_number=page_idx,
                content=chunk,
                language="en",
                publication_date=publication_date or "2023-01-01",
                last_updated="2026-09-27",
                state="All India",
                document_type="Operational Guidelines",
                embedding=emb
            )
            total_chunks += 1

    # Update total pages in documents table
    conn = get_connection()
    conn.execute("UPDATE documents SET pages = ? WHERE id = ?;", (total_pages, doc_id))
    conn.commit()
    conn.close()

    return total_chunks

def seed_all_documents(base_dir: str):
    """Scan and ingest all seeded physical documents if not already ingested."""
    conn = get_connection()
    chunks_count = conn.execute("SELECT COUNT(*) FROM document_chunks;").fetchone()[0]
    if chunks_count > 0:
        conn.close()
        return
    docs = conn.execute("SELECT * FROM documents;").fetchall()
    conn.close()

    for d in docs:
        d_dict = dict(d)
        full_path = os.path.join(base_dir, d_dict.get("file_path", ""))
        if os.path.exists(full_path):
            try:
                ingest_pdf_document(
                    doc_id=d_dict["id"],
                    file_path=full_path,
                    document_name=d_dict["title"],
                    category=d_dict["category"],
                    department=d_dict.get("department", "Ministry of Agriculture & Farmers Welfare"),
                    source_url=d_dict.get("source_url", "https://agricoop.nic.in"),
                    publication_date=d_dict.get("publication_date", "2023-01-01")
                )
            except Exception as e:
                print(f"Error ingesting {d_dict.get('title')}: {e}")
