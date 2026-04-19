import { useState } from "react";
import {
  PlusOutlined,
  DeleteOutlined,
  CheckCircleFilled,
  InfoCircleOutlined,
  DragOutlined,
} from "@ant-design/icons";

const OPTION_LABELS = ["A", "B", "C", "D", "E", "F"];

export default function MCQOptionsEditor({ options, correctAnswer, onChange, error }) {
  const [dragIndex, setDragIndex] = useState(null);
  const [dragOver, setDragOver] = useState(null);

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
    const newCorrect = correctAnswer === i
      ? 0
      : correctAnswer > i
      ? correctAnswer - 1
      : correctAnswer;
    onChange(next, newCorrect);
  };

  const setCorrect = (i) => onChange(options, i);

  // Drag and drop reorder
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

    let newCorrect = correctAnswer;
    if (correctAnswer === dragIndex) newCorrect = i;
    else if (dragIndex < correctAnswer && i >= correctAnswer) newCorrect = correctAnswer - 1;
    else if (dragIndex > correctAnswer && i <= correctAnswer) newCorrect = correctAnswer + 1;

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
          Click radio to set correct answer
        </span>
      </div>

      <div className="space-y-2">
        {options.map((opt, i) => {
          const isCorrect = i === correctAnswer;
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
                isCorrect
                  ? "border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-700"
                  : isDragOver
                  ? "border-primary bg-surface-alt"
                  : "border-border bg-surface-alt hover:border-primary/40"
              } ${isDragging ? "opacity-40 scale-[0.98]" : "opacity-100"}`}
            >
              {/* Drag Handle */}
              <DragOutlined className="cursor-grab text-text-muted opacity-0 group-hover:opacity-100 transition-opacity text-xs shrink-0" />

              {/* Option Label */}
              <span
                className={`flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-xs font-bold transition-all ${
                  isCorrect
                    ? "bg-success text-white shadow-sm"
                    : "bg-border text-text-muted hover:bg-primary/20 hover:text-primary"
                }`}
                onClick={() => setCorrect(i)}
                title="Set as correct answer"
              >
                {isCorrect ? <CheckCircleFilled className="text-[11px]" /> : OPTION_LABELS[i]}
              </span>

              {/* Text Input */}
              <input
                type="text"
                value={opt}
                onChange={(e) => updateOption(i, e.target.value)}
                placeholder={`Option ${OPTION_LABELS[i]}…`}
                className={`flex-1 bg-transparent text-sm outline-none placeholder:text-text-muted ${
                  isCorrect ? "font-medium text-success" : "text-text"
                }`}
              />

              {/* Correct Badge */}
              {isCorrect && (
                <span className="shrink-0 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-success">
                  Correct
                </span>
              )}

              {/* Remove Button */}
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

      {/* Error */}
      {error && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-error">
          <InfoCircleOutlined />
          {error}
        </p>
      )}

      {/* Add Option Button */}
      {options.length < 6 && (
        <button
          onClick={addOption}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-2.5 text-sm font-medium text-text-muted transition-all hover:border-primary hover:text-primary hover:bg-surface-alt active:scale-[0.99]"
        >
          <PlusOutlined className="text-xs" />
          Add Option
        </button>
      )}

      {/* Helper Note */}
      <p className="mt-2 flex items-center gap-1.5 text-xs text-text-muted">
        <InfoCircleOutlined className="text-[10px]" />
        Click the letter badge to mark the correct answer · Drag rows to reorder
      </p>
    </div>
  );
}