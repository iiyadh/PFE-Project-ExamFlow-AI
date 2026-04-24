const ExamAttempt = require("../models/ExamAttempt");
const Exam = require("../models/Exam");
const Question = require("../models/Question");

// ── helpers ────────────────────────────────────────────────────────────────

const calcGrade = (pct) => {
  if (pct >= 90) return "A";
  if (pct >= 80) return "B";
  if (pct >= 70) return "C";
  if (pct >= 60) return "D";
  return "F";
};

const isAutoGradable = (type) =>
  ["single_answer", "mcq", "true_false", "multiple_answer"].includes(type);

const gradeAnswer = (answer) => {
  const type = answer.type;
  if (type === "single_answer" || type === "mcq" || type === "true_false") {
    const correct = answer.chosenOptionIndex === answer.correctAnswer;
    return { isCorrect: correct, pointsAwarded: correct ? answer.points : 0 };
  }
  if (type === "multiple_answer") {
    const expected = Array.isArray(answer.correctAnswer) ? answer.correctAnswer : [];
    const chosen = Array.isArray(answer.chosenOptionIndex) ? answer.chosenOptionIndex : [];
    const correct =
      expected.length === chosen.length &&
      expected.every((v) => chosen.includes(v));
    return { isCorrect: correct, pointsAwarded: correct ? answer.points : 0 };
  }
  // short_answer / long_answer — manual grading later
  return { isCorrect: null, pointsAwarded: 0 };
};

