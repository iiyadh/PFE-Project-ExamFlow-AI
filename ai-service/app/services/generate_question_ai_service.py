import json
import os
import random
import re
from typing import Any, Callable, Dict, List, Optional

from langchain_google_genai import ChatGoogleGenerativeAI

from app.services.vector_service import query_vector_db

_llm = ChatGoogleGenerativeAI(
    google_api_key=os.getenv("GEMINI_API_KEY"),
    model=os.getenv("GEMINI_MODEL", "gemini-3.1-flash-lite-preview"),
    temperature=0.4,
)

# Schema hint covers all three DB question types.
# correctAnswer is text-based here; we convert to index(es) after parsing.
_JSON_SCHEMA_HINT = (
    'Return ONLY valid JSON — no markdown, no code fences.\n'
    'Format: {"questions":[...]} where each item is one of:\n\n'
    'single_answer (exactly one correct option):\n'
    '  {"type":"single_answer","question":"...","options":["A","B","C","D"],'
    '"correctAnswer":"<exact option text>","difficulty":"easy|medium|hard"}\n\n'
    'multiple_answer (two or more correct options):\n'
    '  {"type":"multiple_answer","question":"...","options":["A","B","C","D"],'
    '"correctAnswer":["<opt1>","<opt2>"],"difficulty":"easy|medium|hard"}\n\n'
    'short_answer (free-text, no options):\n'
    '  {"type":"short_answer","question":"...","options":null,'
    '"correctAnswer":"<concise expected answer>","difficulty":"easy|medium|hard"}\n\n'
    "Rules:\n"
    "- single_answer / multiple_answer: exactly 4 distinct non-empty options.\n"
    "- single_answer: correctAnswer is a single string matching one option exactly.\n"
    "- multiple_answer: correctAnswer is an array of 2+ strings, each matching an option exactly.\n"
    "- short_answer: options must be null; correctAnswer is a non-empty string.\n"
    "- Do not repeat questions.\n"
)

_VALID_TYPES = {"single_answer", "multiple_answer", "short_answer"}

# ── Context mode ──────────────────────────────────────────────────────────────

def retrieve_context(query: str, k: int = 8) -> List[str]:
    try:
        result = query_vector_db(query, n_results=k)
        documents = (result or {}).get("documents") or []
        if documents and isinstance(documents[0], list):
            documents = documents[0]
        return [str(chunk).strip() for chunk in documents if str(chunk).strip()]
    except Exception:
        return []


def build_context_prompt(
    context: List[str],
    question_type: str,
    num_questions: int,
    difficulty: str,
    language: str = "English",
    blooms: str = "Any level",
    instructions: str = "",
) -> str:
    context_block = "\n\n".join(
        [f"Context {i + 1}: {chunk}" for i, chunk in enumerate(context)]
    )
    extras = []
    if language and language.lower() != "english":
        extras.append(f"- Write questions in {language}.")
    if blooms and blooms.lower() != "any level":
        extras.append(f"- Target Bloom's taxonomy level: {blooms}.")
    if instructions:
        extras.append(f"- Additional instructions: {instructions}")
    extra_block = ("\n" + "\n".join(extras)) if extras else ""

    return (
        "You are an expert assessment generator.\n"
        f"Generate exactly {num_questions} {question_type} question(s) "
        "grounded strictly in the context below.\n"
        f"Difficulty: {difficulty}.{extra_block}\n\n"
        + _JSON_SCHEMA_HINT
        + f"\n{context_block}"
    )


# ── Prompt mode ───────────────────────────────────────────────────────────────

