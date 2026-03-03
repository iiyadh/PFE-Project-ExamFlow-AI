from fastapi import FastAPI
import os
from app.services.file_service import (
    get_signed_url,
    download_file,
    extract_text
)
from app.services.ai_service import structure_content

app = FastAPI()


@app.post("/convert/{public_id}")
def convert_course(public_id: str):
    url = get_signed_url(public_id)
    filename = f"/tmp/{public_id}.pdf"
    download_file(url, filename)
    text = extract_text(filename)
    structured_markdown = structure_content(text)
    os.remove(filename)
    return {"markdown": structured_markdown}