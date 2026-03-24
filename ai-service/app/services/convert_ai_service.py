import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from openai import RateLimitError, APIError, APITimeoutError
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

load_dotenv()

llm = ChatOpenAI(
    model="gpt-4o-mini",
    temperature=0.3,
    api_key=os.getenv("OPENAI_API_KEY"),
    max_tokens=4096,
    request_timeout=60,
    max_retries=3
)

prompt = PromptTemplate.from_template("""
You are an AI that structures educational content into a course format.

Convert the content below into a valid JSON object that strictly follows this structure:

{{
  "title": "Course Title",
  "description": "A brief course description",
  "level": "Beginner" | "Intermediate" | "Advanced",
  "image": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "markdownContent": [
    {{
      "title": "Section or Module Title",
      "content": "Full markdown content for this section including lessons, bullet points, explanations, etc."
    }}
  ]
}}

Rules:
- "title": a concise course title
- "description": a 1-2 sentence summary of the entire course
- "level": must be exactly one of "Beginner", "Intermediate", or "Advanced" — infer from the content complexity
- "image": a CSS linear-gradient string. Choose colors that visually match the course topic/mood.
    Format must be exactly: "linear-gradient(135deg, #RRGGBB 0%, #RRGGBB 100%)"
    Examples:
      - Python/AI topics:     "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      - Web development:      "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
      - Data/Analytics:       "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
      - Security/Systems:     "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
      - Mobile/Design:        "linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
- "markdownContent": an array of sections/modules. Each item must have:
    - "title": the section title (e.g. "Module 1: Introduction")
    - "content": rich Markdown content for that section (lessons, bullet points, code blocks, summaries, etc.)
- Return ONLY the JSON object. No extra text, no markdown fences.

Content:
{content}
""")

parser = StrOutputParser()

chain = prompt | llm | parser


@retry(
    retry=retry_if_exception_type((RateLimitError, APITimeoutError, APIError)),
    stop=stop_after_attempt(5),
    wait=wait_exponential(multiplier=1, min=2, max=60)
)
def structure_content(text):
    try:
        if len(text) > 100000:
            raise ValueError("Input text exceeds maximum context length. Please provide a smaller document.")

        return chain.invoke({"content": text})
    except RateLimitError as e:
        raise Exception(f"OpenAI rate limit exceeded. Please try again later. Details: {str(e)}")
    except APITimeoutError as e:
        raise Exception(f"OpenAI API timeout. The request took too long. Details: {str(e)}")
    except APIError as e:
        raise Exception(f"OpenAI API error occurred. Details: {str(e)}")
    except Exception as e:
        raise Exception(f"Failed to structure content: {str(e)}")