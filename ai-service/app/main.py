import os
from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
from app.services.file_service import extract_text
from app.services.convert_ai_service import generate_course_meta, generate_section_plan, generate_section_content
from app.services.vector_service import store_text_chunks, get_chunks_by_source
from langchain_text_splitters import RecursiveCharacterTextSplitter

app = FastAPI(title="Local AI File Service")


class ConvertRequest(BaseModel):
    source: str


@app.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    """
    Upload a file → extract text → split into topic chunks → store in Chroma.
    No AI generation happens here.
    """
    try:
        temp_path = f"/tmp/{file.filename}"
        with open(temp_path, "wb") as f:
            f.write(await file.read())

        text = extract_text(temp_path)
        os.remove(temp_path)

        # Split text into chunks (each chunk represents a topic segment)
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=50,
            add_start_index=True,  # helps with topic ordering
        )
        chunks = splitter.split_text(text)

        store_text_chunks(chunks, source=file.filename)

        return {
            "message": f"File '{file.filename}' processed and stored successfully.",
            "source": file.filename,
            "stored_chunks": len(chunks),
        }
    except Exception as e:
        print(f"Error processing file '{file.filename}': {e}")
        return {"error": f"Error processing file '{file.filename}'."}


@app.post("/convert/")
def convert_file(request: ConvertRequest):
    """
    Convert a previously uploaded file (identified by source) into structured course content.
    This involves:
    1. Retrieving the text chunks for the source file.
    2. Generating course metadata (title, description).
    3. Creating a section plan (outline).
    4. Generating detailed content for each section.
    """
    try:
        chunks = get_chunks_by_source(request.source)
        if not chunks:
            return {"error": f"No content found for source '{request.source}'."}

        full_text = " ".join(chunks["documents"])
        course_meta = generate_course_meta(full_text)
        print(f"Generated course metadata: {course_meta}")

        return 0
        course_title = course_meta.get("title", "Untitled Course")

        section_plan = generate_section_plan(full_text, course_title)

        sections = []
        for index, section in enumerate(section_plan):
            content = generate_section_content(full_text, course_title, section, index)
            sections.append({
                "title": section["title"],
                "content": content.get("content", ""),
            })

        return {
            "course_meta": course_meta,
            "section_plan": section_plan,
            "sections": sections,
        }
    except Exception as e:
        print(f"Error converting file '{request.source}': {e}")
        return {"error": f"Error converting file '{request.source}'."}