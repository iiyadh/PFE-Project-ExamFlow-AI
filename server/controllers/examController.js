const Exam = require("../models/Exam");
const Question = require("../models/Question");
const ExamAttempt = require("../models/ExamAttempt");
const Student = require("../models/Student");
const Course = require("../models/Course");

// ── helpers ────────────────────────────────────────────────────────────────

const resolveCourseNames = async (courseIds) => {
  if (!courseIds || courseIds.length === 0) return [];
  try {
    const courses = await Course.find({ _id: { $in: courseIds } }).select("title").lean();
    const nameMap = {};
    courses.forEach((c) => { nameMap[c._id.toString()] = c.title; });
    return courseIds.map((id) => nameMap[id] || id);
  } catch {
    return courseIds;
  }
};

const typeMap = {
  mcq: "single_answer",
  short_answer: "short_answer",
  long_answer: "short_answer",
  true_false: "single_answer",
  fill_blank: "short_answer",
};

const submissionStats = async (examId, passingScore) => {
  const attempts = await ExamAttempt.find({
    examId,
    status: { $in: ["submitted", "graded"] },
  }).lean();
  const scores = attempts.map((a) => a.score).filter((s) => s != null);
  return {
    submitted: attempts.length,
    avg: scores.length
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0,
    highest: scores.length ? Math.max(...scores) : 0,
    lowest: scores.length ? Math.min(...scores) : 0,
    passing: scores.filter((s) => s >= passingScore).length,
    passRate: scores.length
      ? Math.round(
          (scores.filter((s) => s >= passingScore).length / scores.length) * 100
        )
      : 0,
  };
};

