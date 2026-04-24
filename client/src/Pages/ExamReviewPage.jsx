import { useState, useEffect } from "react";
import api from "../lib/api";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  CheckOutlined,
  BookOutlined,
  BellOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  BarChartOutlined,
  FilterOutlined,
  DownloadOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

/* ─── Helpers ───────────────────────────────────────────── */
const scoreColor = (s) =>
  s >= 90 ? "var(--color-success)"
  : s >= 70 ? "var(--color-info)"
  : s >= 60 ? "var(--color-warning)"
  : "var(--color-error)";

const scoreGrade = (s) =>
  s >= 90 ? "A" : s >= 80 ? "B" : s >= 70 ? "C" : s >= 60 ? "D" : "F";

/* ─── Main ───────────────────────────────────────────────── */
export default function ExamReviewPage() {
  const navigate = useNavigate();
  const { examId, studentId: attemptId } = useParams();
  const resolvedExamId = examId;
  const [activeQ, setActiveQ] = useState(0);
  const [filter, setFilter] = useState("all");
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/exam-attempts/${attemptId}`).then(({ data }) => {
      setAttempt(data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [attemptId]);

  // Map attempt answers to REVIEW_QA shape
  const REVIEW_QA = (attempt?.answers || []).map((a, i) => ({
    q: a.questionText || `Question ${i + 1}`,
    options: a.options || [],
    correct: a.correctAnswer ?? null,
    chosen: a.chosenOptionIndex ?? null,
    chapter: a.chapter || a.module || "General",
    points: a.points || 1,
  }));

  const SUBMISSION = {
    student: attempt?.studentId?.username || "Student",
    avatar: (attempt?.studentId?.username || "S").slice(0, 2).toUpperCase(),
    score: attempt?.score ?? 0,
    timeTaken: attempt?.timeTaken || "—",
    submittedAt: attempt?.submittedAt ? new Date(attempt.submittedAt).toLocaleString() : "—",
    course: (attempt?.examId?.courseIds || []).join(", ") || "—",
    exam: "Exam Review",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-primary text-sm">Loading…</div>
      </div>
    );
  }

  const correct = REVIEW_QA.filter(q => q.chosen === q.correct).length;
  const incorrect = REVIEW_QA.length - correct;
  const totalPoints = REVIEW_QA.reduce((s, q) => s + q.points, 0);
  const earnedPoints = REVIEW_QA.filter(q => q.chosen === q.correct).reduce((s, q) => s + q.points, 0);

  const visibleQs = REVIEW_QA
    .map((q, i) => ({ ...q, originalIdx: i }))
    .filter(q =>
      filter === "all" ? true
      : filter === "correct" ? q.chosen === q.correct
      : q.chosen !== q.correct
    );

  const q = REVIEW_QA[activeQ] || {};
  const visibleIdx = visibleQs.findIndex(v => v.originalIdx === activeQ);

  const optionStyle = (i) => {
    if (i === q.correct && i === q.chosen)
      return { border: "var(--color-success)", bg: "rgba(16,185,129,0.08)", labelColor: "var(--color-success)", icon: "correct-chosen" };
    if (i === q.correct)
      return { border: "rgba(16,185,129,0.5)", bg: "rgba(16,185,129,0.05)", labelColor: "var(--color-success)", icon: "correct" };
    if (i === q.chosen)
      return { border: "var(--color-error)", bg: "rgba(239,68,68,0.08)", labelColor: "var(--color-error)", icon: "wrong" };
    return { border: "var(--color-border)", bg: "transparent", labelColor: "var(--color-text-muted)", icon: null };
  };

  const navigateQ = (dir) => {
    const newVisIdx = visibleIdx + dir;
    if (newVisIdx < 0 || newVisIdx >= visibleQs.length) return;
    setActiveQ(visibleQs[newVisIdx].originalIdx);
  };

  return (
    <div className="min-h-screen bg-bg! font-sans">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ── Header ── */}
        <div className="mb-6">
          <nav className="text-sm my-3" aria-label="Breadcrumb">
            <ol className="list-none p-0 inline-flex items-center gap-1.5">
              <li>
                <Link
                  to="/teacher/exams"
                  className="text-text-secondary hover:text-primary font-medium transition-colors duration-150"
                >
                  Exams
                </Link>
              </li>
              <li>
                <RightOutlined className="text-text-muted!" style={{ fontSize: 10 }} />
              </li>
              <li>
                <Link
                  to={`/teacher/exams/${resolvedExamId}/submissions`}
                  className="text-text-secondary hover:text-primary font-medium transition-colors duration-150"
                >
                  Submissions
                </Link>
              </li>
              <li>
                <RightOutlined className="text-text-muted!" style={{ fontSize: 10 }} />
              </li>
              <li className="text-primary font-medium truncate max-w-56">
                Review
              </li>
            </ol>
          </nav>

          {/* Hero card */}
          <div className="relative rounded-2xl border border-border! bg-surface! overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1"
              style={{ background: `linear-gradient(90deg, ${scoreColor(SUBMISSION.score)}, var(--color-ai))` }} />
            <div className="absolute inset-0 opacity-[0.03]"
              style={{ background: `radial-gradient(ellipse at top right, ${scoreColor(SUBMISSION.score)} 0%, transparent 60%)` }} />

            <div className="relative flex flex-col sm:flex-row sm:items-center gap-5 p-6">
              {/* Avatar + student info */}
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white! text-lg! font-black shadow-lg!"
                    style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-ai))` }}>
                    {SUBMISSION.avatar}
                  </div>
                  {/* Grade badge */}
                  <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-lg flex items-center justify-center text-xs! font-black text-white! shadow-md!"
                    style={{ background: scoreColor(SUBMISSION.score) }}>
                    {scoreGrade(SUBMISSION.score)}
                  </div>
                </div>
                <div>
                  <h1 className="text-lg font-black text-text!">{SUBMISSION.student}</h1>
                  <p className="text-xs! text-text-muted!">{SUBMISSION.course}</p>
                  <p className="text-xs! text-text-muted! mt-0.5">{SUBMISSION.submittedAt}</p>
                </div>
              </div>

              {/* Divider */}
              <div className="hidden sm:block w-px h-14 bg-border!" />

              {/* Score ring area */}
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-center">
                  <span className="text-4xl font-black leading-none" style={{ color: scoreColor(SUBMISSION.score) }}>
                    {SUBMISSION.score}
                  </span>
                  <span className="text-xs! text-text-muted! mt-0.5">/ 100</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 text-xs!">
                    <span className="w-2 h-2 rounded-full bg-success!" />
                    <span className="text-text-secondary!">{correct} correct</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs!">
                    <span className="w-2 h-2 rounded-full bg-error!" />
                    <span className="text-text-secondary!">{incorrect} incorrect</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs!">
                    <span className="w-2 h-2 rounded-full bg-ai!" />
                    <span className="text-text-secondary!">{earnedPoints}/{totalPoints} pts</span>
                  </div>
                </div>
              </div>

              {/* Stats pills */}
              <div className="sm:ml-auto flex flex-wrap gap-2">
                {[
                  { icon: <ClockCircleOutlined />, label: SUBMISSION.timeTaken },
                  { icon: <FileTextOutlined />,    label: `${REVIEW_QA.length} questions` },
                  { icon: <BarChartOutlined />,    label: `${Math.round((correct / REVIEW_QA.length) * 100)}% accuracy` },
                ].map(({ icon, label }) => (
                  <span key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-alt! border border-border! text-xs! text-text-secondary!">
                    <span style={{ color: "var(--color-text-muted)" }}>{icon}</span> {label}
                  </span>
                ))}
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10! border border-primary/20! text-xs! text-primary! font-bold hover:opacity-80 transition">
                  <DownloadOutlined /> Export
                </button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="px-6 pb-5">
              <div className="flex justify-between text-[10px]! text-text-muted! mb-1.5">
                <span>Score breakdown</span>
                <span style={{ color: scoreColor(SUBMISSION.score) }}>{SUBMISSION.score}%</span>
              </div>
              <div className="h-2 rounded-full bg-surface-alt! overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${SUBMISSION.score}%`, background: `linear-gradient(90deg, ${scoreColor(SUBMISSION.score)}, var(--color-ai))` }} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex flex-col xl:flex-row gap-6">
          {/* ── Navigator sidebar ── */}
          <div className="xl:w-56 shrink-0">
            <div className="rounded-2xl border border-border! bg-surface! overflow-hidden xl:sticky xl:top-24">
              {/* Filter */}
              <div className="flex gap-1 p-3 border-b! border-border!">
                {[
                  { id: "all",       label: "All",   count: REVIEW_QA.length },
                  { id: "correct",   label: "✓",     count: correct },
                  { id: "incorrect", label: "✗",     count: incorrect },
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => { setFilter(f.id); const first = REVIEW_QA.findIndex((q, i) => f.id === "all" || (f.id === "correct" ? q.chosen === q.correct : q.chosen !== q.correct)); if (first >= 0) setActiveQ(first); }}
                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px]! font-black transition ${filter === f.id ? "bg-primary! text-white!" : "text-text-muted! hover:text-text!"}`}
                  >
                    {f.label}
                    <span className={`px-1 rounded-full text-[9px]! ${filter === f.id ? "bg-white/20!" : "bg-surface-alt!"}`}>{f.count}</span>
                  </button>
                ))}
              </div>

              {/* Grid */}
              <div className="p-3">
                <div className="grid grid-cols-5 xl:grid-cols-4 gap-1.5">
                  {REVIEW_QA.map((q2, i) => {
                    const isCorrect = q2.chosen === q2.correct;
                    const isActive = activeQ === i;
                    const isVisible = filter === "all" || (filter === "correct" ? isCorrect : isCorrect);
                    return (
                      <button
                        key={i}
                        onClick={() => setActiveQ(i)}
                        disabled={!isVisible}
                        className="relative w-full aspect-square rounded-xl text-xs! font-black text-white! transition-all duration-200 disabled:opacity-20"
                        style={{
                          background: isActive
                            ? "var(--color-primary)"
                            : isCorrect ? "var(--color-success)" : "var(--color-error)",
                          transform: isActive ? "scale(1.1)" : "scale(1)",
                          boxShadow: isActive ? `0 4px 12px var(--color-primary)50` : undefined,
                        }}
                      >
                        {i + 1}
                        {/* points dot */}
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-surface! border border-border! text-[8px]! font-black flex items-center justify-center"
                          style={{ color: isCorrect ? "var(--color-success)" : "var(--color-error)" }}>
                          {q2.points}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Legend */}
              <div className="px-3 pb-3 space-y-1.5">
                <div className="h-px bg-border! mb-3" />
                {[
                  { color: "var(--color-success)", label: `${correct} Correct` },
                  { color: "var(--color-error)",   label: `${incorrect} Incorrect` },
                ].map(({ color, label }) => (
                  <div key={label} className="flex items-center gap-2 text-xs! text-text-secondary!">
                    <span className="w-2.5 h-2.5 rounded-md" style={{ background: color }} />
                    {label}
                  </div>
                ))}
                <div className="flex items-center gap-2 text-xs! text-text-muted!">
                  <span className="text-[9px]!">●</span> Corner = points
                </div>
              </div>
            </div>
          </div>

          {/* ── Question detail ── */}
          <div className="flex-1 min-w-0">
            <div className="rounded-2xl border border-border! bg-surface! overflow-hidden">
              {/* Question header */}
              <div className="flex items-center justify-between gap-3 px-6 py-4 border-b! border-border!">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-1 rounded-lg bg-surface-alt! text-xs! font-black text-text-muted!">
                    Q{activeQ + 1} / {REVIEW_QA.length}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px]! font-bold bg-primary/10! text-primary!">
                    {q.chapter}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px]! font-bold bg-surface-alt! text-text-muted!">
                    {q.points} pts
                  </span>
                </div>
                {q.chosen === q.correct ? (
                  <span className="flex items-center gap-1.5 text-xs! font-bold px-3 py-1 rounded-full"
                    style={{ background: "rgba(16,185,129,0.1)", color: "var(--color-success)" }}>
                    <CheckCircleOutlined /> Correct · +{q.points} pts
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs! font-bold px-3 py-1 rounded-full"
                    style={{ background: "rgba(239,68,68,0.1)", color: "var(--color-error)" }}>
                    <CloseCircleOutlined /> Incorrect · 0 pts
                  </span>
                )}
              </div>

              {/* Question text */}
              <div className="px-6 py-5">
                <p className="text-base! font-semibold text-text! leading-relaxed mb-6">{q.q}</p>

                {/* Options */}
                <div className="space-y-3 mb-8">
                  {q.options.map((opt, i) => {
                    const style = optionStyle(i);
                    const letter = String.fromCharCode(65 + i);
                    return (
                      <div
                        key={i}
                        className="relative flex items-center gap-3 rounded-xl border p-4 transition-all"
                        style={{ borderColor: style.border, background: style.bg }}
                      >
                        {/* Letter badge */}
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs! font-black shrink-0 border border-border!"
                          style={{
                            background: i === q.correct ? `${style.labelColor}15` : i === q.chosen ? `${style.labelColor}10` : "var(--color-surface-alt)",
                            color: style.labelColor,
                            borderColor: i === q.correct || i === q.chosen ? style.border : "var(--color-border)",
                          }}>
                          {letter}
                        </div>

                        <span className="flex-1 text-sm! text-text!">{opt}</span>

                        {/* Tags */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {i === q.chosen && i !== q.correct && (
                            <span className="text-[10px]! font-bold px-2 py-0.5 rounded-full text-white!" style={{ background: "var(--color-error)" }}>
                              Student's Answer
                            </span>
                          )}
                          {i === q.correct && (
                            <span className="text-[10px]! font-bold px-2 py-0.5 rounded-full text-white!" style={{ background: "var(--color-success)" }}>
                              Correct Answer
                            </span>
                          )}
                          {style.icon === "correct-chosen" && <CheckCircleOutlined style={{ color: "var(--color-success)", fontSize: 16 }} />}
                          {style.icon === "correct" && <CheckOutlined style={{ color: "var(--color-success)", fontSize: 14 }} />}
                          {style.icon === "wrong" && <CloseCircleOutlined style={{ color: "var(--color-error)", fontSize: 16 }} />}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Explanation placeholder */}
                {q.chosen !== q.correct && (
                  <div className="rounded-xl border border-info/20! bg-info/5! p-4 mb-6">
                    <p className="text-xs! font-bold text-info! mb-1 flex items-center gap-1.5">
                      <TrophyOutlined /> Explanation
                    </p>
                    <p className="text-xs! text-text-secondary! leading-relaxed">
                      The correct answer is <strong>{String.fromCharCode(65 + q.correct)}</strong>. Review <em>{q.chapter}</em> for more detail on this concept.
                    </p>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between gap-3">
                  <button
                    disabled={visibleIdx === 0}
                    onClick={() => navigateQ(-1)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm! font-bold border border-border! bg-surface-alt! text-text! hover:opacity-80 transition disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    ← Previous
                  </button>

                  {/* Progress dots */}
                  <div className="flex gap-1">
                    {visibleQs.map((v, i) => (
                      <button
                        key={v.originalIdx}
                        onClick={() => setActiveQ(v.originalIdx)}
                        className="rounded-full transition-all duration-200"
                        style={{
                          width: i === visibleIdx ? 20 : 6,
                          height: 6,
                          background: i === visibleIdx
                            ? "var(--color-primary)"
                            : v.chosen === v.correct ? "var(--color-success)" : "var(--color-error)",
                          opacity: Math.abs(i - visibleIdx) > 3 ? 0.3 : 1,
                        }}
                      />
                    ))}
                  </div>

                  <button
                    disabled={visibleIdx === visibleQs.length - 1}
                    onClick={() => navigateQ(1)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm! font-bold bg-primary! text-white! hover:bg-primary-hover! transition disabled:opacity-30 disabled:cursor-not-allowed shadow-lg! shadow-(--color-primary)/20! hover:-translate-y-0.5"
                  >
                    Next →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


