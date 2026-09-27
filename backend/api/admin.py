import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from services.auth_service import get_admin_user
from database import get_connection, get_documents, create_document, delete_document
from rag.ingestion import ingest_pdf_document

router = APIRouter(tags=["Admin & Documents"])

@router.get("/api/admin/stats")
def get_admin_stats_route(admin_user: dict = Depends(get_admin_user)):
    conn = get_connection()
    user_count = conn.execute("SELECT COUNT(*) FROM users;").fetchone()[0]
    chat_count = conn.execute("SELECT COUNT(*) FROM chat_history;").fetchone()[0]
    grievance_count = conn.execute("SELECT COUNT(*) FROM grievances;").fetchone()[0]
    scheme_count = conn.execute("SELECT COUNT(*) FROM schemes;").fetchone()[0]
    doc_count = conn.execute("SELECT COUNT(*) FROM documents;").fetchone()[0]
    chunk_count = conn.execute("SELECT COUNT(*) FROM document_chunks;").fetchone()[0]
    sources_count = conn.execute("SELECT COUNT(*) FROM official_sources WHERE is_active = 1;").fetchone()[0]
    conn.close()
    
    return {
        "totalUsers": user_count,
        "questionsAsked": chat_count,
        "grievancesDrafted": grievance_count,
        "activeSchemes": scheme_count,
        "indexedDocuments": doc_count,
        "vectorChunks": chunk_count,
        "officialSources": sources_count,
        "systemStatus": "healthy"
    }

@router.get("/api/documents")
@router.get("/api/admin/documents")
def get_documents_route():
    return get_documents()

@router.post("/api/admin/documents/index")
def reindex_document_route(doc_id: int, admin_user: dict = Depends(get_admin_user)):
    conn = get_connection()
    doc = conn.execute("SELECT * FROM documents WHERE id = ?;", (doc_id,)).fetchone()
    conn.close()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    full_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), doc["file_path"])
    if not os.path.exists(full_path):
        raise HTTPException(status_code=400, detail="Physical PDF document file not found")
        
    total_chunks = ingest_pdf_document(
        doc_id=doc["id"],
        file_path=full_path,
        document_name=doc["title"],
        category=doc["category"],
        department=doc["department"],
        source_url=doc["source_url"],
        publication_date=doc["publication_date"]
    )
    
    return {
        "status": "success",
        "message": f"Successfully indexed {total_chunks} chunks for {doc['title']}",
        "document_id": doc_id,
        "chunks_created": total_chunks
    }

@router.post("/api/admin/documents/upload")
async def upload_document_route(
    file: UploadFile = File(...),
    title: str = Form(...),
    category: str = Form(...),
    department: str = Form("Ministry of Agriculture & Farmers Welfare"),
    source_url: str = Form("https://agricoop.nic.in"),
    admin_user: dict = Depends(get_admin_user)
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only official PDF documents are accepted.")

    docs_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "documents")
    os.makedirs(docs_dir, exist_ok=True)
    
    clean_filename = file.filename.replace(" ", "_").lower()
    dest_path = os.path.join(docs_dir, clean_filename)
    
    with open(dest_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    # Validate PDF magic bytes
    with open(dest_path, "rb") as f:
        header = f.read(4)
        if header != b"%PDF":
            os.remove(dest_path)
            raise HTTPException(status_code=400, detail="Uploaded file is not a valid PDF document.")

    doc = create_document(
        title=title,
        category=category,
        source=department,
        file_path=f"documents/{clean_filename}",
        department=department,
        source_url=source_url
    )

    # Ingest chunks
    try:
        chunks = ingest_pdf_document(
            doc_id=doc["id"],
            file_path=dest_path,
            document_name=title,
            category=category,
            department=department,
            source_url=source_url
        )
    except Exception as e:
        chunks = 0

    return {
        "status": "success",
        "document": doc,
        "chunks_indexed": chunks
    }

@router.delete("/api/admin/documents/{doc_id}")
def delete_document_route(doc_id: int, admin_user: dict = Depends(get_admin_user)):
    delete_document(doc_id)
    return {"status": "success", "message": f"Document {doc_id} deleted."}
