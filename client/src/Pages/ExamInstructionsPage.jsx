import { useState, useEffect } from "react";
import api from "../lib/api";
import {
  ClockCircleOutlined,
  SafetyOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  RightOutlined,
  BookOutlined,
  QuestionCircleOutlined,
  WarningOutlined,
  TeamOutlined,
  LaptopOutlined,
  BulbOutlined,
} from "@ant-design/icons";
import { Link, useNavigate, useParams } from "react-router-dom";

const RULES = [
  {
    icon: <QuestionCircleOutlined />,
    title: "One Question at a Time",
    desc: "Questions are displayed one per page. You must provide an answer before moving to the next.",
    color: "!text-[var(--color-accent)]",
    bg: "!bg-[var(--color-accent)]/10",
  },
  {
    icon: <CheckCircleOutlined />,
    title: "All Questions Required",
    desc: "Every question must be answered. You cannot submit with unanswered questions.",
    color: "!text-[var(--color-success)]",
    bg: "!bg-[var(--color-success)]/10",
  },
  {
    icon: <ClockCircleOutlined />,
    title: "Timed Exam",
    desc: "The timer starts when you click Start. The exam auto-submits when time runs out.",
    color: "!text-[var(--color-warning)]",
    bg: "!bg-[var(--color-warning)]/10",
  },
  {
    icon: <LaptopOutlined />,
    title: "No Tab Switching",
    desc: "Do not switch browser tabs or open other applications during the exam.",
    color: "!text-[var(--color-error)]",
    bg: "!bg-[var(--color-error)]/10",
  },
  {
    icon: <SafetyOutlined />,
    title: "Auto-Save Enabled",
    desc: "Your answers are saved automatically as you progress. You won't lose progress on refresh.",
    color: "!text-[var(--color-ai)]",
    bg: "!bg-[var(--color-ai)]/10",
  },
  {
    icon: <BulbOutlined />,
    title: "Bookmarks Allowed",
    desc: "You can bookmark questions and return to them before final submission.",
    color: "!text-[var(--color-primary)]",
    bg: "!bg-[var(--color-primary)]/10",
  },
];

