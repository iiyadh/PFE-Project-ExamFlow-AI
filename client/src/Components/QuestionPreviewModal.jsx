import {
  CloseOutlined, EditOutlined, TagOutlined,
  CheckCircleFilled, ClockCircleFilled, ExclamationCircleFilled, RobotOutlined,
} from "@ant-design/icons";

const DIFFICULTY_CONFIG = {
  easy: { label: "Easy", color: "var(--color-success)", bg: "rgba(16,185,129,0.1)" },
  medium: { label: "Medium", color: "var(--color-warning)", bg: "rgba(245,158,11,0.1)" },
  hard: { label: "Hard", color: "var(--color-error)", bg: "rgba(239,68,68,0.1)" },
};

export default function QuestionPreviewModal({ question, onClose, onEdit }) {
  const diff = DIFFICULTY_CONFIG[question.difficulty] ?? DIFFICULTY_CONFIG.medium;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-surface rounded-2xl border border-border w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider border ${question.type === "mcq" ? "border-accent/30 text-accent bg-accent/5" : "border-ai/30 text-ai bg-ai/5"}`}>
              {question.type === "mcq" ? "Multiple Choice" : "Short Answer"}
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ color: diff.color, background: diff.bg }}>
              {diff.label}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onEdit && (
              <button
                onClick={() => { onClose(); onEdit(question); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-primary border border-primary/30 hover:bg-primary/5 transition-all"
              >
                <EditOutlined className="text-xs" /> Edit
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-surface-alt flex items-center justify-center text-text-muted hover:text-text transition-all"
            >
              <CloseOutlined className="text-sm" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Meta */}
          <div className="flex items-center gap-2 text-xs text-text-muted flex-wrap">
            <span className="flex items-center gap-1">
              {question.source === "ai" ? <RobotOutlined className="text-ai" /> : <EditOutlined />}
              {question.source === "ai" ? "AI Generated" : "Manual"}
            </span>
            <span>·</span>
            <span>{question.course}</span>
            <span>·</span>
            <span>{question.chapter}</span>
          </div>

          {/* Question text */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">Question</p>
            <p className="text-sm text-text leading-relaxed font-medium bg-surface-alt rounded-xl px-4 py-3 border border-border">
              {question.text}
            </p>
          </div>

          {/* MCQ Options */}
          {question.options && question.options.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">Answer Options</p>
              <div className="space-y-2">
                {question.options.map((opt, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-sm ${
                      i === question.correctAnswer
                        ? "bg-success/10 border-success/30 text-success font-medium"
                        : "bg-surface-alt border-border text-text"
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 ${
                      i === question.correctAnswer ? "border-success bg-success text-white" : "border-border text-text-muted"
                    }`}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="flex-1">{opt}</span>
                    {i === question.correctAnswer && (
                      <span className="text-[10px] font-bold uppercase bg-success/20 text-success px-2 py-0.5 rounded-full">
                        Correct
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