def build_prompt_mode_prompt(
    custom_prompt: str,
    question_type: str,
    num_questions: int,
    difficulty: str,
    language: str = "English",
    blooms: str = "Any level",
    instructions: str = "",
) -> str:
    extras = []
    if language and language.lower() != "english":
        extras.append(f"- Write questions in {language}.")
    if blooms and blooms.lower() != "any level":
        extras.append(f"- Target Bloom's taxonomy level: {blooms}.")
    if instructions:
        extras.append(f"- Additional instructions: {instructions}")
    extra_block = ("\n" + "\n".join(extras)) if extras else ""

    return (
        "You are an expert assessment generator.\n"
        f"Generate exactly {num_questions} {question_type} question(s).\n"
        f"Difficulty: {difficulty}.{extra_block}\n\n"
        + _JSON_SCHEMA_HINT
        + f"\nUser request: {custom_prompt}"
    )


# ── LLM call & parsing ────────────────────────────────────────────────────────

def _strip_code_fences(text: str) -> str:
    text = text.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    return text.strip()


def call_llm(prompt: str) -> str:
    response = _llm.invoke(prompt)
    raw = response.content if hasattr(response, "content") else str(response)
    if isinstance(raw, list):
        raw = "".join(
            part.get("text", "") if isinstance(part, dict) else str(part)
            for part in raw
        )
    return _strip_code_fences(str(raw))


def _validate_question_schema(question: Dict[str, Any]) -> bool:
    q_type = str(question.get("type", "")).strip().lower()
    text = str(question.get("question", "")).strip()
    difficulty = str(question.get("difficulty", "")).strip().lower()

    if q_type not in _VALID_TYPES:
        return False
    if not text:
        return False
    if difficulty not in {"easy", "medium", "hard"}:
        return False

    options = question.get("options")
    correct = question.get("correctAnswer")

    if q_type in {"single_answer", "multiple_answer"}:
        if not isinstance(options, list) or len(options) != 4:
            return False
        normalized_opts = [str(opt).strip() for opt in options]
        if any(not opt for opt in normalized_opts):
            return False
        if len(set(normalized_opts)) != 4:  # must be distinct
            return False

        if q_type == "single_answer":
            answer = str(correct).strip() if correct is not None else ""
            if not answer or answer not in normalized_opts:
                return False

        else:  # multiple_answer
            if not isinstance(correct, list) or len(correct) < 2:
                return False
            normalized_correct = [str(c).strip() for c in correct]
            if any(not c for c in normalized_correct):
                return False
            if any(c not in normalized_opts for c in normalized_correct):
                return False

    if q_type == "short_answer":
        if options not in (None, []):
            return False
        answer = str(correct).strip() if correct is not None else ""
        if not answer:
            return False

    return True


def _process_options_and_answers(question: Dict[str, Any]) -> Dict[str, Any]:
    """Shuffle options and convert text-based correctAnswer to DB index format."""
    q_type = question.get("type")

    if q_type == "single_answer":
        options = [str(opt).strip() for opt in question["options"]]
        correct_text = str(question["correctAnswer"]).strip()
        random.shuffle(options)
        question["options"] = options
        question["correctAnswer"] = options.index(correct_text)

    elif q_type == "multiple_answer":
        options = [str(opt).strip() for opt in question["options"]]
        correct_texts = [str(c).strip() for c in question["correctAnswer"]]
        random.shuffle(options)
        question["options"] = options
        question["correctAnswer"] = [options.index(c) for c in correct_texts]

    # short_answer: keep correctAnswer as string, options stays null

    return question