// ── POST /api/exam-attempts — start (or resume) attempt ───────────────────
const startAttempt = async (req, res) => {
  try {
    const { examId } = req.body;
    const studentId = req.user.id;

    const exam = await Exam.findById(examId).lean();
    if (!exam) return res.status(404).json({ message: "Exam not found" });

    if (!["upcoming", "active"].includes(exam.status)) {
      return res.status(400).json({ message: "Exam is not currently available" });
    }

    // Resume existing in-progress attempt
    const existing = await ExamAttempt.findOne({ examId, studentId }).lean();
    if (existing) {
      if (existing.status === "submitted" || existing.status === "graded") {
        return res.status(400).json({ message: "You have already submitted this exam" });
      }
      // Return the attempt with questions stripped of correct answers
      const questions = existing.answers.map((a, i) => ({
        id: i + 1,
        text: a.questionText,
        type: a.type,
        options: a.options || [],
        bookmarked: a.bookmarked,
        chosen: a.chosenOptionIndex,
      }));
      return res.json({ attempt: existing, questions });
    }

    // Fetch questions for the exam
    let rawQuestions = [];
    if (exam.questionIds && exam.questionIds.length > 0) {
      rawQuestions = await Question.find({
        _id: { $in: exam.questionIds },
      }).lean();
    } else {
      rawQuestions = await Question.find()
        .limit(exam.totalQuestions || 10)
        .lean();
    }

    if (exam.settings?.randomizeQuestions) {
      rawQuestions.sort(() => Math.random() - 0.5);
    }

    const answers = rawQuestions.map((q) => ({
      questionRefId: q._id,
      questionSnapshot: q,
      questionText: q.text,
      type: q.type,
      options: q.options || [],
      correctAnswer: q.correctAnswer,
      points: 1,
      chapter: q.chapter || q.chapterId || "",
      chosenOptionIndex: null,
      shortAnswerText: null,
      isCorrect: null,
      pointsAwarded: 0,
      bookmarked: false,
    }));

    const attempt = new ExamAttempt({
      examId,
      studentId,
      status: "in_progress",
      startedAt: new Date(),
      answers,
      totalPoints: rawQuestions.length,
      answeredCount: 0,
      unansweredCount: rawQuestions.length,
      bookmarkedCount: 0,
    });
    await attempt.save();

    const questions = answers.map((a, i) => ({
      id: i + 1,
      text: a.questionText,
      type: a.type,
      options: a.options,
      bookmarked: false,
      chosen: null,
    }));

    res.status(201).json({ attempt: attempt.toObject(), questions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── PUT /api/exam-attempts/:attemptId/answers — auto-save ─────────────────
const saveAnswers = async (req, res) => {
  try {
    const { answers } = req.body;
    const attempt = await ExamAttempt.findOne({
      _id: req.params.attemptId,
      studentId: req.user.id,
      status: "in_progress",
    });
    if (!attempt)
      return res.status(404).json({ message: "Attempt not found or already submitted" });

    if (Array.isArray(answers)) {
      answers.forEach(({ index, chosenOptionIndex, shortAnswerText, bookmarked }) => {
        if (attempt.answers[index] === undefined) return;
        if (chosenOptionIndex !== undefined)
          attempt.answers[index].chosenOptionIndex = chosenOptionIndex;
        if (shortAnswerText !== undefined)
          attempt.answers[index].shortAnswerText = shortAnswerText;
        if (bookmarked !== undefined)
          attempt.answers[index].bookmarked = bookmarked;
      });
    }

    attempt.answeredCount = attempt.answers.filter(
      (a) => a.chosenOptionIndex !== null || a.shortAnswerText
    ).length;
    attempt.unansweredCount = attempt.answers.length - attempt.answeredCount;
    attempt.bookmarkedCount = attempt.answers.filter((a) => a.bookmarked).length;
    attempt.markModified("answers");
    await attempt.save();

    res.json({
      success: true,
      answeredCount: attempt.answeredCount,
      unansweredCount: attempt.unansweredCount,
      bookmarkedCount: attempt.bookmarkedCount,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/exam-attempts/:attemptId/submit ─────────────────────────────
const submitAttempt = async (req, res) => {
  try {
    const { finalAnswers } = req.body;
    const attempt = await ExamAttempt.findOne({
      _id: req.params.attemptId,
      studentId: req.user.id,
      status: "in_progress",
    });
    if (!attempt)
      return res.status(404).json({ message: "Attempt not found or already submitted" });

    // Apply any final answer updates
    if (Array.isArray(finalAnswers)) {
      finalAnswers.forEach(({ index, chosenOptionIndex, shortAnswerText, bookmarked }) => {
        if (attempt.answers[index] === undefined) return;
        if (chosenOptionIndex !== undefined)
          attempt.answers[index].chosenOptionIndex = chosenOptionIndex;
        if (shortAnswerText !== undefined)
          attempt.answers[index].shortAnswerText = shortAnswerText;
        if (bookmarked !== undefined)
          attempt.answers[index].bookmarked = bookmarked;
      });
    }

    // Grade all auto-gradable answers
    let earnedPoints = 0;
    attempt.answers.forEach((answer) => {
      const { isCorrect, pointsAwarded } = gradeAnswer(answer);
      answer.isCorrect = isCorrect;
      answer.pointsAwarded = pointsAwarded;
      earnedPoints += pointsAwarded;
    });

    const timeTaken = Math.max(
      1,
      Math.round((Date.now() - attempt.startedAt.getTime()) / 60000)
    );
    const totalPts = attempt.totalPoints || attempt.answers.length || 1;
    const score = Math.round((earnedPoints / totalPts) * 100);

    attempt.status = "graded";
    attempt.submittedAt = new Date();
    attempt.timeTakenMinutes = timeTaken;
    attempt.timeTaken = `${timeTaken} min`;
    attempt.earnedPoints = earnedPoints;
    attempt.totalPoints = totalPts;
    attempt.score = score;
    attempt.grade = calcGrade(score);
    attempt.answeredCount = attempt.answers.filter(
      (a) => a.chosenOptionIndex !== null || a.shortAnswerText
    ).length;
    attempt.unansweredCount = attempt.answers.length - attempt.answeredCount;
    attempt.markModified("answers");
    await attempt.save();

    const exam = await Exam.findById(attempt.examId).lean();

    res.json({
      attemptId: attempt._id,
      score: attempt.score,
      grade: attempt.grade,
      earnedPoints: attempt.earnedPoints,
      totalPoints: attempt.totalPoints,
      timeTaken: attempt.timeTaken,
      canSeeResults: exam?.showAnswers || false,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/exam-attempts/:attemptId/results — student results ───────────
const getResults = async (req, res) => {
  try {
    const attempt = await ExamAttempt.findOne({
      _id: req.params.attemptId,
      studentId: req.user.id,
    }).lean();
    if (!attempt) return res.status(404).json({ message: "Attempt not found" });
    if (!["submitted", "graded"].includes(attempt.status))
      return res.status(400).json({ message: "Exam not yet submitted" });

    const exam = await Exam.findById(attempt.examId).lean();
    const showAnswers = exam?.showAnswers || attempt.fullResultsReleased || false;

    const results = attempt.answers.map((a, i) => ({
      id: i + 1,
      text: a.questionText,
      type: a.type,
      options: a.options || [],
      module: a.chapter || a.module || "General",
      selected: a.chosenOptionIndex,
      correct: showAnswers ? a.correctAnswer : null,
      isCorrect: a.isCorrect,
      points: a.points,
      pointsAwarded: a.pointsAwarded,
      bookmarked: a.bookmarked,
    }));

    res.json({
      attemptId: attempt._id,
      score: attempt.score,
      grade: attempt.grade,
      earnedPoints: attempt.earnedPoints,
      totalPoints: attempt.totalPoints,
      timeTaken: attempt.timeTaken,
      timeTakenMinutes: attempt.timeTakenMinutes,
      answeredCount: attempt.answeredCount,
      submittedAt: attempt.submittedAt,
      fullMode: showAnswers,
      results,
      examTitle: exam?.title,
      passingScore: exam?.passingScore,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/exam-attempts/:attemptId — teacher view ─────────────────────
const getAttempt = async (req, res) => {
  try {
    const attempt = await ExamAttempt.findById(req.params.attemptId)
      .populate("studentId", "username email pfpUrl")
      .lean();
    if (!attempt) return res.status(404).json({ message: "Attempt not found" });
    res.json(attempt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  startAttempt,
  saveAnswers,
  submitAttempt,
  getResults,
  getAttempt,
};
