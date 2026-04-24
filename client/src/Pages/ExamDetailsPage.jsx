import { useState, useEffect } from "react";
import {
  EditOutlined, SendOutlined, TeamOutlined, BarChartOutlined,
  ClockCircleOutlined, FileTextOutlined, EyeOutlined,
  CheckCircleOutlined, CalendarOutlined, SettingOutlined,
  RiseOutlined, FallOutlined, TrophyOutlined, DownloadOutlined,
  RightOutlined, LoadingOutlined,
} from "@ant-design/icons";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../lib/api";

const STATUS_CONFIG = {
  upcoming:  { label: "Upcoming",  bg: "rgba(56,189,248,0.1)",  text: "#38BDF8", dot: "#38BDF8" },
  active:    { label: "Live",      bg: "rgba(16,185,129,0.1)", text: "#10B981", dot: "#10B981" },
  completed: { label: "Completed", bg: "rgba(16,185,129,0.1)", text: "#10B981", dot: "#10B981" },
  draft:     { label: "Draft",     bg: "rgba(100,116,139,0.1)",text: "#64748B", dot: "#64748B" },
};

const scoreColor = (s) =>
  s >= 90 ? "var(--color-success)"
  : s >= 80 ? "var(--color-info)"
  : s >= 70 ? "var(--color-accent)"
  : s >= 60 ? "var(--color-warning)"
  : "var(--color-error)";

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—";

const StatusBadge = ({ status }) => {
  const c = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider" style={{ background: c.bg, color: c.text }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.dot }} />{c.label}
    </span>
  );
};

const StatCard = ({ icon, label, value, color, sub }) => (
  <div className="relative overflow-hidden rounded-2xl p-5 border border-border bg-surface group hover:-translate-y-0.5 transition-all duration-300">
    <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10 blur-2xl group-hover:opacity-20 transition-opacity duration-300" style={{ background: color }} />
    <div className="flex items-start justify-between mb-3">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm" style={{ background: `${color}20`, color }}>{icon}</div>
    </div>
    <p className="text-3xl font-black text-text leading-none mb-1">{value}</p>
    <p className="text-xs font-medium text-text-muted uppercase tracking-widest">{label}</p>
    {sub && <p className="text-[10px] text-text-muted mt-1.5 opacity-70">{sub}</p>}
    <div className="absolute bottom-0 left-0 h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${color}60, transparent)` }} />
  </div>
);

const DIST_BANDS = [
  { range: "90–100", label: "Excellent", min: 90, max: 101, color: "var(--color-success)" },
  { range: "80–89",  label: "Good",      min: 80, max: 90,  color: "var(--color-info)" },
  { range: "70–79",  label: "Average",   min: 70, max: 80,  color: "var(--color-accent)" },
  { range: "60–69",  label: "Below avg", min: 60, max: 70,  color: "var(--color-warning)" },
  { range: "< 60",   label: "Failing",   min: 0,  max: 60,  color: "var(--color-error)" },
];

