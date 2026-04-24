import os
from dotenv import load_dotenv

load_dotenv()

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser

llm = ChatGoogleGenerativeAI(
    google_api_key=os.getenv("GEMINI_API_KEY"),
    model=os.getenv("GEMINI_MODEL", "gemini-3.1-flash-lite-preview"),
    temperature=0,
)
parser = JsonOutputParser()

# ─── Prompt 1: Course metadata only ────────────────────────────────────────────

_course_meta_prompt = PromptTemplate.from_template("""
Analyze this educational content and extract metadata.
Return a JSON object with: title, description (1 sentence max), level (Beginner/Intermediate/Advanced), and image (CSS gradient).

Example JSON format:
{{
  "title": "Course Name",
  "description": "What this teaches",
  "level": "Beginner",
  "image": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
}}

Content to analyze:
{content}
""")

_course_meta_chain = _course_meta_prompt | llm | parser


# ─── Prompt 2: Plan course sections (4–7) from full text ─────────────────────

_section_plan_prompt = PromptTemplate.from_template("""
Plan course sections from this content. Return a JSON array with 4-7 modules.
Each module: {{"title": "Module N: Name", "summary": "One sentence about this module"}}

Course: {course_title}

Content:
{content}
""")

_section_plan_chain = _section_plan_prompt | llm | parser

# ─── Prompt 3: Generate full markdown for one planned section ────────────────

_section_content_prompt = PromptTemplate.from_template("""
Write section {section_index} markdown for course "{course_title}".
Section: {section_title}

Return a JSON object: {{"title": "{section_title}", "content": "Detailed Markdown here"}}

Source content:
{content}
""")

_section_content_chain = _section_content_prompt | llm | parser


# ─── Public API ─────────────────────────────────────────────────────────────────

def generate_course_meta(full_text: str) -> dict:
    """"""
    try:
        return _course_meta_chain.invoke({"content": full_text})
    except Exception as e:
        print(f"Error generating course metadata: {e}")
        return {
            "title": "Untitled Course",
            "description": "No description available.",
            "level": "Beginner",
            "image": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        }


def generate_section_plan(full_text: str, course_title: str) -> list[dict]:
    """
    Plan course sections with minimal token usage.
    """
    try:
        return _section_plan_chain.invoke({"content": full_text, "course_title": course_title})
    except Exception as e:
        print(f"Error generating section plan: {e}")
        return []


def generate_section_content(full_text: str, course_title: str, section: dict, section_index: int) -> dict:
    """
    Generate section content with minimal token usage.
    """
    try:
        return _section_content_chain.invoke({
            "content": full_text,
            "course_title": course_title,
            "section_title": section.get("title", f"Section {section_index}"),
            "section_index": section_index,
        })
    except Exception as e:
        print(f"Error generating content for section '{section.get('title', '')}': {e}")
        return {"title": section.get("title", f"Section {section_index}"), "content": "Content generation failed."}
    