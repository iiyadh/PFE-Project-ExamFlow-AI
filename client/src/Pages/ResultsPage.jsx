import { useState, useEffect } from "react";
import api from "../lib/api";
import {
  CheckCircleFilled,
  CloseCircleFilled,
  TrophyOutlined,
  LockOutlined,
  UnlockOutlined,
  ClockCircleOutlined,
  BarChartOutlined,
  BookOutlined,
  RightOutlined,
  StarFilled,
  ReloadOutlined,
} from "@ant-design/icons";
import { Link, useNavigate, useParams } from "react-router-dom";

function getGrade(pct) {
  if (pct >= 90) return { g: "A+", color: "!text-[var(--color-success)]", bg: "!bg-[var(--color-success)]/10" };
  if (pct >= 80) return { g: "A",  color: "!text-[var(--color-success)]", bg: "!bg-[var(--color-success)]/10" };
  if (pct >= 70) return { g: "B",  color: "!text-[var(--color-accent)]",  bg: "!bg-[var(--color-accent)]/10"  };
  if (pct >= 60) return { g: "C",  color: "!text-[var(--color-warning)]", bg: "!bg-[var(--color-warning)]/10" };
  return          { g: "F",  color: "!text-[var(--color-error)]",   bg: "!bg-[var(--color-error)]/10"   };
}

