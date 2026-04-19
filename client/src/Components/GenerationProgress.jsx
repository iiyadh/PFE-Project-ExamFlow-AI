import { useState, useEffect } from "react";
import { CheckCircleFilled, CloseOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";

const STEPS = [
  { id: 1, label: "Chapter content analyzed" },
  { id: 2, label: "Generating question stems" },
  { id: 3, label: "Adding MCQ answer options" },
  { id: 4, label: "Tagging difficulty & topics" },
];

const STEP_LABELS = [
  "Analyzing chapter content…",
  "Generating question stems…",
  "Adding MCQ answer options…",
  "Tagging difficulty & topics…",
];

const STREAMED_QUESTIONS = [
  "What is the primary pigment responsible for capturing light energy during photosynthesis?",
  "Which stage of photosynthesis directly produces ATP and NADPH?",
  "In the Calvin cycle, how many CO₂ molecules are needed to produce one molecule of G3P",
];

const  GenerationProgress = ({ chapter = "Chapter 4 — Photosynthesis", count = 10, type = "MCQs", onCancel }) =>{
  const navigate = useNavigate();
  const { state } = useLocation();
  const activeChapter = state?.chapter || chapter;
  const activeCount = state?.count || count;
  const activeType = state?.type || type;
  const [progress, setProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(1);
  const [visibleQuestions, setVisibleQuestions] = useState([]);

  useEffect(() => {
    const iv = setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(prev + Math.random() * 3 + 1, 72);
        if (next > 30 && prev <= 30) setActiveStep(2);
        if (next > 55 && prev <= 55) setActiveStep(3);
        if (next >= 72) {
          setActiveStep(4);
          clearInterval(iv);
        }
        return next;
      });
    }, 250);

    const timers = STREAMED_QUESTIONS.map((_, i) =>
      setTimeout(() => setVisibleQuestions((v) => [...v, STREAMED_QUESTIONS[i]]), i * 900)
    );

    return () => { clearInterval(iv); timers.forEach(clearTimeout); };
  }, []);

  useEffect(() => {
    if (progress < 72) return;

    const timer = setTimeout(() => {
      navigate("/teacher/genpreview", {
        state: {
          classId: state?.classId,
          className: state?.className,
          chapter: activeChapter,
          count: activeCount,
          type: activeType,
        },
      });
    }, 1200);

    return () => clearTimeout(timer);
  }, [progress, navigate, activeChapter, activeCount, activeType]);

  const stepStatus = (id) => {
    if (id < activeStep) return "done";
    if (id === activeStep) return "active";
    return "pending";
  };

  return (
    <div className="bg-surface rounded-2xl border border-border p-8 max-w-xl mx-auto mt-10">
      {/* Header */}
      <div className="flex items-start gap-3 mb-6">
        <div>
          <p className="text-text font-medium text-base">Generating questions</p>
          <p className="text-text-muted text-sm mt-0.5">{activeChapter} · {activeCount} {activeType}</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 bg-[#EDE9FE] text-[#5B21B6] text-xs font-medium px-3 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-ai animate-pulse" />
          AI running
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-surface-alt rounded-full h-2 overflow-hidden mb-2">
        <div
          className="h-full rounded-full bg-linear-to-r from-ai to-accent transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-text-muted mb-6">
        <span>{STEP_LABELS[Math.min(activeStep - 1, STEP_LABELS.length - 1)]}</span>
        <span>{Math.round(progress)}%</span>
      </div>

      {/* Steps */}
      <div className="flex flex-col gap-2.5 mb-6">
        {STEPS.map(({ id, label }) => {
          const status = stepStatus(id);
          return (
            <div
              key={id}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-xl border text-sm transition-all
                ${status === "done" ? "border-[#D1FAE5] bg-[#ECFDF5] text-[#065F46]" : ""}
                ${status === "active" ? "border-[#DDD6FE] bg-[#F5F3FF] text-[#5B21B6]" : ""}
                ${status === "pending" ? "border-border bg-surface text-text-secondary opacity-45" : ""}
              `}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold
                  ${status === "done" ? "bg-success text-white" : ""}
                  ${status === "active" ? "bg-ai text-white animate-pulse" : ""}
                  ${status === "pending" ? "bg-border text-text-muted" : ""}
                `}
              >
                {status === "done" ? <CheckCircleFilled /> : id}
              </div>
              <span>
                {label}
                {status === "active" && (
                  <span className="inline-block w-0.5 h-3 bg-ai ml-0.5 align-middle animate-[blink_0.7s_step-end_infinite]" />
                )}
              </span>
            </div>
          );
        })}
      </div>

      {/* Streaming Preview */}
      <div className="border-t border-border pt-5">
        <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">Streaming preview</p>
        <div className="flex flex-col gap-2">
          {visibleQuestions.map((q, i) => (
            <div
              key={i}
              className="bg-surface-alt border border-[#DBEAFE] rounded-xl px-3.5 py-2.5 text-sm text-text leading-relaxed animate-fade-up"
            >
              {q}
              {i === visibleQuestions.length - 1 && (
                <span className="inline-block w-0.5 h-3 bg-ai ml-0.5 align-middle animate-[blink_0.7s_step-end_infinite]" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Cancel */}
      <button
        onClick={() => {
          if (onCancel) {
            onCancel();
            return;
          }
          navigate("/teacher/genques");
        }}
        className="mt-6 w-full py-2.5 rounded-xl border border-border bg-transparent text-text-secondary text-sm hover:bg-surface-alt transition-colors flex items-center justify-center gap-2"
      >
        <CloseOutlined style={{ fontSize: 12 }} />
        Cancel generation
      </button>
    </div>
  );
}

export default GenerationProgress;