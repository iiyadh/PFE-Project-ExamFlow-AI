import os
import asyncio
from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
from app.services.file_service import extract_text
from app.services.convert_ai_service import generate_course_meta, generate_section_plan, generate_section_content
from app.services.generate_question_ai_service import generate_questions as generate_questions_rag
from app.services.vector_service import store_text_chunks, get_chunks_by_source
from langchain_text_splitters import RecursiveCharacterTextSplitter

app = FastAPI(title="Local AI File Service")


class ConvertRequest(BaseModel):
    source: str


class GenerateQuestionRequest(BaseModel):
    q_type: str
    difficulty: str
    num_questions: int
    mode: str = "upload"
    chapter: str = ""
    course: str = ""
    prompt: str = ""
    language: str = "English"
    blooms: str = "Any level"
    instructions: str = ""


@app.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    try:
        temp_path = f"/tmp/{file.filename}"
        with open(temp_path, "wb") as f:
            f.write(await file.read())

        text = extract_text(temp_path)
        os.remove(temp_path)

        splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=50,
            add_start_index=True,
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
        raise HTTPException(status_code=500, detail=f"Error processing file '{file.filename}': {str(e)}")


@app.post("/convert/")
async def convert_file(request: ConvertRequest):
    try:
        chunks = get_chunks_by_source(request.source)
        if not chunks or not chunks.get("documents"):
            raise HTTPException(status_code=404, detail=f"No content found for source '{request.source}'.")

        full_text = " ".join(chunks["documents"])

        loop = asyncio.get_event_loop()
        course_meta = await loop.run_in_executor(None, generate_course_meta, full_text)
        course_title = course_meta.get("title", "Untitled Course")

        section_plan = await loop.run_in_executor(None, generate_section_plan, full_text, course_title)
        if not section_plan:
            raise HTTPException(status_code=500, detail="Failed to generate section plan.")

        contents = await asyncio.gather(*[
            loop.run_in_executor(None, generate_section_content, full_text, course_title, section, index)
            for index, section in enumerate(section_plan)
        ])

        sections = [
            {"title": section["title"], "content": content.get("content", "")}
            for section, content in zip(section_plan, contents)
        ]

        return {"course_meta": course_meta, "sections": sections}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error converting file '{request.source}': {e}")
        raise HTTPException(status_code=500, detail=f"Error converting file '{request.source}': {str(e)}")


@app.post("/generate-questions/")
async def generate_questions(request: GenerateQuestionRequest):
    try:
        questions = generate_questions_rag(
            q_type=request.q_type,
            difficulty=request.difficulty,
            num_questions=request.num_questions,
            mode=request.mode,
            chapter=request.chapter,
            course=request.course,
            custom_prompt=request.prompt,
            language=request.language,
            blooms=request.blooms,
            instructions=request.instructions,
        )
        return {"questions": questions}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Error generating questions for chapter '{request.chapter}': {e}")
        raise HTTPException(status_code=500, detail=f"Error generating questions: {str(e)}")
