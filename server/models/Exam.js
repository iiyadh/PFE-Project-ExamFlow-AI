const mongoose = require("mongoose");

const FRONT_TO_DB_QUESTION_TYPE = {
  MCQ: "mcq",
  "Short Answer": "short_answer",
  "Long Answer": "long_answer",
  "True/False": "true_false",
  "Fill in the Blank": "fill_blank",
};

const normalizeQuestionType = (value) => {
  if (typeof value !== "string") return value;
  return FRONT_TO_DB_QUESTION_TYPE[value] || value;
};

const ChapterWeightSchema = new mongoose.Schema(
  {
    // stored as string course-code (e.g. "MATH201") since the form uses codes
    courseId: { type: String, required: true },
    chapterId: { type: String, required: true },
    chapterLabel: { type: String },
    courseCode: { type: String, trim: true },
    weightPct: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    questionType: {
      type: String,
      enum: ["mcq", "short_answer", "long_answer", "true_false", "fill_blank"],
      required: true,
      set: normalizeQuestionType,
    },
  },
  { _id: false }
);

const ExamSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    status: {
      type: String,
      enum: ["draft", "upcoming", "active", "completed", "archived"],
      default: "draft",
    },
    // stored as User._id (the JWT subject) for simplicity
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      default: null,
    },
    // stored as string course-codes: ["MATH201", "CHEM302"]
    courseIds: [{ type: String }],
    scheduledAt: { type: Date, required: true },
    durationMinutes: { type: Number, required: true, min: 1 },
    totalQuestions: { type: Number, required: true, min: 1 },
    passingScore: { type: Number, default: 60, min: 0, max: 100 },
    showAnswers: { type: Boolean, default: false },
    chapterWeights: [ChapterWeightSchema],
    // question IDs assigned to this exam (populated at publish time)
    questionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
    publishedAt: { type: Date },
    closedAt: { type: Date },
    settings: {
      randomizeQuestions: { type: Boolean, default: false },
      randomizeOptions: { type: Boolean, default: false },
      maxAttempts: { type: Number, default: 1, min: 1 },
      allowBookmarks: { type: Boolean, default: true },
      oneQuestionAtATime: { type: Boolean, default: true },
      preventTabSwitching: { type: Boolean, default: false },
      autoSubmitOnTimeout: { type: Boolean, default: true },
      requireAllAnsweredBeforeSubmit: { type: Boolean, default: false },
      revealMode: { type: String, enum: ["limited", "full"], default: "limited" },
    },
  },
  { timestamps: true }
);

ExamSchema.index({ classId: 1, scheduledAt: 1 });
ExamSchema.index({ teacherId: 1, status: 1, scheduledAt: 1 });

module.exports = mongoose.model("Exam", ExamSchema);