export default function ResultsPage() {
  const navigate = useNavigate();
  const { examId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedQ, setExpandedQ] = useState(null);

  useEffect(() => {
    const attemptId = localStorage.getItem("last_attempt_id");
    if (!attemptId) { setLoading(false); return; }
    api.get(`/exam-attempts/${attemptId}/results`)
      .then(({ data: d }) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-5rem)] bg-bg! flex items-center justify-center">
        <div className="text-primary text-sm">Loading results…</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-[calc(100vh-5rem)] bg-bg! flex flex-col items-center justify-center gap-4">
        <p className="text-text-muted text-sm">No results found.</p>
        <button
          onClick={() => navigate("/student/exams")}
          className="px-5 py-2.5 rounded-xl bg-primary! text-white! text-sm font-semibold"
        >
          Back to Calendar
        </button>
      </div>
    );
  }

  const { score, grade: apiGrade, earnedPoints, totalPoints, timeTaken, results = [], fullMode, examTitle } = data;
  const pct = score ?? 0;
  const grade = getGrade(pct);
  const correct = results.filter((r) => r.isCorrect === true).length;
  const total = results.length;

  // Module breakdown
  const modulesMap = {};
  results.forEach((r) => {
    const mod = r.module || "General";
    if (!modulesMap[mod]) modulesMap[mod] = { correct: 0, total: 0 };
    modulesMap[mod].total++;
    if (r.isCorrect) modulesMap[mod].correct++;
  });
  const moduleScores = Object.entries(modulesMap).map(([mod, v]) => ({
    mod,
    correct: v.correct,
    total: v.total,
    pct: Math.round((v.correct / v.total) * 100),
  }));

  const circumference = 2 * Math.PI * 42;
  const dashOffset = circumference - (pct / 100) * circumference;

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-bg! font-sans">
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
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
              Results
            </li>
          </ol>
        </nav>

        {/* Page nav */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOutlined className="text-primary!" />
            <div>
              <p className="text-xs! text-text-muted!">Exam Results</p>
              <p className="text-sm! font-semibold text-text!">{examTitle || "Exam"}</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/student/exams")}
            className="flex items-center gap-2 text-sm! text-text-secondary! hover:text-text! transition-colors"
          >
            <ReloadOutlined /> Back to Calendar
          </button>
        </div>

        {/* Score hero */}
        <div className="bg-surface! rounded-2xl border border-border! p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br! from-primary/5! to-accent/5! pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row items-center gap-8">
            {/* Circular progress */}
            <div className="relative w-28 h-28 shrink-0">
              <svg className="w-28 h-28 -rotate-90" viewBox="0 0 96 96">
                <circle cx="48" cy="48" r="42" fill="none" stroke="var(--color-border)" strokeWidth="8" />
                <circle
                  cx="48" cy="48" r="42"
                  fill="none"
                  stroke={pct >= 70 ? "var(--color-success)" : pct >= 50 ? "var(--color-warning)" : "var(--color-error)"}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  style={{ transition: "!stroke-dashoffset 1s ease" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-text!">{pct}%</span>
                <span className={`text-sm font-bold ${grade.color}`}>{apiGrade || grade.g}</span>
              </div>
            </div>

            <div className="flex-1 text-center! sm:text-left!">
              <div className="flex items-center gap-2 mb-2 justify-center sm:justify-start">
                <TrophyOutlined className="text-warning! text-lg!" />
                <h1 className="text-xl font-bold text-text!">
                  {pct >= 70 ? "Congratulations!" : pct >= 50 ? "Good Effort!" : "Keep Practicing"}
                </h1>
              </div>
              <p className="text-sm text-text-muted! mb-4">
                You scored <span className="font-semibold text-text!">{earnedPoints ?? correct}</span> out of{" "}
                <span className="font-semibold text-text!">{totalPoints ?? total}</span> points correctly.
              </p>
              <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                {[
                  { label: "Correct", val: correct, color: "!text-[var(--color-success)] bg-[var(--color-success)]/10!" },
                  { label: "Wrong", val: total - correct, color: "!text-[var(--color-error)] bg-[var(--color-error)]/10!" },
                  { label: timeTaken || "—", val: null, icon: <ClockCircleOutlined />, color: "!text-[var(--color-accent)] bg-[var(--color-accent)]/10!" },
                ].map((s) => (
                  <div key={s.label} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm! font-semibold ${s.color}`}>
                    {s.icon} {s.val !== null ? s.val : ""} {s.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Mode indicator */}
            <div className="shrink-0">
              <div className="bg-surface-alt! border border-border! rounded-xl p-4 text-center!">
                {fullMode ? (
                  <>
                    <UnlockOutlined className="text-success! text-xl! mb-2" />
                    <p className="text-xs font-semibold text-success! mb-1">Full Results</p>
                    <p className="text-[11px] text-text-muted!">Answers visible</p>
                  </>
                ) : (
                  <>
                    <LockOutlined className="text-text-! text-xl! mb-2" />
                    <p className="text-xs font-semibold text-text-muted! mb-1">Limited View</p>
                    <p className="text-[11px] text-text-muted!">Answers hidden</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Module breakdown */}
          {moduleScores.length > 0 && (
            <div className="bg-surface! rounded-2xl border border-border! p-5">
              <h2 className="text-sm font-semibold text-text! flex items-center gap-2 mb-4">
                <BarChartOutlined className="text-primary!" />
                By Module
              </h2>
              <div className="space-y-3">
                {moduleScores.map((m) => (
                  <div key={m.mod}>
                    <div className="flex justify-between text-xs! mb-1">
                      <span className="text-text-secondary! font-medium truncate">{m.mod}</span>
                      <span className={`font-bold ${m.pct >= 70 ? "text-success!" : "text-warning!"}`}>
                        {m.correct}/{m.total}
                      </span>
                    </div>
                    <div className="h-1.5 bg-border! rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${m.pct}%`,
                          backgroundColor: m.pct >= 70 ? "var(--color-success)" : m.pct >= 50 ? "var(--color-warning)" : "var(--color-error)",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Questions list */}
          <div className={`${moduleScores.length > 0 ? "lg:col-span-2" : "lg:col-span-3"} bg-surface! rounded-2xl border border-border! overflow-hidden`}>
            <div className="px-5 py-4 border-b! border-border! flex items-center justify-between">
              <h2 className="text-sm font-semibold text-text!">
                {fullMode ? "Detailed Review" : "Answer Summary"}
              </h2>
              {!fullMode && (
                <div className="flex items-center gap-1.5 text-xs! text-text-muted!">
                  <LockOutlined className="text-xs" />
                  Answers hidden by instructor
                </div>
              )}
            </div>

            <div className="divide-y divide-border">
              {results.map((r, i) => {
                const isCorrect = r.isCorrect === true;
                const isExpanded = expandedQ === r.id;

                return (
                  <div key={r.id}>
                    <div
                      onClick={() => fullMode && setExpandedQ(isExpanded ? null : r.id)}
                      className={`flex items-center gap-4 px-5 py-3.5 transition-colors
                        ${fullMode ? "cursor-pointer hover:bg-surface-alt!" : ""}
                        ${isExpanded ? "bg-surface-alt!" : ""}
                      `}
                    >
                      <span className="text-xs font-bold text-text-muted! w-5 shrink-0">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-text! truncate">{r.text}</p>
                        <p className="text-xs text-text-muted!">{r.module}</p>
                      </div>
                      {r.isCorrect === null ? (
                        <span className="text-xs text-text-muted! shrink-0">Pending</span>
                      ) : isCorrect ? (
                        <CheckCircleFilled className="text-success! shrink-0" />
                      ) : (
                        <CloseCircleFilled className="text-error! shrink-0" />
                      )}
                      {fullMode && <RightOutlined className={`text-xs text-text-muted! transition-transform ${isExpanded ? "rotate-90" : ""}`} />}
                    </div>

                    {/* Expanded answer details (full mode only) */}
                    {fullMode && isExpanded && (
                      <div className="px-5 pb-4 bg-surface-alt! space-y-2">
                        {(r.options || []).map((opt, idx) => {
                          const isSelected = r.selected === idx;
                          const isRight = r.correct === idx;
                          return (
                            <div
                              key={idx}
                              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm! border
                                ${isRight ? "bg-success/8! border-success/30! text-success!" :
                                  isSelected && !isRight ? "bg-error/8! border-error/30! text-error!" :
                                  "border-border! text-text-muted!"}
                              `}
                            >
                              <span className="w-5 h-5 rounded border flex items-center justify-center text-xs! font-bold shrink-0">
                                {String.fromCharCode(65 + idx)}
                              </span>
                              <span className="flex-1">{opt}</span>
                              {isRight && <CheckCircleFilled />}
                              {isSelected && !isRight && <CloseCircleFilled />}
                              {isSelected && isRight && <StarFilled className="text-warning!" />}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate("/student/exams")}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-primary! hover:bg-primary-hover! text-white! text-sm! font-semibold transition-colors shadow-lg! shadow-(--color-primary)/20! flex items-center justify-center gap-2"
          >
            Back to Calendar <RightOutlined />
          </button>
        </div>
      </div>
    </div>
  );
}