export default function ExamDetailsPage() {
  const navigate = useNavigate();
  const { examId } = useParams();
  const [tab, setTab] = useState("overview");
  const [exam, setExam] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/exams/${examId}`),
      api.get(`/exams/${examId}/submissions`),
    ]).then(([eRes, sRes]) => {
      setExam(eRes.data);
      setSubmissions(sRes.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [examId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <LoadingOutlined style={{ fontSize: 32, color: "var(--color-primary)" }} />
      </div>
    );
  }
  if (!exam) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <p className="text-text-muted text-sm">Exam not found.</p>
      </div>
    );
  }

  const stats = exam.stats || {};
  const scores = submissions.map((s) => s.score).filter((s) => s != null);
  const dist = DIST_BANDS.map((b) => {
    const count = scores.filter((s) => s >= b.min && s < b.max).length;
    return { ...b, count, pct: scores.length ? count / scores.length : 0 };
  });

  return (
    <div className="min-h-screen bg-bg font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <nav className="text-sm my-3" aria-label="Breadcrumb">
          <ol className="list-none p-0 inline-flex items-center gap-1.5">
            <li><Link to="/teacher/exams" className="text-text-secondary hover:text-primary font-medium transition-colors">Exams</Link></li>
            <li><RightOutlined style={{ fontSize: 10 }} /></li>
            <li className="text-primary font-medium truncate max-w-56">{exam.title}</li>
          </ol>
        </nav>

        {/* Hero */}
        <div className="mb-8">
          <div className="relative rounded-2xl overflow-hidden border border-border bg-surface">
            <div className="absolute inset-0 opacity-5" style={{ background: "radial-gradient(ellipse at top left, var(--color-primary) 0%, transparent 60%)" }} />
            <div className="absolute top-0 left-0 right-0 h-1" style={{ background: "linear-gradient(90deg, var(--color-primary), var(--color-accent), var(--color-ai))" }} />
            <div className="relative flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg" style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-accent))" }}>
                  <FileTextOutlined style={{ fontSize: 22, color: "#fff" }} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h1 className="text-xl font-black text-text leading-tight">{exam.title}</h1>
                    <StatusBadge status={exam.status} />
                  </div>
                  <p className="text-sm text-text-muted">{(exam.courseNames || exam.courseIds || []).join(", ")}</p>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-text-muted">
                    <span className="flex items-center gap-1"><CalendarOutlined /> {fmtDate(exam.scheduledAt)}</span>
                    <span className="flex items-center gap-1"><ClockCircleOutlined /> {exam.durationMinutes} min</span>
                    <span className="flex items-center gap-1"><FileTextOutlined /> {exam.totalQuestions} questions</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 sm:flex-nowrap">
                <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-border text-text-secondary hover:bg-surface-alt transition">
                  <DownloadOutlined /> Export
                </button>
                <button onClick={() => navigate(`/teacher/exams/${examId}/edit`)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-border text-text hover:bg-surface-alt transition">
                  <EditOutlined /> Edit
                </button>
                <button onClick={() => navigate(`/teacher/exams/${examId}/submissions`)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary-hover transition shadow-lg shadow-(--color-primary)/20 hover:-translate-y-0.5">
                  <SendOutlined /> View Submissions
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<TeamOutlined />}       label="Submissions" value={stats.submitted ?? 0}                       color="var(--color-primary)" sub="Graded attempts" />
          <StatCard icon={<BarChartOutlined />}   label="Avg. Score"  value={scores.length ? `${stats.avg}%` : "—"}      color="var(--color-success)" sub="Class average" />
          <StatCard icon={<TrophyOutlined />}     label="Highest"     value={scores.length ? `${stats.highest}%` : "—"}  color="var(--color-warning)" sub="Top score" />
          <StatCard icon={<CheckCircleOutlined />} label="Pass Rate"  value={scores.length ? `${stats.passRate}%` : "—"} color="var(--color-info)"    sub={`Passing ≥ ${exam.passingScore}%`} />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 bg-surface border border-border rounded-xl w-fit">
          {["overview", "submissions"].map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all duration-200 ${tab === t ? "bg-primary text-white shadow-sm" : "text-text-muted hover:text-text"}`}>{t}</button>
          ))}
        </div>

        {tab === "overview" && (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="rounded-2xl border border-border bg-surface overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
                <SettingOutlined style={{ color: "var(--color-text-muted)", fontSize: 13 }} />
                <h3 className="font-bold text-sm text-text">Exam Info</h3>
              </div>
              <div className="divide-y divide-border">
                {[
                  { label: "Status",        value: <StatusBadge status={exam.status} /> },
                  { label: "Course(s)",     value: (exam.courseNames || exam.courseIds || []).join(", ") || "—" },
                  { label: "Date",          value: fmtDate(exam.scheduledAt) },
                  { label: "Duration",      value: `${exam.durationMinutes} minutes` },
                  { label: "Questions",     value: exam.totalQuestions },
                  { label: "Passing Score", value: `${exam.passingScore}%` },
                  { label: "Show Answers",  value: exam.showAnswers ? <span className="text-xs font-bold text-success">Enabled</span> : "Disabled" },
                  { label: "Created",       value: fmtDate(exam.createdAt) },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between px-5 py-2.5 hover:bg-surface-alt transition-colors">
                    <span className="text-xs text-text-muted">{label}</span>
                    <span className="text-xs font-semibold text-text">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-surface overflow-hidden xl:col-span-2">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <BarChartOutlined style={{ color: "var(--color-text-muted)", fontSize: 13 }} />
                  <h3 className="font-bold text-sm text-text">Score Distribution</h3>
                </div>
                <span className="text-[10px] text-text-muted">{submissions.length} attempts</span>
              </div>
              {scores.length === 0 ? (
                <div className="p-10 text-center text-xs text-text-muted">No submissions yet</div>
              ) : (
                <>
                  <div className="p-5 space-y-4">
                    {dist.map(({ range, label, count, color, pct }) => (
                      <div key={range}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold" style={{ color }}>{range}</span>
                            <span className="text-[10px] text-text-muted">{label}</span>
                          </div>
                          <span className="text-xs font-bold text-text-muted">{count} <span className="font-normal opacity-60">({Math.round(pct * 100)}%)</span></span>
                        </div>
                        <div className="h-7 rounded-lg overflow-hidden bg-surface-alt">
                          <div className="h-full rounded-lg flex items-center px-2.5 text-white text-xs font-bold transition-all duration-700" style={{ width: `${Math.max(pct * 100, count > 0 ? 8 : 0)}%`, background: color, minWidth: count > 0 ? 36 : 0 }}>
                            {count > 0 ? count : ""}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mx-5 mb-5 p-4 rounded-xl bg-surface-alt border border-border flex flex-wrap gap-4 justify-between">
                    {[
                      { label: "Average",   val: `${stats.avg}%`,      color: "var(--color-info)" },
                      { label: "Highest",   val: `${stats.highest}%`,  color: "var(--color-success)" },
                      { label: "Lowest",    val: `${stats.lowest}%`,   color: "var(--color-error)" },
                      { label: "Pass Rate", val: `${stats.passRate}%`, color: "var(--color-warning)" },
                    ].map(({ label, val, color }) => (
                      <div key={label} className="flex flex-col items-center gap-0.5">
                        <span className="text-lg font-black" style={{ color }}>{val}</span>
                        <span className="text-[10px] text-text-muted uppercase tracking-wider">{label}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
              <div className="px-5 pb-5">
                <button onClick={() => navigate(`/teacher/exams/${examId}/submissions`)} className="flex items-center gap-2 text-xs font-bold text-primary hover:opacity-70 transition">
                  <EyeOutlined /> View All Submissions
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === "submissions" && (
          <div className="rounded-2xl border border-border bg-surface overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <TeamOutlined style={{ color: "var(--color-text-muted)", fontSize: 13 }} />
                <h3 className="font-bold text-sm text-text">Student Submissions</h3>
                <span className="px-2 py-0.5 rounded-full bg-surface-alt text-[10px] font-bold text-text-muted">{submissions.length}</span>
              </div>
            </div>
            {submissions.length === 0 ? (
              <p className="text-center text-xs text-text-muted py-10">No submissions yet.</p>
            ) : (
              <div className="divide-y divide-border">
                {submissions.map((s, i) => (
                  <div key={s._id} onClick={() => navigate(`/teacher/exams/${examId}/submissions/${s._id}`)} className="flex items-center gap-4 px-5 py-3 hover:bg-surface-alt transition-colors group cursor-pointer">
                    <span className="text-xs font-bold text-text-muted w-5 text-center">{i + 1}</span>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0" style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-ai))" }}>
                      {(s.studentId?.username || "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-text truncate">{s.studentId?.username || "Student"}</p>
                      <p className="text-xs text-text-muted">{s.timeTaken || "—"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="hidden sm:flex w-28 h-1.5 rounded-full bg-surface-alt overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${s.score || 0}%`, background: scoreColor(s.score) }} />
                      </div>
                      <span className="text-sm font-black w-10 text-right" style={{ color: scoreColor(s.score) }}>{s.score != null ? `${s.score}%` : "—"}</span>
                    </div>
                    <EyeOutlined style={{ color: "var(--color-text-muted)", fontSize: 13 }} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
