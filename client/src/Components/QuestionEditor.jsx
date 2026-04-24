import { useState } from "react";
import {
  SaveOutlined,
  CloseOutlined,
  BulbOutlined,
  BookOutlined,
  RobotOutlined,
  InfoCircleOutlined,
  CheckSquareOutlined,
} from "@ant-design/icons";
import MCQOptionsEditor from "./MCQOptionsEditor";

const QUESTION_TYPES = [
  { key: "SingleAnswer", label: "One Answer", icon: <BulbOutlined />, hint: "Radio — one correct option" },
  { key: "MultipleAnswer", label: "Multiple Answers", icon: <CheckSquareOutlined />, hint: "Checkbox — several correct" },
  { key: "ShortAnswer", label: "Short Answer", icon: <BookOutlined />, hint: "Open text response" },
];

const DIFFICULTIES = [
  { key: "easy", label: "Easy", activeClass: "bg-success text-white border-success" },
  { key: "medium", label: "Medium", activeClass: "bg-warning text-white border-warning" },
  { key: "hard", label: "Hard", activeClass: "bg-error text-white border-error" },
];

function inferType(question) {
  if (!question) return "SingleAnswer";
  if (question.type === "short_answer") return "ShortAnswer";
  if (question.type === "multiple_answer") return "MultipleAnswer";
  return "SingleAnswer";
}

function inferCorrectAnswer(question, type) {
  if (type === "MultipleAnswer") {
    return Array.isArray(question?.correctAnswer) ? question.correctAnswer : [];
  }
  return question?.correctAnswer ?? 0;
}

