import { useState, useEffect } from "react";
import api from "../lib/api";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  BookOutlined,
  RightOutlined,
  LeftOutlined,
  CheckCircleFilled,
  LockOutlined,
  FireOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const statusConfig = {
  live: { label: "Live Now", icon: <FireOutlined />, cls: "!bg-[var(--color-success)]/10 text-[var(--color-success)]! border-[var(--color-success)]/30!" },
  upcoming: { label: "Upcoming", icon: <ClockCircleOutlined />, cls: "!bg-[var(--color-accent)]/10 text-[var(--color-accent)]! border-[var(--color-accent)]/30!" },
  done: { label: "Completed", icon: <CheckCircleFilled />, cls: "!bg-[var(--color-text-muted)]/10 text-[var(--color-text-muted)]! border-[var(--color-border)]!" },
};

// "upcoming" and "active" are both takeable; "draft" = locked; "completed"/"graded" = done
const mapApiStatus = (s) =>
  s === "active" ? "live"
  : (s === "upcoming") ? "live"
  : (s === "completed" || s === "graded") ? "done"
  : "upcoming"; // "draft" → show as upcoming/locked

export default function StudentCalendarPage() {
  const navigate = useNavigate();
  const today = new Date();
  const [current, setCurrent] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [selected, setSelected] = useState(null);
  const [examsMap, setExamsMap] = useState({});
  const [allExams, setAllExams] = useState([]);

  useEffect(() => {
    api.get("/exams/student").then(({ data }) => {
      const map = {};
      const list = [];
      data.forEach((exam) => {
        const dateKey = exam.scheduledAt ? exam.scheduledAt.slice(0, 10) : null;
        const mapped = {
          id: exam._id,
          title: exam.title,
          course: (exam.courseNames || exam.courseIds)?.join(", ") || "—",
          duration: exam.durationMinutes || 0,
          status: mapApiStatus(exam.status),
          color: "accent",
          date: dateKey,
        };
        list.push(mapped);
        if (dateKey) {
          if (!map[dateKey]) map[dateKey] = [];
          map[dateKey].push(mapped);
        }
      });
      setExamsMap(map);
      setAllExams(list);
    }).catch(() => {});
  }, []);

  const firstDay = new Date(current.year, current.month, 1).getDay();
  const daysInMonth = new Date(current.year, current.month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const fmtKey = (d) => `${current.year}-${String(current.month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const selectedExams = selected ? examsMap[fmtKey(selected)] || [] : [];

  const upcomingList = allExams
    .filter((e) => e.date && e.date >= todayKey && e.status !== "done")
    .sort((a, b) => (a.date || "").localeCompare(b.date || ""))
    .slice(0, 4);

  const upcomingCount = allExams.filter((e) => e.status === "upcoming" || e.status === "live").length;
  const completedCount = allExams.filter((e) => e.status === "done").length;

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-bg! font-sans">
      <div className="max-w-6xl mx-auto px-6 py-8">
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
              Calendar
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="bg-surface! rounded-2xl border border-border! overflow-hidden">
            {/* Month nav */}
            <div className="flex items-center justify-between px-6 py-5 border-b! border-border!">
              <button
                onClick={() => setCurrent((c) => { const d = new Date(c.year, c.month - 1); return { year: d.getFullYear(), month: d.getMonth() }; })}
                className="w-8 h-8 rounded-lg border border-border! flex items-center justify-center text-text-secondary! hover:bg-surface-alt! transition-colors"
              >
                <LeftOutlined className="text-xs!" />
              </button>
              <h2 className="text-base! font-semibold text-text!">
                {MONTHS[current.month]} {current.year}
              </h2>
              <button
                onClick={() => setCurrent((c) => { const d = new Date(c.year, c.month + 1); return { year: d.getFullYear(), month: d.getMonth() }; })}
                className="w-8 h-8 rounded-lg border border-border! flex items-center justify-center text-text-secondary! hover:bg-surface-alt! transition-colors"
              >
                <RightOutlined className="text-xs!" />
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 border-b! border-border!">
              {DAYS.map((d) => (
                <div key={d} className="py-3 text-center! text-xs! font-semibold text-text-muted! tracking-wider uppercase">
                  {d}
                </div>
              ))}
            </div>

            {/* Cells */}
            <div className="grid grid-cols-7">
              {cells.map((day, i) => {
                if (!day) return <div key={`e-${i}`} className="h-16 border-b! border-r! border-border! bg-surface-alt/30!" />;
                const key = fmtKey(day);
                const dayExams = examsMap[key] || [];
                const isToday = key === todayKey;
                const isSelected = selected === day;
                const hasLive = dayExams.some((e) => e.status === "live");

                return (
                  <div
                    key={day}
                    onClick={() => setSelected(day === selected ? null : day)}
                    className={`h-16 border-b! border-r! border-border! p-1.5 cursor-pointer transition-colors relative
                      ${isSelected ? "bg-primary/8!" : "hover:bg-surface-alt!"}
                    `}
                  >
                    <span className={`text-xs! font-medium w-6 h-6 flex items-center justify-center rounded-full
                      ${isToday ? "bg-primary! text-white!" : "text-text-secondary!"}
                    `}>
                      {day}
                    </span>
                    {hasLive && (
                      <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-success! animate-pulse" />
                    )}
                    <div className="flex flex-wrap gap-0.5 mt-0.5">
                      {dayExams.slice(0, 2).map((e) => (
                        <span
                          key={e.id}
                          className={`text-[9px]! px-1 py-0.5 rounded font-medium truncate max-w-full
                            ${e.status === "live" ? "bg-success/15! text-success!" :
                              e.status === "done" ? "bg-text-muted/10! text-text-muted!" :
                              "bg-accent/15! text-accent!"}
                          `}
                        >
                          {e.course}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected day exams */}
          {selected && (
            <div className="mt-4 bg-surface! rounded-2xl border border-border! p-5">
              <h3 className="text-sm font-semibold text-text! mb-3">
                {MONTHS[current.month]} {selected}
              </h3>
              {selectedExams.length === 0 ? (
                <p className="text-sm text-text-muted! text-center! py-4">No exams on this day</p>
              ) : (
                <div className="space-y-3">
                  {selectedExams.map((exam) => (
                    <ExamCard
                      key={exam.id}
                      exam={exam}
                      onStartExam={() => navigate(`/student/exams/${exam.id}/instructions`)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Upcoming", val: upcomingCount, color: "!text-[var(--color-accent)]", bg: "!bg-[var(--color-accent)]/10" },
              { label: "Completed", val: completedCount, color: "!text-[var(--color-success)]", bg: "!bg-[var(--color-success)]/10" },
            ].map((s) => (
              <div key={s.label} className="bg-surface! rounded-xl border border-border! p-4 text-center!">
                <div className={`text-2xl font-bold ${s.color}`}>{s.val}</div>
                <div className="text-xs text-text-muted! mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Upcoming */}
          <div className="bg-surface! rounded-2xl border border-border! p-5">
            <h3 className="text-sm font-semibold text-text! mb-4 flex items-center gap-2">
              <CalendarOutlined className="text-primary!" />
              Next Exams
            </h3>
            <div className="space-y-3">
              {upcomingList.length === 0 ? (
                <p className="text-xs text-text-muted! text-center! py-2">No upcoming exams</p>
              ) : upcomingList.map((exam) => (
                <div key={exam.id} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-surface-alt! border border-border! flex flex-col items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-primary! leading-none">
                      {exam.date ? new Date(exam.date).toLocaleString("default", { month: "short" }).toUpperCase() : "—"}
                    </span>
                    <span className="text-xs font-bold text-text! leading-none">
                      {exam.date ? new Date(exam.date + "T00:00:00").getDate() : "—"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-text! truncate">{exam.title}</p>
                    <p className="text-[11px] text-text-muted!">{exam.course} · {exam.duration}min</p>
                  </div>
                  {exam.status === "live" && (
                    <span className="text-[10px] font-semibold text-success! bg-success/10! px-2 py-0.5 rounded-full shrink-0">
                      LIVE
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="bg-surface! rounded-2xl border border-border! p-5">
            <h3 className="text-xs font-semibold text-text-muted! uppercase tracking-wider mb-3">Legend</h3>
            <div className="space-y-2">
              {Object.entries(statusConfig).map(([k, v]) => (
                <div key={k} className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded border ${v.cls} flex items-center gap-1`}>
                    {v.icon} {v.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

function ExamCard({ exam, onStartExam }) {
  const cfg = statusConfig[exam.status];
  return (
    <div className="flex items-center justify-between p-4 rounded-xl border border-border! hover:border-primary/30! transition-colors bg-surface-alt/50!">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10! flex items-center justify-center">
          <BookOutlined className="text-primary!" />
        </div>
        <div>
          <p className="text-sm font-semibold text-text!">{exam.title}</p>
          <p className="text-xs text-text-muted!">{exam.course} · {exam.duration} min</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-xs px-2 py-1 rounded-full border flex items-center gap-1 ${cfg.cls}`}>
          {cfg.icon} {cfg.label}
        </span>
        {exam.status === "live" && (
          <button
            onClick={onStartExam}
            className="px-3 py-1.5 rounded-lg bg-primary! hover:bg-primary-hover! text-white! text-xs! font-semibold transition-colors flex items-center gap-1"
          >
            Start <RightOutlined />
          </button>
        )}
        {exam.status === "upcoming" && (
          <button className="p-1.5 rounded-lg border border-border! text-text-muted!">
            <LockOutlined className="text-xs" />
          </button>
        )}
      </div>
    </div>
  );
}
