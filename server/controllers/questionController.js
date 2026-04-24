const Question = require("../models/Question");
const axios = require("axios");

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

// Maps frontend/API type values to what the AI service understands
const normalizeTypeForAI = (value) => {
  const v = String(value || "").toLowerCase();
  if (v === "short" || v === "short_answer") return "short_answer";
  if (v === "both") return "both";
  if (v === "all") return "all";
  if (v === "multiple_answer" || v === "multiple") return "multiple_answer";
  // single_answer, single, mcq, default
  return "single_answer";
};

// Maps frontend type values to DB enum values
const normalizeTypeForDB = (value) => {
  const v = String(value || "").toLowerCase();
  if (v === "short" || v === "short_answer") return "short_answer";
  if (v === "multiple_answer" || v === "multiple") return "multiple_answer";
  // single_answer, single, mcq, default
  return "single_answer";
};

const normalizeDifficulty = (value) => {
  const v = String(value || "").toLowerCase();
  if (["easy", "medium", "hard"].includes(v)) return v;
  return "easy";
};

const getQuestions = async (req, res) => {
  try {
    const questions = await Question.find().sort({ createdAt: -1 });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createQuestion = async (req, res) => {
  try {
    const question = new Question(req.body);
    const saved = await question.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const updateQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!question) return res.status(404).json({ message: "Question not found" });
    res.json(question);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) return res.status(404).json({ message: "Question not found" });
    res.json({ message: "Question deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const generateQuestions = async (req, res) => {
  try {
    const {
      chapter,
      course,
      type,
      q_type,
      difficulty,
      count,
      num_questions,
      mode,
      prompt,
      language,
      blooms,
      instructions,
    } = req.body;

    const resolvedMode = String(mode || "upload");
    const isPromptMode = resolvedMode === "prompt";

    if (!isPromptMode && !chapter) {
      return res.status(400).json({ message: "chapter is required in context mode" });
    }
    if (isPromptMode && !prompt) {
      return res.status(400).json({ message: "prompt is required in prompt mode" });
    }

    const total = Number(num_questions || count || 5);
    const requestedType = String(q_type || type || "single_answer").toLowerCase();
    const aiType = normalizeTypeForAI(requestedType);
    const normalizedDifficulty = normalizeDifficulty(difficulty);
    const resolvedCourse = String(course || "General Course");

    const { data } = await axios.post(`${AI_SERVICE_URL}/generate-questions/`, {
      mode: resolvedMode,
      chapter: chapter || "",
      course: resolvedCourse,
      prompt: prompt || "",
      q_type: aiType,
      difficulty: normalizedDifficulty,
      num_questions: total,
      language: language || "English",
      blooms: blooms || "Any level",
      instructions: instructions || "",
    });

    const aiQuestions = Array.isArray(data?.questions) ? data.questions : [];

    const questions = aiQuestions.map((q, index) => {
      // AI service returns "single_answer", "multiple_answer", or "short_answer"
      const qType = String(q.type || "").toLowerCase();
      const isMcq = qType === "single_answer" || qType === "multiple_answer";
      const isMultiple = qType === "multiple_answer";

      // Options are already shuffled by the AI service
      const options = isMcq && Array.isArray(q.options) ? q.options.slice(0, 4) : null;

      // AI service already converted correctAnswer to index (single) or [indices] (multiple)
      const correct = isMultiple
        ? (Array.isArray(q.correctAnswer) ? q.correctAnswer : null)
        : isMcq
        ? (typeof q.correctAnswer === "number" ? q.correctAnswer : null)
        : null;

      // Display type labels — derived from actual AI output type, not the original request
      let frontendType;
      if (qType === "multiple_answer") frontendType = "Multiple Answer";
      else if (qType === "single_answer") frontendType = "Single Answer";
      else frontendType = "Short Answer";

      const dbType = qType === "multiple_answer"
        ? "multiple_answer"
        : qType === "single_answer"
        ? "single_answer"
        : "short_answer";

      const modelCandidate = {
        type: dbType,
        difficulty: normalizedDifficulty,
        text: String(q.question || "").trim(),
        options,
        correctAnswer: correct,
        source: "ai",
      };

      const validationError = new Question(modelCandidate).validateSync();
      if (validationError) return null;

      return {
        id: index + 1,
        text: modelCandidate.text,
        type: frontendType,
        difficulty: normalizedDifficulty.charAt(0).toUpperCase() + normalizedDifficulty.slice(1),
        options,
        correct,
        answer: !isMcq ? String(q.correctAnswer || "") : null,
        chapter,
        course: resolvedCourse,
      };
    }).filter(Boolean);

    res.json({ questions });
  } catch (err) {
    const message = err.response?.data?.detail || err.message;
    res.status(500).json({ message });
  }
};

const verifyQuestion = async (req, res) => {
  try {
    res.json({ isValid: true, feedback: "Looks good" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


module.exports = {
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  generateQuestions,
  verifyQuestion,
};
