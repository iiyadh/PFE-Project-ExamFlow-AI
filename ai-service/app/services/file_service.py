import os
from pypdf import PdfReader
import docx2txt

def extract_text(file_path: str) -> str:
    """Extract text from PDF or DOCX."""
    if file_path.endswith(".pdf"):
        reader = PdfReader(file_path)
        text = ""
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
        return text

    elif file_path.endswith(".docx"):
        return docx2txt.process(file_path)

    else:
        raise ValueError("Unsupported file type")