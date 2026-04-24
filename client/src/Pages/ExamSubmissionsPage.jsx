import { useState, useEffect } from "react";
import api from "../lib/api";
import {
  SearchOutlined,
  DownloadOutlined,
  EyeOutlined,
  BookOutlined,
  BellOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  BarChartOutlined,
  TrophyOutlined,
  RiseOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  UserOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

/* ─── Mock Data ─────────────────────────────────────────── */
const SUBMISSIONS = [
  { id: 1,  student: "Alice Martin",    avatar: "AM", score: 94,   status: "completed",   time: "82 min", submitted: "Apr 18, 2025 – 09:12 AM" },
  { id: 2,  student: "James Patel",     avatar: "JP", score: 87,   status: "completed",   time: "78 min", submitted: "Apr 18, 2025 – 09:24 AM" },
  { id: 3,  student: "Lena Kowalski",   avatar: "LK", score: 73,   status: "completed",   time: "90 min", submitted: "Apr 18, 2025 – 09:31 AM" },
  { id: 4,  student: "Omar Farooq",     avatar: "OF", score: 65,   status: "completed",   time: "85 min", submitted: "Apr 18, 2025 – 09:44 AM" },
  { id: 5,  student: "Zara Nguyen",     avatar: "ZN", score: 55,   status: "completed",   time: "70 min", submitted: "Apr 18, 2025 – 10:01 AM" },
  { id: 6,  student: "Ben Torres",      avatar: "BT", score: 91,   status: "completed",   time: "60 min", submitted: "Apr 18, 2025 – 10:08 AM" },
  { id: 7,  student: "Maya Lin",        avatar: "ML", score: 82,   status: "completed",   time: "88 min", submitted: "Apr 18, 2025 – 10:14 AM" },
  { id: 8,  student: "Ethan Brooks",    avatar: "EB", score: 78,   status: "completed",   time: "75 min", submitted: "Apr 18, 2025 – 10:22 AM" },
  { id: 9,  student: "Sofia Reyes",     avatar: "SR", score: 96,   status: "completed",   time: "66 min", submitted: "Apr 18, 2025 – 10:29 AM" },
  { id: 10, student: "Lucas Hoffman",   avatar: "LH", score: 61,   status: "completed",   time: "89 min", submitted: "Apr 18, 2025 – 10:38 AM" },
  { id: 11, student: "Priya Sharma",    avatar: "PS", score: null, status: "in_progress", time: "—",      submitted: "—" },
  { id: 12, student: "Carlos Mendez",   avatar: "CM", score: null, status: "in_progress", time: "—",      submitted: "—" },
  { id: 13, student: "Hannah Cole",     avatar: "HC", score: 88,   status: "completed",   time: "77 min", submitted: "Apr 18, 2025 – 10:55 AM" },
  { id: 14, student: "David Kim",       avatar: "DK", score: 44,   status: "completed",   time: "91 min", submitted: "Apr 18, 2025 – 11:02 AM" },
];

/* ─── Helpers ───────────────────────────────────────────── */
const scoreColor = (s) =>
  s === null || s === undefined ? "var(--color-text-muted)"
  : s >= 90 ? "var(--color-success)"
  : s >= 70 ? "var(--color-info)"
  : s >= 60 ? "var(--color-warning)"
  : "var(--color-error)";

const scoreGrade = (s) =>
  s === null ? "—"
  : s >= 90 ? "A" : s >= 80 ? "B" : s >= 70 ? "C" : s >= 60 ? "D" : "F";

const STATUS_CONFIG = {
  completed:   { label: "Completed",   dot: "var(--color-success)", bg: "rgba(16,185,129,0.1)",  text: "var(--color-success)"  },
  in_progress: { label: "In Progress", dot: "var(--color-warning)", bg: "rgba(245,158,11,0.1)",  text: "var(--color-warning)"  },
};

const StatusBadge = ({ status }) => {
  const c = STATUS_CONFIG[status] || STATUS_CONFIG.completed;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
      style={{ background: c.bg, color: c.text }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.dot }} />
      {c.label}
    </span>
  );
};

const avatarGradients = [
  ["#1E3A8A","#0EA5E9"], ["#7C3AED","#A78BFA"], ["#059669","#34D399"],
  ["#D97706","#FCD34D"], ["#DC2626","#F87171"], ["#0369A1","#38BDF8"],
  ["#7C3AED","#EC4899"], ["#065F46","#6EE7B7"],
];

