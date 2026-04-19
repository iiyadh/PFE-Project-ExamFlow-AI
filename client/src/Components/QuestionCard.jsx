import { useState } from "react";
import {
  CheckCircleFilled, ExclamationCircleFilled, ClockCircleFilled,
  RobotOutlined, EditOutlined, TagOutlined, PlusOutlined,
  EyeOutlined, DeleteOutlined, CheckOutlined,
} from "@ant-design/icons";

const DIFFICULTY_CONFIG = {
  easy: { label: "Easy", color: "var(--color-success)", bg: "rgba(16,185,129,0.1)" },
  medium: { label: "Medium", color: "var(--color-warning)", bg: "rgba(245,158,11,0.1)" },
  hard: { label: "Hard", color: "var(--color-error)", bg: "rgba(239,68,68,0.1)" },
};

const STATUS_CONFIG = {
  approved: { label: "Approved", icon: <CheckCircleFilled />, color: "var(--color-success)" },
  pending: { label: "Pending", icon: <ClockCircleFilled />, color: "var(--color-warning)" },
  flagged: { label: "Flagged", icon: <ExclamationCircleFilled />, color: "var(--color-error)" },
};

export default function QuestionCard({ question, selected, onSelect, onEdit, onDelete, onPreview, viewMode }) {
  const [hovered, setHovered] = useState(false);
  const diff = DIFFICULTY_CONFIG[question.difficulty] ?? DIFFICULTY_CONFIG.medium;
  const status = STATUS_CONFIG[question.status] ?? STATUS_CONFIG.pending;

  if (viewMode === "list") {
    return (
      <div
        className={`group flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
          selected
            ? "border-primary bg-primary/5"
            : "border-border bg-surface hover:border-primary/40 hover:shadow-sm"
        }`}
        onClick={() => onSelect(question.id)}
      >
        {/* Checkbox */}
        <div
          className={`mt-0.5 w-5 h-5 rounded shrink-0 border-2 flex items-center justify-center transition-all ${
            selected ? "bg-primary border-primary" : "border-border group-hover:border-primary"
          }`}
        >
          {selected && <CheckOutlined className="text-white text-[10px]" />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-text line-clamp-2 flex-1 font-medium mb-1.5">{question.text}</p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs px-2 py-0.5 rounded-full border border-border text-text-muted">
              {question.type === "mcq" ? "MCQ" : "Short Answer"}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ color: diff.color, background: diff.bg }}>
              {diff.label}
            </span>
            <span className="text-xs text-text-muted">{question.chapter}</span>
            <span className="text-xs text-text-muted">·</span>
            <span className="text-xs text-text-muted">{question.course}</span>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Hover action buttons */}
          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
            <button
              onClick={e => { e.stopPropagation(); onPreview?.(question); }}
              title="Preview"
              className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-text-muted hover:text-primary hover:border-primary bg-surface transition-all"
            >
              <EyeOutlined className="text-xs" />
            </button>
            <button
              onClick={e => { e.stopPropagation(); onEdit?.(question); }}
              title="Edit"
              className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-text-muted hover:text-primary hover:border-primary bg-surface transition-all"
            >
              <EditOutlined className="text-xs" />
            </button>
            <button
              onClick={e => { e.stopPropagation(); onDelete?.(question.id); }}
              title="Delete"
              className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-text-muted hover:text-error hover:border-error bg-surface transition-all"
            >
              <DeleteOutlined className="text-xs" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div
      className={`group relative flex flex-col rounded-xl border transition-all overflow-hidden ${
        selected
          ? "border-primary shadow-lg bg-surface"
          : "border-border bg-surface hover:border-primary/50 hover:shadow-md"
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top accent line */}
      <div className={`h-0.5 w-full transition-all ${selected ? "bg-primary" : "bg-transparent group-hover:bg-primary/30"}`} />

      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider border ${question.type === "mcq" ? "border-accent/30 text-accent bg-accent/5" : "border-ai/30 text-ai bg-ai/5"}`}>
              {question.type === "mcq" ? "MCQ" : "Short Ans"}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ color: diff.color, background: diff.bg }}>
              {diff.label}
            </span>
          </div>

          {/* Checkbox */}
          <div
            onClick={e => { e.stopPropagation(); onSelect(question.id); }}
            className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all cursor-pointer ${
              selected ? "bg-primary border-primary" : "border-border group-hover:border-primary"
            }`}
          >
            {selected && <CheckOutlined className="text-white text-[10px]" />}
          </div>
        </div>

        {/* Question text */}
        <p className="text-sm text-text leading-relaxed line-clamp-3 font-medium flex-1">
          {question.text}
        </p>

        {/* MCQ Options preview */}
        {question.options && (
          <div className="space-y-1">
            {question.options.slice(0, 2).map((opt, i) => (
              <div key={i} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs ${i === question.correctAnswer ? "bg-success/10 text-success" : "bg-surface-alt text-text-muted"}`}>
                <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[9px] font-bold shrink-0 ${i === question.correctAnswer ? "border-success text-success" : "border-border"}`}>
                  {String.fromCharCode(65 + i)}
                </span>
                {opt}
              </div>
            ))}
            {question.options.length > 2 && (
              <p className="text-[10px] text-text-muted px-2.5">+{question.options.length - 2} more options</p>
            )}
          </div>
        )}
      </div>

      {/* Hover actions overlay */}
      <div className={`absolute inset-0 bg-primary/95 flex items-center justify-center transition-all duration-200 ${hovered && !selected ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <div className="grid grid-cols-2 gap-3 px-6">
          <button
            onClick={e => { e.stopPropagation(); onPreview?.(question); }}
            className="flex flex-col items-center gap-1.5 text-white hover:text-accent transition-colors py-2"
          >
            <EyeOutlined className="text-xl" />
            <span className="text-[10px] font-medium">Preview</span>
          </button>

          <button
            onClick={e => { e.stopPropagation(); onSelect(question.id); }}
            className="flex flex-col items-center gap-1.5 text-white hover:text-accent transition-colors py-2"
          >
            <PlusOutlined className="text-xl" />
            <span className="text-[10px] font-medium">Select</span>
          </button>

          <button
            onClick={e => { e.stopPropagation(); onEdit?.(question); }}
            className="flex flex-col items-center gap-1.5 text-white hover:text-accent transition-colors py-2"
          >
            <EditOutlined className="text-xl" />
            <span className="text-[10px] font-medium">Edit</span>
          </button>

          <button
            onClick={e => { e.stopPropagation(); onDelete?.(question.id); }}
            className="flex flex-col items-center gap-1.5 text-white hover:text-red-300 transition-colors py-2"
          >
            <DeleteOutlined className="text-xl" />
            <span className="text-[10px] font-medium">Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}
