import { useState } from "react";
import {
  PlusOutlined,
  DeleteOutlined,
  CheckCircleFilled,
  InfoCircleOutlined,
  DragOutlined,
} from "@ant-design/icons";

const OPTION_LABELS = ["A", "B", "C", "D", "E", "F"];

// mode: "single" (radio) | "multiple" (checkbox)
// correctAnswer: number for single, number[] for multiple
export default function MCQOptionsEditor({ options, correctAnswer, onChange, error, mode = "single" }) {
  const [dragIndex, setDragIndex] = useState(null);
  const [dragOver, setDragOver] = useState(null);

  const isCorrect = (i) => {
    if (mode === "multiple") return Array.isArray(correctAnswer) && correctAnswer.includes(i);
    return i === correctAnswer;
  };

  const toggleCorrect = (i) => {
    if (mode === "multiple") {
      const current = Array.isArray(correctAnswer) ? correctAnswer : [];
      const next = current.includes(i) ? current.filter((x) => x !== i) : [...current, i];
      onChange(options, next);
    } else {
      onChange(options, i);
    }
  };

  const updateOption = (i, value) => {
    const next = [...options];
    next[i] = value;
    onChange(next, correctAnswer);
  };

  const addOption = () => {
    if (options.length >= 6) return;
    onChange([...options, ""], correctAnswer);
  };

  const removeOption = (i) => {
    if (options.length <= 2) return;
    const next = options.filter((_, idx) => idx !== i);
    if (mode === "multiple") {
      const nextCorrect = (Array.isArray(correctAnswer) ? correctAnswer : [])
        .filter((c) => c !== i)
        .map((c) => (c > i ? c - 1 : c));
      onChange(next, nextCorrect);
    } else {
      const newCorrect =
        correctAnswer === i ? 0 : correctAnswer > i ? correctAnswer - 1 : correctAnswer;
      onChange(next, newCorrect);
    }
  };

  const handleDragStart = (i) => setDragIndex(i);
  const handleDragEnter = (i) => setDragOver(i);

  const handleDrop = (i) => {
    if (dragIndex === null || dragIndex === i) {
      setDragIndex(null);
      setDragOver(null);
      return;
    }
    const next = [...options];
    const [removed] = next.splice(dragIndex, 1);
    next.splice(i, 0, removed);

    let newCorrect;
    if (mode === "multiple") {
      newCorrect = (Array.isArray(correctAnswer) ? correctAnswer : []).map((c) => {
        if (c === dragIndex) return i;
        if (dragIndex < c && i >= c) return c - 1;
        if (dragIndex > c && i <= c) return c + 1;
        return c;
      });
    } else {
      newCorrect = correctAnswer;
      if (correctAnswer === dragIndex) newCorrect = i;
      else if (dragIndex < correctAnswer && i >= correctAnswer) newCorrect = correctAnswer - 1;
      else if (dragIndex > correctAnswer && i <= correctAnswer) newCorrect = correctAnswer + 1;
    }

    onChange(next, newCorrect);
    setDragIndex(null);
    setDragOver(null);
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          Answer Options
        </label>
        <span className="text-xs text-text-muted">
          {mode === "multiple" ? "Click to toggle correct answers" : "Click to set correct answer"}
        </span>
      </div>

      <div className="space-y-2">
        {options.map((opt, i) => {
          const correct = isCorrect(i);
          const isDragging = dragIndex === i;
          const isDragOver = dragOver === i;

          return (
            <div
              key={i}
              draggable
              onDragStart={() => handleDragStart(i)}
              onDragEnter={() => handleDragEnter(i)}
              onDragEnd={() => handleDrop(dragOver ?? i)}
              onDragOver={(e) => e.preventDefault()}
              className={`group flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-all duration-150 ${
                correct
                  ? "border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-700"
                  : isDragOver
                  ? "border-primary bg-surface-alt"
                  : "border-border bg-surface-alt hover:border-primary/40"
              } ${isDragging ? "opacity-40 scale-[0.98]" : "opacity-100"}`}
            >
              <DragOutlined className="cursor-grab text-text-muted opacity-0 group-hover:opacity-100 transition-opacity text-xs shrink-0" />

              {/* Square badge for multiple (checkbox feel), round for single (radio feel) */}
              <span
                className={`flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center text-xs font-bold transition-all ${
                  mode === "multiple" ? "rounded-md" : "rounded-full"
                } ${
                  correct
                    ? "bg-success text-white shadow-sm"
                    : "bg-border text-text-muted hover:bg-primary/20 hover:text-primary"
                }`}
                onClick={() => toggleCorrect(i)}
                title={mode === "multiple" ? "Toggle correct answer" : "Set as correct answer"}
              >
                {correct ? <CheckCircleFilled className="text-[11px]" /> : OPTION_LABELS[i]}
              </span>

              <input
                type="text"
                value={opt}
                onChange={(e) => updateOption(i, e.target.value)}
                placeholder={`Option ${OPTION_LABELS[i]}…`}
                className={`flex-1 bg-transparent text-sm outline-none placeholder:text-text-muted ${
                  correct ? "font-medium text-success" : "text-text"
                }`}
              />

              {correct && (
                <span className="shrink-0 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-success">
                  Correct
                </span>
              )}

              {options.length > 2 && (
                <button
                  onClick={() => removeOption(i)}
                  className="shrink-0 rounded-lg p-1 text-text-muted opacity-0 transition-all group-hover:opacity-100 hover:bg-red-100 hover:text-error dark:hover:bg-red-900/30 active:scale-90"
                  title="Remove option"
                >
                  <DeleteOutlined className="text-xs" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {error && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-error">
          <InfoCircleOutlined />
          {error}
        </p>
      )}

      {options.length < 6 && (
        <button
          onClick={addOption}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-2.5 text-sm font-medium text-text-muted transition-all hover:border-primary hover:text-primary hover:bg-surface-alt active:scale-[0.99]"
        >
          <PlusOutlined className="text-xs" />
          Add Option
        </button>
      )}

      <p className="mt-2 flex items-center gap-1.5 text-xs text-text-muted">
        <InfoCircleOutlined className="text-[10px]" />
        {mode === "multiple"
          ? "Click the badge to toggle correct answers · Drag rows to reorder"
          : "Click the letter badge to mark the correct answer · Drag rows to reorder"}
      </p>
    </div>
  );
}