export default function ExamInstructionsPage() {
  const navigate = useNavigate();
  const { examId } = useParams();
  const [agreed, setAgreed] = useState(false);
  const [exam, setExam] = useState(null);

  useEffect(() => {
    if (examId) {
      api.get(`/exams/${examId}`).then(({ data }) => setExam(data)).catch(() => {});
    }
  }, [examId]);

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-bg! flex flex-col">
      {/* Top bar */}
      <div className="bg-surface! border-b! border-border! px-6 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary! flex items-center justify-center">
          <BookOutlined className="text-white! text-sm!" />
        </div>
        <div>
          <p className="text-xs! text-text-muted!">{(exam?.courseNames || exam?.courseIds)?.join(", ") || "—"}</p>
          <p className="text-sm! font-semibold text-text!">{exam?.title || "Loading…"}</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-2xl space-y-6">
          <nav className="text-sm my-3" aria-label="Breadcrumb">
            <ol className="list-none p-0 inline-flex items-center gap-1.5">
              <li>
                <Link
                  to="/student/exams"
                  className="text-text-secondary hover:text-primary font-medium transition-colors duration-150"
                >
                  Exams
                </Link>
              </li>
              <li>
                <RightOutlined className="text-text-muted!" style={{ fontSize: 10 }} />
              </li>
              <li className="text-primary font-medium">
                Instructions
              </li>
            </ol>
          </nav>

          {/* Hero */}
          <div className="bg-surface! rounded-2xl border border-border! p-8 text-center! relative overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-br! from-primary/5! via-transparent! to-accent/5! pointer-events-none" />
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-primary/10! border border-primary/20! flex items-center justify-center mx-auto mb-4">
                <BookOutlined className="text-primary! text-2xl!" />
              </div>
              <h1 className="text-2xl! font-bold text-text! mb-1">
                {exam?.title || "Loading…"}
              </h1>
              <p className="text-sm! text-text-muted! mb-6">{(exam?.courseNames || exam?.courseIds)?.join(", ") || "—"}</p>

              {/* Stats row */}
              <div className="flex items-center justify-center gap-6">
                {[
                  { icon: <ClockCircleOutlined />, val: exam ? `${exam.durationMinutes} min` : "—", label: "Duration" },
                  { icon: <QuestionCircleOutlined />, val: exam ? `${exam.totalQuestions || "?"} Qs` : "—", label: "Questions" },
                  { icon: <TeamOutlined />, val: "MCQ", label: "Type" },
                ].map((s) => (
                  <div key={s.label} className="text-center! px-4">
                    <div className="flex items-center justify-center gap-1 text-primary! text-sm! font-bold mb-0.5">
                      {s.icon} {s.val}
                    </div>
                    <div className="text-xs! text-text-muted!">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Warning banner */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-warning/8! border border-warning/25!">
            <WarningOutlined className="text-warning! mt-0.5 shrink-0" />
            <p className="text-sm! text-text-secondary!">
              <span className="font-semibold text-warning!">Important: </span>
              Once you start, the timer cannot be paused. Make sure you're in a quiet environment with a stable internet connection before beginning.
            </p>
          </div>

          {/* Rules */}
          <div className="bg-surface! rounded-2xl border border-border! p-6">
            <h2 className="text-sm! font-semibold text-text! mb-4 flex items-center gap-2">
              <ExclamationCircleOutlined className="text-primary!" />
              Exam Rules & Guidelines
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {RULES.map((rule) => (
                <div
                  key={rule.title}
                  className="flex items-start gap-3 p-3 rounded-xl bg-surface-alt! border border-border!"
                >
                  <div className={`w-8 h-8 rounded-lg ${rule.bg} flex items-center justify-center shrink-0 ${rule.color}`}>
                    {rule.icon}
                  </div>
                  <div>
                    <p className="text-xs! font-semibold text-text! mb-0.5">{rule.title}</p>
                    <p className="text-[11px]! text-text-muted! leading-relaxed">{rule.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Agreement + Start */}
          <div className="bg-surface! rounded-2xl border border-border! p-6 space-y-4">
            <button
              onClick={() => navigate("/student/exams")}
              className="w-full py-2.5 rounded-xl border border-border! text-sm! text-text-secondary! hover:bg-surface-alt! transition-colors"
            >
              Back to Calendar
            </button>

            <label className="flex items-start gap-3 cursor-pointer group">
              <div
                onClick={() => setAgreed(!agreed)}
                className={`mt-0.5 w-5 h-5 rounded border-2! flex items-center justify-center shrink-0 transition-colors
                  ${agreed ? "bg-primary! border-primary!" : "border-border! group-hover:border-primary/50!"}
                `}
              >
                {agreed && <CheckCircleOutlined className="text-white! text-xs!" />}
              </div>
              <p className="text-sm! text-text-secondary!">
                I have read and understood all the rules. I agree to complete the exam honestly without any external assistance.
              </p>
            </label>

            <button
              disabled={!agreed}
              onClick={() => {
                if (!agreed) return;
                sessionStorage.setItem("currentExam", JSON.stringify({
                  examId,
                  title: exam?.title,
                  duration: exam?.durationMinutes || 90,
                }));
                navigate(`/student/exams/${examId}/take`);
              }}
              className={`w-full py-3.5 rounded-xl font-semibold text-sm! flex items-center justify-center gap-2 transition-all
                ${agreed
                  ? "bg-primary! hover:bg-primary-hover! text-white! shadow-lg! shadow-(--color-primary)/20! hover:shadow-(--color-primary)/30!"
                  : "bg-surface-alt! text-text-muted! cursor-not-allowed border border-border!"}
              `}
            >
              Start Exam <RightOutlined />
            </button>

            <p className="text-center! text-xs! text-text-muted!">
              Timer will begin immediately after clicking Start
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


