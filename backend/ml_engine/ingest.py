import os
import re
import json
import glob
from pathlib import Path
import pdfplumber
import pytesseract
from pdf2image import convert_from_path

def split_into_clauses(raw_text: str):
    """
    Split legal text into (label, text) pairs at natural legal boundaries.
    Includes Hindi markers for Gazette notifications.
    """
    pattern = r'(?=\n(?:Section|Rule|Schedule|Article|धारा|नियम|अनुसूची|अनुच्छेद)\s+[0-9A-Za-z\-\.]+)'
    parts = re.split(pattern, raw_text)
    
    clauses = []
    for part in parts:
        part = part.strip()
        if not part:
            continue
        
        header_match = re.search(r'(Section|Rule|Schedule|Article|धारा|नियम|अनुसूची|अनुच्छेद)\s+([0-9A-Za-z\-\.]+)', part)
        label = header_match.group(0) if header_match else "Preamble"
        clauses.append((label, part))
        
    return clauses

def extract_text_from_pdf(pdf_path: str) -> tuple[str, str]:
    """
    Try pdfplumber first. If the text is suspiciously short (scanned PDF),
    fallback to Tesseract OCR with English + Hindi support.
    Returns: (extracted_text, extraction_method)
    """
    text_parts = []
    total_pages = 0
    
    try:
        with pdfplumber.open(pdf_path) as pdf:
            total_pages = len(pdf.pages)
            for page in pdf.pages:
                page_text = page.extract_text() or ""
                text_parts.append(page_text)
    except Exception as e:
        print(f"Error reading {pdf_path} with pdfplumber: {e}")
        text_parts = []
        
    raw_text = "\n".join(text_parts).strip()
    
    if total_pages == 0 or (len(raw_text) / max(1, total_pages)) < 30:
        print(f"[{Path(pdf_path).name}] Suspiciously little text. Falling back to Tesseract OCR...")
        return run_ocr_on_pdf(pdf_path), "ocr"
        
    return raw_text, "pdfplumber"

def run_ocr_on_pdf(pdf_path: str) -> str:
    """
    Convert PDF to images and run Tesseract OCR with eng+hin.
    """
    text_parts = []
    try:
        images = convert_from_path(pdf_path)
        for i, img in enumerate(images):
            text = pytesseract.image_to_string(img, lang='eng+hin')
            text_parts.append(text)
    except Exception as e:
        print(f"OCR failed for {pdf_path}: {e}")
    
    return "\n".join(text_parts)

def ingest_directory(corpus_dir: str, output_jsonl: str):
    """
    Process all PDFs in the national/international directories.
    """
    pdf_paths = glob.glob(os.path.join(corpus_dir, "**", "*.pdf"), recursive=True)
    print(f"Found {len(pdf_paths)} PDFs to process in {corpus_dir}.")
    
    all_chunks = []
    
    for pdf_path in pdf_paths:
        doc_name = Path(pdf_path).stem
        # Fix: check /international/ explicitly FIRST, because "national"
        # is a substring of "international" and the old check was wrong
        normalized = pdf_path.replace("\\", "/").lower()
        if "/international/" in normalized:
            jurisdiction = "INTL"
        else:
            jurisdiction = "IN"
        
        raw_text, extraction_method = extract_text_from_pdf(pdf_path)
        
        if not raw_text.strip():
            print(f"WARNING: Could not extract any text from {doc_name}")
            continue
            
        clauses = split_into_clauses(raw_text)
        
        for i, (label, text) in enumerate(clauses):
            all_chunks.append({
                "chunk_id": f"{doc_name}::{label}::{i}",
                "document": doc_name,
                "clause_label": label,
                "text": text,
                "jurisdiction": jurisdiction,
                "extraction_method": extraction_method,
                "source_file": pdf_path
            })
            
    with open(output_jsonl, "w", encoding="utf-8") as f:
        for chunk in all_chunks:
            f.write(json.dumps(chunk, ensure_ascii=False) + "\n")
            
    print(f"\nSuccessfully saved {len(all_chunks)} chunks to {output_jsonl}")

if __name__ == "__main__":
    PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
    CORPUS_DIR = PROJECT_ROOT / "corpus_raw"
    OUTPUT_FILE = PROJECT_ROOT / "backend" / "data" / "chunks.jsonl"
    
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    print("Processing Corpus...")
    ingest_directory(str(CORPUS_DIR), str(OUTPUT_FILE))
    print("Processing Complete")