export default function QuestionEditor({ question, onSave, onCancel }) {
  const initialType = inferType(question);
  const [form, setForm] = useState({
    question: question?.text || question?.question || "",
    type: initialType,
    difficulty: question?.difficulty || "medium",
    options: question?.options || ["", "", "", ""],
    correctAnswer: inferCorrectAnswer(question, initialType),
    answer: question?.answer || "",
    chapter: question?.chapter || "",
    course: question?.course || "",
  });

  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [charCount, setCharCount] = useState(form.question.length);

  const hasOptions = form.type === "SingleAnswer" || form.type === "MultipleAnswer";

  const validate = () => {
    const e = {};
    if (!form.question.trim()) e.question = "Question text is required.";
    else if (form.question.trim().length < 10) e.question = "Question must be at least 10 characters.";
    if (hasOptions) {
      if (form.options.some((o) => !o.trim())) e.options = "All answer options must be filled in.";
      if (form.type === "MultipleAnswer" && (!Array.isArray(form.correctAnswer) || form.correctAnswer.length === 0)) {
        e.options = "Select at least one correct answer.";
      }
    } else {
      if (!form.answer.trim()) e.answer = "Model answer is required.";
    }
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setIsSaving(true);
    setTimeout(() => { onSave(form); setIsSaving(false); }, 600);
  };

  const update = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handleTypeChange = (newType) => {
    setForm((f) => ({
      ...f,
      type: newType,
      correctAnswer: newType === "MultipleAnswer" ? [] : 0,
    }));
    setErrors({});
  };

  return (
    <div className="rounded-2xl border border-primary bg-surface shadow-lg ring-1 ring-primary/10">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
            <RobotOutlined />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text">
              {question ? "Edit Question" : "Create Question"}
            </h3>
            <p className="text-xs text-text-muted">Saved as draft · pending approval</p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-border text-text-muted transition-all hover:text-text active:scale-95"
        >
          <CloseOutlined className="text-xs" />
        </button>
      </div>

      <div className="p-5 space-y-5">
        {/* Type Selector */}
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-text-muted">
            Question Type
          </label>
          <div className="flex gap-2 flex-wrap">
            {QUESTION_TYPES.map((t) => (
              <button
                key={t.key}
                onClick={() => handleTypeChange(t.key)}
                className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                  form.type === t.key
                    ? "border-primary bg-primary text-white shadow-sm"
                    : "border-border bg-surface-alt text-text-secondary hover:border-primary hover:text-primary"
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-xs text-text-muted">
            {QUESTION_TYPES.find((t) => t.key === form.type)?.hint}
          </p>
        </div>

        {/* Difficulty */}
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-text-muted">
            Difficulty
          </label>
          <div className="flex gap-2">
            {DIFFICULTIES.map((d) => (
              <button
                key={d.key}
                onClick={() => update("difficulty", d.key)}
                className={`flex-1 rounded-xl border px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  form.difficulty === d.key
                    ? d.activeClass
                    : "border-border bg-surface-alt text-text-secondary hover:border-primary hover:text-primary"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chapter / Course */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-text-muted">
              Chapter <span className="normal-case font-normal">(optional)</span>
            </label>
            <input
              value={form.chapter}
              onChange={(e) => update("chapter", e.target.value)}
              placeholder="e.g. Sorting Algorithms"
              className="w-full rounded-xl border border-border bg-surface-alt px-4 py-2.5 text-sm text-text outline-none transition-all placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-text-muted">
              Course <span className="normal-case font-normal">(optional)</span>
            </label>
            <input
              value={form.course}
              onChange={(e) => update("course", e.target.value)}
              placeholder="e.g. Algorithms"
              className="w-full rounded-xl border border-border bg-surface-alt px-4 py-2.5 text-sm text-text outline-none transition-all placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Question Text */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Question Text
            </label>
            <span className={`text-xs font-medium ${charCount > 300 ? "text-error" : "text-text-muted"}`}>
              {charCount}/400
            </span>
          </div>
          <textarea
            value={form.question}
            onChange={(e) => { update("question", e.target.value); setCharCount(e.target.value.length); }}
            maxLength={400}
            rows={3}
            placeholder="Enter your question here…"
            className={`w-full resize-none rounded-xl border bg-surface-alt px-4 py-3 text-sm text-text outline-none transition-all placeholder:text-text-muted focus:ring-2 ${
              errors.question
                ? "border-error focus:border-error focus:ring-error/20"
                : "border-border focus:border-primary focus:ring-primary/20"
            }`}
          />
          {errors.question && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-error">
              <InfoCircleOutlined /> {errors.question}
            </p>
          )}
        </div>

        {/* Options (single / multiple) OR Short Answer */}
        {hasOptions ? (
          <MCQOptionsEditor
            options={form.options}
            correctAnswer={form.correctAnswer}
            mode={form.type === "MultipleAnswer" ? "multiple" : "single"}
            onChange={(options, correctAnswer) => {
              update("options", options);
              update("correctAnswer", correctAnswer);
              if (errors.options) setErrors((e) => ({ ...e, options: undefined }));
            }}
            error={errors.options}
          />
        ) : (
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-text-muted">
              Model Answer
            </label>
            <textarea
              value={form.answer}
              onChange={(e) => update("answer", e.target.value)}
              rows={4}
              placeholder="Provide the expected model answer…"
              className={`w-full resize-none rounded-xl border bg-surface-alt px-4 py-3 text-sm text-text outline-none transition-all placeholder:text-text-muted focus:ring-2 ${
                errors.answer
                  ? "border-error focus:border-error focus:ring-error/20"
                  : "border-border focus:border-primary focus:ring-primary/20"
              }`}
            />
            {errors.answer && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-error">
                <InfoCircleOutlined /> {errors.answer}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border px-5 py-4">
        <p className="flex items-center gap-1.5 text-xs text-text-muted">
          <InfoCircleOutlined />
          Saved as draft — pending approval
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-text-secondary transition-all hover:bg-surface-alt active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-hover active:scale-95 disabled:opacity-60"
          >
            <SaveOutlined />
            {isSaving ? "Saving…" : "Save Question"}
          </button>
        </div>
      </div>
    </div>
  );
}
