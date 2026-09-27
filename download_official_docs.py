import os
import urllib.request
import ssl

DOCS_DIR = os.path.join(os.path.dirname(__file__), "backend", "documents")
os.makedirs(DOCS_DIR, exist_ok=True)

targets = [
    {
        "title": "PMFBY Operational Guidelines",
        "category": "PMFBY",
        "source": "PMFBY Official Portal",
        "url": "https://pmfby.gov.in/pdf/Revised_Operational_Guidelines.pdf",
        "filename": "pmfby_operational_guidelines.pdf"
    },
    {
        "title": "PM-KISAN Operational Guidelines",
        "category": "PM-KISAN",
        "source": "PM-KISAN Official Portal",
        "url": "https://pmkisan.gov.in/Documents/RevisedPM-KISANOperationalGuidelines%28English%29.pdf",
        "filename": "pmkisan_operational_guidelines.pdf"
    }
]

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

# Create SSL context that verifies certificates but handles common government portal CA bundles
ctx = ssl.create_default_context()

results = []

for t in targets:
    dest_path = os.path.join(DOCS_DIR, t["filename"])
    print(f"Connecting to {t['url']}...")
    try:
        req = urllib.request.Request(t["url"], headers=headers)
        with urllib.request.urlopen(req, context=ctx, timeout=30) as resp:
            content_type = resp.headers.get("Content-Type", "")
            data = resp.read()
            
            # Check if downloaded data is a valid PDF (magic bytes %PDF)
            if data[:4] == b"%PDF":
                with open(dest_path, "wb") as f:
                    f.write(data)
                size_kb = len(data) / 1024
                print(f"[SUCCESS] Downloaded {t['filename']} ({size_kb:.1f} KB) - Valid PDF header verified.")
                results.append({
                    "title": t["title"],
                    "category": t["category"],
                    "source": t["source"],
                    "file_path": f"documents/{t['filename']}",
                    "size_bytes": len(data),
                    "status": "downloaded"
                })
            else:
                print(f"[FAIL] Response from {t['url']} is not a valid PDF file. Header: {data[:20]}")
    except Exception as e:
        print(f"[ERROR] Failed to download {t['title']} from {t['url']}: {e}")

print("Results:", results)
