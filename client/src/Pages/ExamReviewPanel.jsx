import { useState, useMemo } from "react";
import {
  FlagFilled,
  CheckCircleFilled,
  ClockCircleOutlined,
  AppstoreOutlined,
  BarsOutlined,
  RightOutlined,
  SearchOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import { Link, useNavigate, useParams } from "react-router-dom";

const statusMeta = {
  answered: { label: "Answered", color: "!bg-[var(--color-primary)]", text: "!text-white", dot: "!bg-[var(--color-primary)]" },
  bookmarked: { label: "Bookmarked", color: "!bg-[var(--color-warning)]/15 border border-[var(--color-warning)]!", text: "!text-[var(--color-warning)]", dot: "!bg-[var(--color-warning)]" },
  "bookmarked-answered": { label: "Bookmarked & Answered", color: "!bg-[var(--color-warning)]", text: "!text-white", dot: "!bg-[var(--color-warning)]" },
  unanswered: { label: "Unanswered", color: "!bg-[var(--color-surface-alt)] border border-[var(--color-border)]!", text: "!text-[var(--color-text-muted)]", dot: "!bg-[var(--color-border)]" },
};

export default function ExamReviewPanel() {
  const navigate = useNavigate();
  const { examId } = useParams();
  const [view, setView] = useState("grid");
  const [filter, setFilter] = useState("All");
  const [moduleFilter, setModuleFilter] = useState("All");
  const [active, setActive] = useState(null);

  // Read session state saved by ExamTakerPage
  const session = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("exam_session") || "{}"); } catch { return {}; }
  }, []);

  const sessionAnswers = session.answers || {};
  const sessionBookmarks = new Set(session.bookmarks || []);
  const sessionQuestions = session.questions || [];

  const QUESTIONS = sessionQuestions.map((q, i) => {
    const hasAnswer = sessionAnswers[i] !== undefined && sessionAnswers[i] !== null;
    const isBookmarked = sessionBookmarks.has(i);
    let status = "unanswered";
    if (hasAnswer && isBookmarked) status = "bookmarked-answered";
    else if (hasAnswer) status = "answered";
    else if (isBookmarked) status = "bookmarked";
    return { id: i + 1, index: i, module: q.module || "General", text: q.text, status };
  });

  const MODULES = ["All", ...Array.from(new Set(QUESTIONS.map((q) => q.module)))];

  const counts = {
    answered: QUESTIONS.filter((q) => q.status === "answered" || q.status === "bookmarked-answered").length,
    unanswered: QUESTIONS.filter((q) => q.status === "unanswered").length,
    bookmarked: QUESTIONS.filter((q) => q.status === "bookmarked" || q.status === "bookmarked-answered").length,
  };

  const filtered = QUESTIONS.filter((q) => {
    const statusMatch =
      filter === "All" ? true :
      filter === "Answered" ? (q.status === "answered" || q.status === "bookmarked-answered") :
      filter === "Bookmarked" ? (q.status === "bookmarked" || q.status === "bookmarked-answered") :
      filter === "Unanswered" ? q.status === "unanswered" : true;
    const moduleMatch = moduleFilter === "All" || q.module === moduleFilter;
    return statusMatch && moduleMatch;
  });

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-bg! p-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-5">
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
            <li>
              <Link
                to={`/student/exams/${examId}/take`}
                className="text-text-secondary hover:text-primary font-medium transition-colors duration-150"
              >
                Exam Session
              </Link>
            </li>
            <li>
              <RightOutlined className="text-text-muted!" style={{ fontSize: 10 }} />
            </li>
            <li className="text-primary font-medium">
              Review Panel
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="bg-surface! rounded-2xl border border-border! p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10! flex items-center justify-center">
                <AppstoreOutlined className="text-primary!" />
              </div>
              <div>
                <h1 className="text-base! font-bold text-text!">Exam Review Panel</h1>
                <p className="text-xs text-text-muted!">Algorithms & Data Structures · CS301</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-alt! border border-border!">
              <ClockCircleOutlined className="text-warning! text-sm!" />
              <span className="text-sm font-mono font-bold text-text!">—</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Answered", val: counts.answered, total: QUESTIONS.length, color: "var(--color-primary)", bg: "!bg-[var(--color-primary)]/10", text: "!text-[var(--color-primary)]" },
              { label: "Bookmarked", val: counts.bookmarked, total: QUESTIONS.length, color: "var(--color-warning)", bg: "!bg-[var(--color-warning)]/10", text: "!text-[var(--color-warning)]" },
              { label: "Unanswered", val: counts.unanswered, total: QUESTIONS.length, color: "var(--color-error)", bg: "!bg-[var(--color-error)]/10", text: "!text-[var(--color-error)]" },
            ].map((s) => (
              <div key={s.label} className={`${s.bg} rounded-xl p-3`}>
                <div className={`text-xl font-bold ${s.text} leading-none`}>{s.val}</div>
                <div className="text-xs text-text-muted! mt-0.5">{s.label}</div>
                <div className="mt-2 h-1 bg-border! rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${(s.val / s.total) * 100}%`, background: `var(--${s.color.slice(4, -1)})` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters + View toggle */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <FilterOutlined className="text-text-muted! text-sm!" />
            {["All", "Answered", "Bookmarked", "Unanswered"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs! font-medium border transition-colors
                  ${filter === f
                    ? "bg-primary! border-primary! text-white!"
                    : "bg-surface! border-border! text-text-secondary! hover:border-primary/30!"}
                `}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="text-xs border border-border! bg-surface! text-text-secondary! rounded-lg px-2 py-1.5 outline-none! focus:border-primary/50!"
            >
              {MODULES.map((m) => <option key={m}>{m}</option>)}
            </select>
            <div className="flex rounded-lg border border-border! overflow-hidden">
              {[{ icon: <AppstoreOutlined />, v: "grid" }, { icon: <BarsOutlined />, v: "list" }].map(({ icon, v }) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-3 py-1.5 text-sm! transition-colors ${view === v ? "bg-primary! text-white!" : "bg-surface! text-text-muted! hover:bg-surface-alt!"}`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Questions */}
        {view === "grid" ? (
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {filtered.map((q) => {
              const meta = statusMeta[q.status];
              return (
                <button
                  key={q.id}
                  onClick={() => setActive(active === q.id ? null : q.id)}
                  className={`relative aspect-square rounded-xl text-sm! font-bold flex flex-col items-center justify-center gap-1 transition-all
                    ${meta.color} ${meta.text}
                    ${active === q.id ? "ring-2 ring-primary! ring-offset-2! scale-105" : "hover:scale-105"}
                  `}
                >
                  <span>{q.id}</span>
                  {(q.status === "bookmarked" || q.status === "bookmarked-answered") && (
                    <FlagFilled className="text-[8px] opacity-80" />
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((q) => {
              const meta = statusMeta[q.status];
              return (
                <div
                  key={q.id}
                  onClick={() => setActive(active === q.id ? null : q.id)}
                  className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-colors
                    ${active === q.id ? "border-primary! bg-primary/5!" : "border-border! bg-surface! hover:border-primary/30!"}
                  `}
                >
                  <span className={`w-8 h-8 rounded-lg ${meta.color} ${meta.text} flex items-center justify-center text-xs! font-bold shrink-0`}>
                    {q.id}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text! truncate">{q.text}</p>
                    <p className="text-xs text-text-muted!">{q.module}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`w-2 h-2 rounded-full ${meta.dot}`} />
                    <span className="text-xs text-text-muted! hidden sm:block">{meta.label}</span>
                    {(q.status === "bookmarked" || q.status === "bookmarked-answered") && (
                      <FlagFilled className="text-warning! text-xs!" />
                    )}
                  </div>
                  <RightOutlined className="text-text-muted! text-xs!" />
                </div>
              );
            })}
          </div>
        )}

        {/* Active question preview */}
        {active && (() => {
          const q = QUESTIONS.find((q) => q.id === active);
          return (
            <div className="bg-surface! rounded-2xl border border-primary/30! p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-primary! bg-primary/10! px-2 py-1 rounded-lg">
                  Q{q.id} · {q.module}
                </span>
                <button
                  onClick={() => navigate(`/student/exams/${examId}/take`)}
                  className="px-3 py-1.5 rounded-lg bg-primary! text-white! text-xs! font-semibold flex items-center gap-1"
                >
                  Go to Question <RightOutlined />
                </button>
              </div>
              <p className="text-sm text-text! leading-relaxed">{q.text}</p>
            </div>
          );
        })()}

        {/* Footer action */}
        <div className="flex justify-center pt-2 gap-3 flex-wrap">
          <button
            onClick={() => navigate(`/student/exams/${examId}/results`)}
            className="px-8 py-3 rounded-xl border border-border! text-text-secondary! hover:bg-surface-alt! font-semibold text-sm! transition-colors"
          >
            View Results
          </button>
          <button
            onClick={() => navigate(`/student/exams/${examId}/take`)}
            className="px-8 py-3 rounded-xl bg-primary! hover:bg-primary-hover! text-white! font-semibold text-sm! transition-colors shadow-lg! shadow-(--color-primary)/20!"
          >
            Return to Exam
          </button>
        </div>
      </div>
    </div>
  );
}