def parse_llm_output(raw_output: str) -> List[Dict[str, Any]]:
    cleaned = _strip_code_fences(raw_output)
    parsed = json.loads(cleaned)
    items = parsed.get("questions") if isinstance(parsed, dict) else None
    if not isinstance(items, list):
        raise ValueError("LLM output is missing 'questions' array")

    unique_questions: List[Dict[str, Any]] = []
    seen: set = set()

    for item in items:
        if not isinstance(item, dict):
            continue

        q_type = str(item.get("type", "")).strip().lower()
        raw_correct = item.get("correctAnswer")

        # Normalise correctAnswer before validation
        if q_type == "multiple_answer" and isinstance(raw_correct, list):
            normalized_correct = [str(c).strip() for c in raw_correct]
        else:
            normalized_correct = raw_correct

        normalized = {
            "type": q_type,
            "question": str(item.get("question", "")).strip(),
            "options": item.get("options"),
            "correctAnswer": normalized_correct,
            "difficulty": str(item.get("difficulty", "")).strip().lower(),
        }

        if not _validate_question_schema(normalized):
            continue

        fingerprint = normalized["question"].lower()
        if fingerprint in seen:
            continue

        normalized = _process_options_and_answers(normalized)
        seen.add(fingerprint)
        unique_questions.append(normalized)

    return unique_questions


# ── Public entry point ────────────────────────────────────────────────────────

# Backward-compatible aliases
_TYPE_ALIAS: Dict[str, str] = {
    "mcq": "single_answer",
    "short": "short_answer",
}

# How composite modes split across individual types
_COMPOSITE_MODES: Dict[str, List[str]] = {
    "both": ["single_answer", "short_answer"],
    "all":  ["single_answer", "multiple_answer", "short_answer"],
}


def generate_questions(
    q_type: str,
    difficulty: str,
    num_questions: int,
    mode: str = "upload",
    chapter: str = "",
    course: str = "",
    custom_prompt: str = "",
    language: str = "English",
    blooms: str = "Any level",
    instructions: str = "",
    retriever: Optional[Callable[[str, int], List[str]]] = None,
    llm_caller: Optional[Callable[[str], str]] = None,
) -> List[Dict[str, Any]]:
    q_type = _TYPE_ALIAS.get(q_type, q_type)

    valid_q_types = _VALID_TYPES | set(_COMPOSITE_MODES.keys())
    if q_type not in valid_q_types:
        raise ValueError(
            f"q_type must be one of: {', '.join(sorted(valid_q_types))} "
            "(or aliases: mcq, short)"
        )
    if difficulty not in {"easy", "medium", "hard"}:
        raise ValueError("difficulty must be one of: easy, medium, hard")

    is_prompt_mode = mode == "prompt"

    if is_prompt_mode:
        if not custom_prompt or not custom_prompt.strip():
            raise ValueError("custom_prompt is required in prompt mode")
    else:
        if not chapter or not course:
            raise ValueError("chapter and course are required in context mode")

    total = max(1, int(num_questions))
    llm_fn = llm_caller or call_llm
    retrieve_fn = retriever or retrieve_context

    def _build_prompt(target_type: str, batch_size: int) -> str:
        if is_prompt_mode:
            return build_prompt_mode_prompt(
                custom_prompt, target_type, batch_size, difficulty, language, blooms, instructions
            )
        context = retrieve_fn(f"{course} {chapter} {difficulty}", 8)
        if not context:
            context = [f"Chapter '{chapter}' from the course '{course}'."]
        return build_context_prompt(
            context, target_type, batch_size, difficulty, language, blooms, instructions
        )

    def _generate_batch(target_type: str, batch_size: int) -> List[Dict[str, Any]]:
        raw = llm_fn(_build_prompt(target_type, batch_size))
        parsed = parse_llm_output(raw)
        return [q for q in parsed if q.get("type") == target_type][:batch_size]

    generated: List[Dict[str, Any]] = []

    if q_type in _COMPOSITE_MODES:
        types = _COMPOSITE_MODES[q_type]
        # Distribute total as evenly as possible across the sub-types
        base, remainder = divmod(total, len(types))
        for i, target_type in enumerate(types):
            batch_size = base + (1 if i < remainder else 0)
            if batch_size > 0:
                generated.extend(_generate_batch(target_type, batch_size))
    else:
        generated = _generate_batch(q_type, total)

    for question in generated:
        question["chapter"] = chapter
        question["course"] = course
        question["difficulty"] = difficulty

    return generated