// ── teacher: list own exams ────────────────────────────────────────────────
const getExams = async (req, res) => {
  try {
    const filter = { teacherId: req.user.id };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.classId) filter.classId = req.query.classId;

    const exams = await Exam.find(filter).sort({ scheduledAt: -1 }).lean();

    const result = await Promise.all(
      exams.map(async (exam) => {
        const stats = await submissionStats(exam._id, exam.passingScore);
        const courseNames = await resolveCourseNames(exam.courseIds);
        return { ...exam, ...stats, courseNames };
      })
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── student: exams available for their classes ────────────────────────────
const getStudentExams = async (req, res) => {
  try {
    const studentDoc = await Student.findOne({ user: req.user.id }).lean();
    const classIds = studentDoc?.classes || [];

    const exams = await Exam.find({
      status: { $in: ["upcoming", "active", "completed"] },
      $or: [
        { classId: { $in: classIds } },
        { classId: null },
        { classId: { $exists: false } },
      ],
    })
      .sort({ scheduledAt: 1 })
      .lean();

    const result = await Promise.all(
      exams.map(async (exam) => {
        const attempt = await ExamAttempt.findOne({
          examId: exam._id,
          studentId: req.user.id,
        })
          .select("status score grade submittedAt _id")
          .lean();
        const courseNames = await resolveCourseNames(exam.courseIds);
        return { ...exam, attempt: attempt || null, courseNames };
      })
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── get single exam (teacher or student) ──────────────────────────────────
const getExamById = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.examId).lean();
    if (!exam) return res.status(404).json({ message: "Exam not found" });
    const [stats, courseNames] = await Promise.all([
      submissionStats(exam._id, exam.passingScore),
      resolveCourseNames(exam.courseIds),
    ]);
    res.json({ ...exam, stats, courseNames });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── create exam ────────────────────────────────────────────────────────────
const createExam = async (req, res) => {
  try {
    const {
      title, description, classId, courseIds, courses,
      date, scheduledAt, duration, durationMinutes,
      questions, totalQuestions, passingScore, showAnswers,
      chapterWeights, chapters, settings, questionIds,
    } = req.body;

    const normalizedWeights = (chapterWeights || chapters || []).map((ch) => ({
      courseId: ch.courseId || "",
      chapterId: ch.chapterId || "",
      chapterLabel: ch.chapterLabel || "",
      courseCode: ch.courseCode || ch.courseLabel || "",
      weightPct: ch.weightPct ?? ch.pct ?? 0,
      questionType: ch.questionType || ch.qType || "mcq",
    }));

    const exam = new Exam({
      title,
      description,
      status: "draft",
      teacherId: req.user.id,
      classId: classId || null,
      courseIds: courseIds || courses || [],
      scheduledAt: scheduledAt || date,
      durationMinutes: durationMinutes || Number(duration),
      totalQuestions: totalQuestions || Number(questions),
      passingScore: passingScore ?? 60,
      showAnswers: showAnswers ?? false,
      chapterWeights: normalizedWeights,
      settings: settings || {},
      questionIds: questionIds || [],
    });

    const saved = await exam.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ── update exam ────────────────────────────────────────────────────────────
const updateExam = async (req, res) => {
  try {
    const {
      title, description, classId, courseIds, courses,
      date, scheduledAt, duration, durationMinutes,
      questions, totalQuestions, passingScore, showAnswers,
      chapterWeights, chapters, settings, questionIds, status,
    } = req.body;

    const update = {};
    if (title !== undefined) update.title = title;
    if (description !== undefined) update.description = description;
    if (classId !== undefined) update.classId = classId;
    if (courseIds || courses) update.courseIds = courseIds || courses;
    if (scheduledAt || date) update.scheduledAt = scheduledAt || date;
    if (durationMinutes || duration)
      update.durationMinutes = durationMinutes || Number(duration);
    if (totalQuestions || questions)
      update.totalQuestions = totalQuestions || Number(questions);
    if (passingScore !== undefined) update.passingScore = passingScore;
    if (showAnswers !== undefined) update.showAnswers = showAnswers;
    if (settings !== undefined) update.settings = settings;
    if (questionIds !== undefined) update.questionIds = questionIds;
    if (status !== undefined) update.status = status;

    if (chapterWeights || chapters) {
      update.chapterWeights = (chapterWeights || chapters).map((ch) => ({
        courseId: ch.courseId || "",
        chapterId: ch.chapterId || "",
        chapterLabel: ch.chapterLabel || "",
        courseCode: ch.courseCode || ch.courseLabel || "",
        weightPct: ch.weightPct ?? ch.pct ?? 0,
        questionType: ch.questionType || ch.qType || "mcq",
      }));
    }

    const exam = await Exam.findOneAndUpdate(
      { _id: req.params.examId, teacherId: req.user.id },
      { $set: update },
      { new: true, runValidators: true }
    );
    if (!exam) return res.status(404).json({ message: "Exam not found" });
    res.json(exam);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ── delete exam ────────────────────────────────────────────────────────────
const deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findOneAndDelete({
      _id: req.params.examId,
      teacherId: req.user.id,
    });
    if (!exam) return res.status(404).json({ message: "Exam not found" });
    res.json({ message: "Exam deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── publish exam (auto-select questions + change status) ──────────────────
const publishExam = async (req, res) => {
  try {
    const exam = await Exam.findOne({
      _id: req.params.examId,
      teacherId: req.user.id,
    });
    if (!exam) return res.status(404).json({ message: "Exam not found" });

    if (!exam.questionIds || exam.questionIds.length === 0) {
      let selectedIds = [];

      for (const weight of exam.chapterWeights) {
        const count = Math.max(
          1,
          Math.round((weight.weightPct / 100) * exam.totalQuestions)
        );
        const dbType = typeMap[weight.questionType] || weight.questionType;
        const filter = {};
        if (weight.chapterLabel) filter.chapter = weight.chapterLabel;
        if (weight.courseCode) filter.course = weight.courseCode;
        if (dbType) filter.type = dbType;

        const qs = await Question.find(filter).limit(count).lean();
        selectedIds.push(...qs.map((q) => q._id.toString()));
      }

      if (selectedIds.length === 0) {
        const any = await Question.find().limit(exam.totalQuestions).lean();
        selectedIds = any.map((q) => q._id.toString());
      }

      exam.questionIds = [...new Set(selectedIds)];
    }

    exam.status = "upcoming";
    exam.publishedAt = new Date();
    await exam.save();
    res.json(exam);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── teacher: list all submissions for an exam ─────────────────────────────
const getExamSubmissions = async (req, res) => {
  try {
    const exam = await Exam.findOne({
      _id: req.params.examId,
      teacherId: req.user.id,
    }).lean();
    if (!exam) return res.status(404).json({ message: "Exam not found" });

    const attempts = await ExamAttempt.find({ examId: exam._id })
      .populate("studentId", "username email pfpUrl")
      .sort({ submittedAt: -1 })
      .lean();

    res.json(attempts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── teacher: single submission detail ─────────────────────────────────────
const getSubmissionDetail = async (req, res) => {
  try {
    const attempt = await ExamAttempt.findOne({
      _id: req.params.studentId,
      examId: req.params.examId,
    })
      .populate("studentId", "username email pfpUrl")
      .lean();

    if (!attempt) return res.status(404).json({ message: "Submission not found" });
    res.json(attempt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getExams,
  getStudentExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam,
  publishExam,
  getExamSubmissions,
  getSubmissionDetail,
};
