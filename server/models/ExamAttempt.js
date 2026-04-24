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

const AnswerSchema = new mongoose.Schema(
  {
    questionRefId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      default: null,
    },

    questionSnapshot: {
      type: Object, // stores full question at exam time
    },

    module: {
      type: String,
    },

    text: String,

    questionText: {
      type: String,
      alias: "q",
    },

    type: {
      type: String,
      enum: ["mcq", "single_answer", "multiple_answer", "short_answer", "long_answer", "true_false", "fill_blank"],
      set: normalizeQuestionType,
    },

    options: [String],

    correctAnswer: mongoose.Schema.Types.Mixed,

    points: {
      type: Number,
      default: 0,
    },

    chapter: String,

    chosenOptionIndex: {
      type: Number,
      default: null,
      alias: "selected",
    },

    selectedOptionIndex: {
      type: Number,
      default: null,
    },

    chosen: {
      type: Number,
      default: null,
    },

    correct: {
      type: Number,
      default: null,
    },

    shortAnswerText: {
      type: String,
      default: null,
    },

    isCorrect: {
      type: Boolean,
      default: null,
    },

    pointsAwarded: {
      type: Number,
      default: 0,
    },

    bookmarked: {
      type: Boolean,
      default: false,
    },

    reviewerNotes: String,
  },
  { _id: false }
);

const ExamAttemptSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["not_started", "in_progress", "submitted", "graded", "completed"],
      default: "not_started",
      set: (value) => (value === "completed" ? "graded" : value),
    },

    startedAt: Date,

    submittedAt: Date,

    timeTakenMinutes: Number,

    timeTaken: {
      type: String,
      default: null,
    },

    score: {
      type: Number,
      min: 0,
      max: 100,
    },

    earnedPoints: {
      type: Number,
      default: 0,
    },

    totalPoints: {
      type: Number,
      default: 0,
    },

    grade: {
      type: String,
      enum: ["A", "B", "C", "D", "F", null],
      default: null,
    },

    releasedToStudent: {
      type: Boolean,
      default: false,
    },

    fullResultsReleased: {
      type: Boolean,
      default: false,
    },

    answeredCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    bookmarkedCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    unansweredCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    answers: [AnswerSchema],
  },
  {
    timestamps: true,
  }
);

ExamAttemptSchema.index({ examId: 1, studentId: 1 }, { unique: true });
ExamAttemptSchema.index({ examId: 1, status: 1, score: -1 });

module.exports = mongoose.model("ExamAttempt", ExamAttemptSchema);