from fastapi import FastAPI, HTTPException
import os
from app.services.file_service import (
    get_signed_url,
    download_file,
    extract_text
)
from app.services.convert_ai_service import structure_content

app = FastAPI()


@app.post("/convert/{public_id}")
def convert_course(public_id: str):
    try:
        url = get_signed_url(public_id)
        filename = f"/tmp/{public_id}.pdf"
        download_file(url, filename)
        text = extract_text(filename)
        structured_markdown = structure_content(text)
        os.remove(filename)
        return {"markdown": structured_markdown}
    except ValueError as e:
        raise HTTPException(status_code=413, detail=str(e))
    except Exception as e:
        if "rate limit" in str(e).lower():
            raise HTTPException(status_code=429, detail=str(e))
        elif "timeout" in str(e).lower():
            raise HTTPException(status_code=504, detail=str(e))
        else:
            raise HTTPException(status_code=500, detail=f"Error processing course: {str(e)}")
    finally:
        if os.path.exists(f"/tmp/{public_id}.pdf"):
            os.remove(f"/tmp/{public_id}.pdf")