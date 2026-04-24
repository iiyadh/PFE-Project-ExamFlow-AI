import { useState, useMemo, useEffect } from "react";
import {
  CalendarOutlined, PlusOutlined, FileTextOutlined,
  ClockCircleOutlined, CheckCircleOutlined, TeamOutlined,
  LeftOutlined, RightOutlined, EditOutlined, EyeOutlined,
  TrophyOutlined, FireOutlined, SearchOutlined, ArrowRightOutlined,
  DeleteOutlined, SendOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import api from "../lib/api";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const STATUS_CONFIG = {
  upcoming:  { label: "Upcoming",  bg: "bg-blue-500/10",    text: "text-blue-400",    dot: "#38BDF8" },
  active:    { label: "Live",      bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "#10B981" },
  completed: { label: "Completed", bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "#10B981" },
  draft:     { label: "Draft",     bg: "bg-slate-500/10",   text: "text-slate-400",   dot: "#64748B" },
  archived:  { label: "Archived",  bg: "bg-slate-500/10",   text: "text-slate-400",   dot: "#64748B" },
};

const dateKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const fmtDate = (d) => {
  if (!d) return "—";
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
};

const StatusBadge = ({ status }) => {
  const c = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${c.bg} ${c.text}`}>
      <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: c.dot }} />
      {c.label}
    </span>
  );
};

const StatCard = ({ icon, label, value, color, sub }) => (
  <div className="relative overflow-hidden rounded-2xl p-5 border border-border bg-surface group hover:-translate-y-0.5 transition-all duration-300">
    <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-10 blur-2xl transition-opacity duration-300 group-hover:opacity-25" style={{ background: color }} />
    <div className="flex items-start justify-between">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-medium text-text-muted uppercase tracking-widest">{label}</p>
        <p className="text-3xl font-black text-text leading-none">{value}</p>
        {sub && <p className="text-xs text-text-muted mt-1">{sub}</p>}
      </div>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-base" style={{ background: `${color}20`, color }}>{icon}</div>
    </div>
    <div className="absolute bottom-0 left-0 h-0.5 w-full opacity-40" style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />
  </div>
);

export default function ExamCalendarPage() {
  const navigate = useNavigate();
  const today = useMemo(() => new Date(), []);

  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchQ, setSearchQ] = useState("");

  useEffect(() => {
    api.get("/exams")
      .then((r) => setExams(r.data))
      .catch(() => setExams([]))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this exam?")) return;
    await api.delete(`/exams/${id}`);
    setExams((prev) => prev.filter((ex) => ex._id !== id));
  };

  const handlePublish = async (id, e) => {
    e.stopPropagation();
    try {
      const { data } = await api.post(`/exams/${id}/publish`);
      setExams((prev) => prev.map((ex) => (ex._id === id ? { ...ex, ...data } : ex)));
    } catch (err) {
      alert(err.response?.data?.message || "Publish failed");
    }
  };

  /* Map exams by date string */
  const examsByDate = useMemo(() => {
    const map = {};
    exams.forEach((ex) => {
      const key = fmtDate(ex.scheduledAt);
      if (!map[key]) map[key] = [];
      map[key].push(ex);
    });
    return map;
  }, [exams]);

  /* 42-cell calendar grid */
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthTotal = new Date(year, month, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDayOfWeek; i++)
      days.push({ date: new Date(year, month - 1, prevMonthTotal - firstDayOfWeek + i + 1), isCurrentMonth: false });
    for (let d = 1; d <= daysInMonth; d++)
      days.push({ date: new Date(year, month, d), isCurrentMonth: true });
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++)
      days.push({ date: new Date(year, month + 1, d), isCurrentMonth: false });
    return days;
  }, [currentMonth]);

  const formatMonthYear = (d) => d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const isSameDay = (a, b) =>
    a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();

  const prevMonth = () => setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));
  const goToToday = () => {
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(new Date(today));
  };

  const selectedExams = selectedDate ? (examsByDate[dateKey(selectedDate)] || []) : [];
  const nextExam = exams.filter((e) => e.status === "upcoming").sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))[0];

  const filteredExams = exams.filter((e) => {
    const matchFilter = filter === "all" || e.status === filter;
    const matchSearch =
      e.title.toLowerCase().includes(searchQ.toLowerCase()) ||
      (e.courseIds || []).join(" ").toLowerCase().includes(searchQ.toLowerCase());
    return matchFilter && matchSearch;
  });

  const stats = useMemo(() => ({
    total: exams.length,
    upcoming: exams.filter((e) => ["upcoming", "active"].includes(e.status)).length,
    completed: exams.filter((e) => e.status === "completed").length,
    submissions: exams.reduce((s, e) => s + (e.submitted || 0), 0),
  }), [exams]);

  return (
    <div className="min-h-screen bg-bg font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="text-sm my-3" aria-label="Breadcrumb">
          <ol className="list-none p-0 inline-flex items-center gap-1.5">
            <li><Link to="/teacher/exams" className="text-text-secondary hover:text-primary font-medium transition-colors duration-150">Exams</Link></li>
            <li><RightOutlined style={{ fontSize: 10 }} /></li>
            <li className="text-primary font-medium">Calendar</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-primary uppercase tracking-widest">{formatMonthYear(currentMonth)}</span>
            </div>
            <h1 className="text-3xl font-black text-text leading-tight tracking-tight">Exam Calendar</h1>
            <p className="text-sm text-text-muted mt-1">Manage, schedule, and track all your exams in one place.</p>
          </div>
          <button
            onClick={() => navigate("/teacher/exams/create")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-lg shadow-(--color-primary)/20 hover:bg-primary-hover transition-all duration-200 hover:-translate-y-0.5"
          >
            <PlusOutlined /> New Exam
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<FileTextOutlined />}    label="Total Exams"    value={stats.total}       color="var(--color-primary)" sub="All time" />
          <StatCard icon={<ClockCircleOutlined />} label="Upcoming"       value={stats.upcoming}    color="var(--color-info)"    sub="Scheduled" />
          <StatCard icon={<CheckCircleOutlined />} label="Completed"      value={stats.completed}   color="var(--color-success)" sub={`${stats.submissions} submissions`} />
          <StatCard icon={<TeamOutlined />}        label="Submissions"    value={stats.submissions} color="var(--color-ai)"      sub="Across all exams" />
        </div>

        {/* Calendar */}
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-border bg-surface overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <CalendarOutlined style={{ color: "var(--color-primary)", fontSize: 16 }} />
                <h2 className="font-bold text-text">{formatMonthYear(currentMonth)}</h2>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={goToToday} className="px-3 py-1 rounded-lg text-xs font-bold bg-primary/10 text-primary hover:bg-primary/20 transition">Today</button>
                <button onClick={prevMonth} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-surface-alt transition text-text-secondary"><LeftOutlined style={{ fontSize: 11 }} /></button>
                <button onClick={nextMonth} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-surface-alt transition text-text-secondary"><RightOutlined style={{ fontSize: 11 }} /></button>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-7 mb-1">
                {WEEKDAYS.map((d) => (
                  <div key={d} className="text-center text-[10px] font-bold py-2 text-text-muted uppercase tracking-widest">{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((dayData, i) => {
                  const key = dateKey(dayData.date);
                  const dayExams = examsByDate[key] || [];
                  const sel = selectedDate && isSameDay(dayData.date, selectedDate);
                  const tod = isSameDay(dayData.date, today);
                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedDate(dayData.date)}
                      className={`relative flex flex-col items-center justify-start pt-2 pb-1.5 rounded-xl transition-all duration-200 select-none min-h-16
                        ${!dayData.isCurrentMonth ? "opacity-30" : ""}
                        ${sel ? "scale-[1.03] shadow-lg" : "hover:bg-surface-alt"}
                      `}
                      style={{
                        background: sel ? "var(--color-primary)" : "transparent",
                        color: sel ? "#fff" : tod ? "var(--color-accent)" : "var(--color-text)",
                        fontWeight: tod || dayExams.length ? 800 : 400,
                        border: tod && !sel ? "1.5px solid var(--color-accent)" : "1.5px solid transparent",
                        boxShadow: sel ? "0 4px 12px var(--color-primary-40, #6366f140)" : undefined,
                      }}
                    >
                      <span className="text-xs font-bold leading-none">{dayData.date.getDate()}</span>
                      {dayExams.length > 0 && (
                        <div className="flex gap-0.5 mt-1.5 flex-wrap justify-center px-1">
                          {dayExams.slice(0, 3).map((ex, ei) => (
                            <span key={ei} className="w-1.5 h-1.5 rounded-full" style={{ background: sel ? "rgba(255,255,255,0.7)" : STATUS_CONFIG[ex.status]?.dot }} />
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-5 pt-4 border-t border-border flex flex-wrap gap-4">
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                  <div key={key} className="flex items-center gap-1.5 text-xs text-text-muted">
                    <span className="w-2 h-2 rounded-full" style={{ background: cfg.dot }} />{cfg.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Selected day */}
          {selectedDate && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 px-1">
                <CalendarOutlined style={{ color: "var(--color-primary)", fontSize: 14 }} />
                <span className="text-sm font-bold text-text">
                  {selectedDate.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </span>
                {selectedExams.length === 0 && <span className="text-xs text-text-muted ml-1">— No exams scheduled</span>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {selectedExams.length === 0 ? (
                  <div className="sm:col-span-2 xl:col-span-3 rounded-2xl border border-dashed border-border p-8 text-center bg-surface">
                    <CalendarOutlined style={{ fontSize: 20, color: "var(--color-text-muted)" }} />
                    <p className="text-xs font-semibold text-text-muted mt-2">No exams on this day</p>
                  </div>
                ) : (
                  selectedExams.map((exam) => (
                    <div key={exam._id} className="rounded-2xl border border-border bg-surface overflow-hidden">
                      <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${STATUS_CONFIG[exam.status]?.dot}, transparent)` }} />
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-2 mb-4">
                          <div>
                            <h3 className="font-black text-sm text-text leading-tight">{exam.title}</h3>
                            <p className="text-xs text-text-muted mt-0.5">{(exam.courseIds || []).join(", ")}</p>
                          </div>
                          <StatusBadge status={exam.status} />
                        </div>
                        <div className="space-y-2 mb-4">
                          {[
                            { icon: <CalendarOutlined />, label: fmtDate(exam.scheduledAt) },
                            { icon: <ClockCircleOutlined />, label: `${exam.durationMinutes} minutes` },
                            { icon: <FileTextOutlined />, label: `${exam.totalQuestions} questions` },
                            { icon: <TeamOutlined />, label: `${exam.submitted || 0} submissions` },
                          ].map(({ icon, label }, i) => (
                            <div key={i} className="flex items-center gap-2.5 text-xs text-text-secondary">
                              <span className="w-6 h-6 rounded-md bg-surface-alt flex items-center justify-center text-text-muted">{icon}</span>
                              {label}
                            </div>
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <button onClick={() => navigate(`/teacher/exams/${exam._id}`)} className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-primary text-white hover:opacity-90 transition"><EyeOutlined /> View</button>
                          <button onClick={() => navigate(`/teacher/exams/${exam._id}/edit`)} className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-surface-alt text-text hover:opacity-80 transition"><EditOutlined /> Edit</button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {nextExam && (
                  <div className="rounded-2xl border border-info/20 bg-info/5 p-4 flex gap-3 items-start self-start">
                    <FireOutlined style={{ color: "var(--color-info)", fontSize: 14, marginTop: 1 }} />
                    <div>
                      <p className="text-xs font-bold text-text">Upcoming soon</p>
                      <p className="text-xs text-text-muted mt-0.5">{nextExam.title} — {fmtDate(nextExam.scheduledAt)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* All exams table */}
        <div className="mt-6 rounded-2xl border border-border bg-surface overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <TrophyOutlined style={{ color: "var(--color-warning)", fontSize: 14 }} />
              <h2 className="font-bold text-sm text-text">All Exams</h2>
              <span className="ml-1 px-2 py-0.5 rounded-full bg-surface-alt text-[10px] font-bold text-text-muted">{filteredExams.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <SearchOutlined style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)", fontSize: 12 }} />
                <input value={searchQ} onChange={(e) => setSearchQ(e.target.value)} placeholder="Search…" className="pl-8 pr-3 py-1.5 rounded-lg bg-surface-alt border border-border text-xs text-text placeholder-text-muted outline-none focus:border-primary transition w-36" />
              </div>
              <div className="flex gap-1">
                {["all", "upcoming", "active", "completed", "draft"].map((f) => (
                  <button key={f} onClick={() => setFilter(f)} className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition ${filter === f ? "bg-primary text-white" : "bg-surface-alt text-text-muted hover:text-text"}`}>{f}</button>
                ))}
              </div>
            </div>
          </div>

          {loading ? (
            <p className="text-center text-xs text-text-muted py-10">Loading exams…</p>
          ) : (
            <div className="divide-y divide-border">
              {filteredExams.length === 0 && (
                <p className="text-center text-xs text-text-muted py-10">No exams match your filters.</p>
              )}
              {filteredExams.map((ex) => {
                const dt = new Date(ex.scheduledAt);
                const day = String(dt.getDate()).padStart(2, "0");
                const monthLabel = dt.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
                const progress = ex.total > 0 ? ((ex.submitted || 0) / ex.total) * 100 : 0;
                const cfg = STATUS_CONFIG[ex.status];
                return (
                  <div key={ex._id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-surface-alt transition-colors cursor-pointer group" onClick={() => navigate(`/teacher/exams/${ex._id}`)}>
                    <div className="w-10 h-10 rounded-xl flex flex-col items-center justify-center text-white shrink-0 shadow-sm" style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-accent))" }}>
                      <span className="text-[9px] font-semibold opacity-80 leading-none">{monthLabel}</span>
                      <span className="text-sm font-black leading-tight">{day}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-text truncate">{ex.title}</span>
                        <StatusBadge status={ex.status} />
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-text-muted">
                        <span>{(ex.courseIds || []).join(", ") || "—"}</span>
                        <span>·</span>
                        <span>{ex.durationMinutes}m</span>
                        <span>·</span>
                        <span>{ex.totalQuestions} questions</span>
                      </div>
                    </div>
                    {ex.status === "draft" && (
                      <button onClick={(e) => handlePublish(ex._id, e)} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-info/10 text-info hover:bg-info/20 transition shrink-0">
                        <SendOutlined /> Publish
                      </button>
                    )}
                    <button onClick={(e) => handleDelete(ex._id, e)} className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-error/10 text-text-muted hover:text-error transition shrink-0">
                      <DeleteOutlined style={{ fontSize: 13 }} />
                    </button>
                    <ArrowRightOutlined style={{ color: "var(--color-text-muted)", fontSize: 12 }} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
