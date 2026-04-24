const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["short_answer", "single_answer", "multiple_answer"],
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },
    text: { type: String, required: true },
    options: {
      type: [String],
      default: null,
      validate: {
        validator: function (value) {
          if (this.type === "single_answer" || this.type === "multiple_answer") {
            return Array.isArray(value) && value.length > 0;
          }
          return true;
        },
        message: "Questions with options must have at least one option",
      },
    },
    correctAnswer: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
      validate: {
        validator: function (value) {
          if (this.type === "single_answer") {
            return typeof value === "number" && value >= 0;
          }
          if (this.type === "multiple_answer") {
            return (
              Array.isArray(value) &&
              value.length > 0 &&
              value.every((v) => typeof v === "number" && v >= 0)
            );
          }
          return true;
        },
        message: "correctAnswer is invalid for the question type",
      },
    },
    source: { type: String, enum: ["manual", "ai"], default: "ai" },
    // chapter/course context used for exam question selection
    chapterId: { type: String, default: null },
    courseCode: { type: String, default: null },
    chapter: { type: String, default: null },
    course: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Question", questionSchema);