/* ─── Stat mini-card ─────────────────────────────────────── */
const MiniStat = ({ icon, label, value, color, sub }) => (
  <div className="relative overflow-hidden rounded-2xl p-4 border border-border bg-surface group hover:-translate-y-0.5 transition-all duration-300">
    <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full opacity-10 blur-xl group-hover:opacity-20 transition-opacity" style={{ background: color }} />
    <div className="flex items-center justify-between mb-2">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm" style={{ background: `${color}20`, color }}>{icon}</div>
    </div>
    <p className="text-2xl font-black text-text leading-none">{value}</p>
    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">{label}</p>
    {sub && <p className="text-[10px] text-text-muted mt-0.5 opacity-70">{sub}</p>}
    <div className="absolute bottom-0 left-0 h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${color}60, transparent)` }} />
  </div>
);

/* ─── Main ───────────────────────────────────────────────── */
export default function ExamSubmissionsPage() {
  const navigate = useNavigate();
  const { examId } = useParams();
  const resolvedExamId = examId;
  const [rawSubmissions, setRawSubmissions] = useState([]);
  const [examTitle, setExamTitle] = useState("Exam");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortKey, setSortKey] = useState("score");
  const [sortDir, setSortDir] = useState("desc");
  const [hoveredRow, setHoveredRow] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get(`/exams/${resolvedExamId}`),
      api.get(`/exams/${resolvedExamId}/submissions`),
    ]).then(([eRes, sRes]) => {
      setExamTitle(eRes.data.title || "Exam");
      // Normalize API data to shape expected by render
      setRawSubmissions((sRes.data || []).map((s, i) => ({
        id: s._id,
        student: s.studentId?.username || `Student ${i + 1}`,
        avatar: (s.studentId?.username || "S").slice(0, 2).toUpperCase(),
        score: s.score ?? null,
        status: s.status === "graded" ? "completed" : s.status,
        time: s.timeTaken || "—",
        submitted: s.submittedAt ? new Date(s.submittedAt).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—",
      })));
    }).catch(() => {}).finally(() => setLoading(false));
  }, [resolvedExamId]);

  const SUBMISSIONS = rawSubmissions;

  /* ── Stats ── */
  const scored = SUBMISSIONS.filter(s => s.score !== null);
  const avg = scored.length ? Math.round(scored.reduce((a, b) => a + b.score, 0) / scored.length) : 0;
  const highest = scored.length ? Math.max(...scored.map(s => s.score)) : 0;
  const passing = scored.filter(s => s.score >= 60).length;
  const completed = SUBMISSIONS.filter(s => s.status === "completed").length;

  /* ── Sort toggle ── */
  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  /* ── Filtered + sorted ── */
  const rows = SUBMISSIONS
    .filter(s => filter === "all" || s.status === filter)
    .filter(s => s.student.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      let va = a[sortKey], vb = b[sortKey];
      if (sortKey === "score") { va = va ?? -1; vb = vb ?? -1; }
      if (sortKey === "student") { va = va.toLowerCase(); vb = vb.toLowerCase(); }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  const SortIcon = ({ col }) => (
    <span className="ml-1 opacity-50 text-[10px]">
      {sortKey === col ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
    </span>
  );

  return (
    <div className="min-h-screen bg-bg font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ── Page header ── */}
        <div className="mb-8">
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
                  to={`/teacher/exams/${resolvedExamId}`}
                  className="text-text-secondary hover:text-primary font-medium transition-colors duration-150"
                >
                  Exam Details
                </Link>
              </li>
              <li>
                <RightOutlined className="text-text-muted!" style={{ fontSize: 10 }} />
              </li>
              <li className="text-primary font-medium">
                Submissions
              </li>
            </ol>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-text leading-tight">Submissions</h1>
              <p className="text-sm text-text-muted mt-1">{examTitle} · {SUBMISSIONS.length} students enrolled</p>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border border-border text-text-secondary hover:bg-surface-alt transition">
                <DownloadOutlined /> Export CSV
              </button>
              <button
                onClick={() => navigate(`/teacher/exams/${resolvedExamId}`)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary-hover transition shadow-lg shadow-(--color-primary)/20 hover:-translate-y-0.5"
              >
                <RiseOutlined /> Release Results
              </button>
            </div>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          <MiniStat icon={<TeamOutlined />}         label="Submitted"   value={`${completed}/${SUBMISSIONS.length}`} color="var(--color-primary)"  sub={`${SUBMISSIONS.length - completed} pending`} />
          <MiniStat icon={<BarChartOutlined />}     label="Class Avg"   value={`${avg}%`}                            color="var(--color-success)"  sub="This exam" />
          <MiniStat icon={<TrophyOutlined />}       label="Top Score"   value={`${highest}%`}                       color="var(--color-warning)"  sub={scored.find(s => s.score === highest)?.student} />
          <MiniStat icon={<CheckCircleOutlined />}  label="Pass Rate"   value={`${Math.round((passing / scored.length) * 100)}%`} color="var(--color-info)" sub={`${passing} of ${scored.length} passed`} />
        </div>

        {/* ── Score distribution mini-bar ── */}
        <div className="mb-6 rounded-2xl border border-border bg-surface p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Score Distribution</p>
            <p className="text-[10px] text-text-muted">{scored.length} graded</p>
          </div>
          <div className="flex h-6 rounded-xl overflow-hidden gap-0.5">
            {[
              { min: 90, color: "var(--color-success)",  label: "A" },
              { min: 80, color: "var(--color-info)",     label: "B" },
              { min: 70, color: "var(--color-accent)",   label: "C" },
              { min: 60, color: "var(--color-warning)",  label: "D" },
              { min: 0,  color: "var(--color-error)",    label: "F" },
            ].map(({ min, color, label }, idx, arr) => {
              const max = idx === 0 ? 101 : arr[idx - 1].min;
              const cnt = scored.filter(s => s.score >= min && s.score < max).length;
              const pct = scored.length ? (cnt / scored.length) * 100 : 0;
              if (!pct) return null;
              return (
                <div key={label} className="flex items-center justify-center text-[10px] font-black text-white rounded-sm transition-all hover:opacity-80 cursor-default"
                  style={{ width: `${pct}%`, background: color, minWidth: pct > 0 ? 20 : 0 }}
                  title={`${label}: ${cnt} student${cnt !== 1 ? "s" : ""}`}>
                  {pct > 8 ? `${label} (${cnt})` : cnt > 0 ? cnt : ""}
                </div>
              );
            })}
          </div>
          <div className="flex gap-4 mt-2">
            {[
              { label: "A (90+)", color: "var(--color-success)" },
              { label: "B (80–89)", color: "var(--color-info)" },
              { label: "C (70–79)", color: "var(--color-accent)" },
              { label: "D (60–69)", color: "var(--color-warning)" },
              { label: "F (<60)", color: "var(--color-error)" },
            ].map(({ label, color }) => (
              <div key={label} className="flex items-center gap-1 text-[10px] text-text-muted">
                <span className="w-2 h-2 rounded-sm" style={{ background: color }} />{label}
              </div>
            ))}
          </div>
        </div>

        {/* ── Filters ── */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <SearchOutlined style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)", fontSize: 12, pointerEvents: "none" }} />
              <input
                placeholder="Search student…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 pr-3 py-2 rounded-xl text-sm border border-border outline-none bg-surface text-text placeholder-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 transition w-52"
              />
            </div>
            {/* Status filter pills */}
            <div className="flex gap-1 p-1 bg-surface border border-border rounded-xl">
              {[
                { id: "all",         label: "All",         count: SUBMISSIONS.length },
                { id: "completed",   label: "Completed",   count: completed },
                { id: "in_progress", label: "In Progress", count: SUBMISSIONS.length - completed },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === f.id ? "bg-primary text-white" : "text-text-muted hover:text-text"}`}
                >
                  {f.label}
                  <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${filter === f.id ? "bg-white/20" : "bg-surface-alt"}`}>{f.count}</span>
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs text-text-muted">
            Showing <strong className="text-text">{rows.length}</strong> result{rows.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* ── Table ── */}
        <div className="rounded-2xl border border-border bg-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-alt">
                  <th className="px-5 py-3 text-left">
                    <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">#</span>
                  </th>
                  {[
                    { key: "student", label: "Student" },
                    { key: "score",   label: "Score" },
                    null,
                    { key: "time",    label: "Time" },
                    { key: "status",  label: "Status" },
                    { key: "submitted", label: "Submitted At" },
                    null,
                  ].map((col, i) => col ? (
                    <th key={col.key} className="px-4 py-3 text-left">
                      <button
                        onClick={() => toggleSort(col.key)}
                        className="flex items-center text-[10px] font-black text-text-muted uppercase tracking-widest hover:text-text transition"
                      >
                        {col.label}<SortIcon col={col.key} />
                      </button>
                    </th>
                  ) : (
                    <th key={i} className="px-4 py-3 text-left">
                      <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">
                        {i === 3 ? "Grade" : "Actions"}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((s, i) => {
                  const [g1, g2] = avatarGradients[i % avatarGradients.length];
                  const isHovered = hoveredRow === s.id;
                  return (
                    <tr
                      key={s.id}
                      onMouseEnter={() => setHoveredRow(s.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                      className="transition-colors duration-150"
                      style={{ background: isHovered ? "var(--color-surface-alt)" : "transparent" }}
                    >
                      {/* # */}
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-black text-text-muted">{i + 1}</span>
                      </td>

                      {/* Student */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black text-white shrink-0 shadow-sm"
                            style={{ background: `linear-gradient(135deg, ${g1}, ${g2})` }}>
                            {s.avatar}
                          </div>
                          <div>
                            <p className="font-bold text-text text-sm leading-tight">{s.student}</p>
                            <p className="text-[10px] text-text-muted">ID #{String(s.id).padStart(4, "0")}</p>
                          </div>
                        </div>
                      </td>

                      {/* Score */}
                      <td className="px-4 py-3.5">
                        <span className="text-sm font-black" style={{ color: scoreColor(s.score) }}>
                          {s.score !== null && s.score !== undefined ? `${s.score}/100` : "—"}
                        </span>
                      </td>

                      {/* Grade + bar */}
                      <td className="px-4 py-3.5">
                        {s.score !== null && s.score !== undefined ? (
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black text-white"
                              style={{ background: scoreColor(s.score) }}>
                              {scoreGrade(s.score)}
                            </span>
                            <div className="w-20 h-1.5 rounded-full bg-surface-alt overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-700"
                                style={{ width: `${s.score}%`, background: scoreColor(s.score) }} />
                            </div>
                            <span className="text-xs font-bold" style={{ color: scoreColor(s.score) }}>{s.score}%</span>
                          </div>
                        ) : (
                          <span className="text-xs text-text-muted">—</span>
                        )}
                      </td>

                      {/* Time */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                          <ClockCircleOutlined style={{ fontSize: 11, color: "var(--color-text-muted)" }} />
                          {s.time}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <StatusBadge status={s.status} />
                      </td>

                      {/* Submitted at */}
                      <td className="px-4 py-3.5">
                        <span className="text-xs text-text-muted">{s.submitted}</span>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => navigate(`/teacher/exams/${resolvedExamId}/submissions/${s.id}`)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${s.status === "completed" ? "bg-primary/10 text-primary hover:bg-primary hover:text-white" : "bg-surface-alt text-text-muted cursor-not-allowed opacity-50"}`}
                          disabled={s.status !== "completed"}
                        >
                          <EyeOutlined /> Review
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {rows.length === 0 && (
            <div className="flex flex-col items-center py-16 text-center">
              <UserOutlined style={{ fontSize: 28, color: "var(--color-text-muted)" }} />
              <p className="text-sm font-semibold text-text-muted mt-3">No submissions found</p>
              <p className="text-xs text-text-muted opacity-60 mt-1">Try adjusting your search or filter</p>
            </div>
          )}

          {/* Table footer */}
          {rows.length > 0 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-surface-alt">
              <p className="text-xs text-text-muted">
                {rows.length} student{rows.length !== 1 ? "s" : ""}
              </p>
              <div className="flex items-center gap-3 text-xs text-text-muted">
                <span>Avg: <strong style={{ color: scoreColor(avg) }}>{avg}%</strong></span>
                <span>·</span>
                <span>Pass rate: <strong style={{ color: "var(--color-success)" }}>{Math.round((passing / scored.length) * 100)}%</strong></span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}