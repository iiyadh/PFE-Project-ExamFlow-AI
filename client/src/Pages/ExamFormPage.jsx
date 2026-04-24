import { useState, useEffect } from "react";
import {
  PlusOutlined,
  CloseCircleOutlined,
  CheckOutlined,
  BookOutlined,
  BellOutlined,
  InfoCircleOutlined,
  DeleteOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  SettingOutlined,
  AppstoreOutlined,
  RightOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../lib/api";

/* ─── Data ───────────────────────────────────────────────── */

const QUESTION_TYPES = ["MCQ", "Short Answer", "Long Answer", "True/False", "Fill in the Blank"];

const CREATE_DEFAULTS = {
  title: "", courses: [], date: "", questions: "", duration: "", showAnswers: false,
  passingScore: 60,
  chapters: [],   // [{ courseId, chapterId, chapterLabel, pct, qType }]
};

/* ─── Tiny helpers ───────────────────────────────────────── */
const totalPct = (chapters) => chapters.reduce((s, c) => s + (parseInt(c.pct) || 0), 0);

const pctColor = (pct) =>
  pct === 100 ? "var(--color-success)"
  : pct > 100  ? "var(--color-error)"
  : "var(--color-warning)";

const courseColor = (idx) => {
  const palette = [
    "var(--color-primary)", "var(--color-accent)", "var(--color-ai)",
    "var(--color-success)", "var(--color-warning)", "var(--color-info)", "var(--color-error)",
  ];
  return palette[idx % palette.length];
};

/* ─── Sub-components ─────────────────────────────────────── */
const Label = ({ children, hint }) => (
  <div className="flex items-center justify-between mb-1.5">
    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">{children}</label>
    {hint && <span className="text-[10px] text-text-muted">{hint}</span>}
  </div>
);

const Input = ({ className = "", ...props }) => (
  <input
    {...props}
    className={`w-full px-3 py-2.5 rounded-xl text-sm border border-border outline-none transition bg-bg text-text placeholder-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 ${className}`}
  />
);

const Select = ({ children, className = "", ...props }) => (
  <select
    {...props}
    className={`w-full px-3 py-2.5 rounded-xl text-sm border border-border outline-none transition bg-bg text-text focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer ${className}`}
  >
    {children}
  </select>
);

/* ─── Chapter Row ─────────────────────────────────────────── */
const ChapterRow = ({ ch, idx, courseIdx, onUpdate, onRemove, total }) => {
  const color = courseColor(courseIdx);
  return (
    <div className="rounded-xl border border-border bg-surface-alt overflow-hidden group transition-all hover:border-primary/30">
      {/* color accent strip */}
      <div className="h-0.5 w-full" style={{ background: color }} />
      <div className="p-3 space-y-3">
        {/* Top row: course badge + chapter label + remove */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full shrink-0"
              style={{ background: `${color}20`, color }}>
              {ch.courseCode || ch.courseId}
            </span>
            <span className="text-sm font-semibold text-text truncate">{ch.chapterLabel}</span>
          </div>
          <button onClick={onRemove} className="p-1 rounded-lg hover:bg-error/10 text-text-muted hover:text-error transition shrink-0">
            <DeleteOutlined style={{ fontSize: 13 }} />
          </button>
        </div>

        {/* Bottom row: question type + pct slider */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Question Type</p>
            <Select
              value={ch.qType}
              onChange={e => onUpdate("qType", e.target.value)}
            >
              {QUESTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </Select>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Weight</p>
              <span className="text-xs font-black" style={{ color }}>{ch.pct}%</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range" min="0" max="100" value={ch.pct}
                onChange={e => onUpdate("pct", parseInt(e.target.value))}
                className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
                style={{ accentColor: color }}
              />
              <input
                type="number" min="0" max="100" value={ch.pct}
                onChange={e => onUpdate("pct", parseInt(e.target.value) || 0)}
                className="w-14 px-2 py-1 rounded-lg text-xs font-bold border border-border bg-bg text-text outline-none focus:border-primary text-center"
              />
            </div>
            {/* mini bar */}
            <div className="mt-2 h-1 rounded-full bg-border overflow-hidden">
              <div className="h-full rounded-full transition-all duration-300"
                style={{ width: `${ch.pct}%`, background: color }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Main ───────────────────────────────────────────────── */
export default function ExamFormPage({ examId } = {}) {
  const navigate = useNavigate();
  const { examId: routeExamId } = useParams();
  const resolvedExamId = examId || routeExamId;
  const isEdit = Boolean(resolvedExamId);
  const [form, setForm] = useState(CREATE_DEFAULTS);
  const [addCourseVal, setAddCourseVal] = useState("");
  const [addChapterCourse, setAddChapterCourse] = useState("");
  const [addChapterVal, setAddChapterVal]   = useState("");
  const [step, setStep] = useState(1); // 1=basic, 2=chapters, 3=settings
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [coursesData, setCoursesData] = useState([]);
  const [chaptersData, setChaptersData] = useState({});

  useEffect(() => {
    api.get("/course/for-teacher").then(({ data }) => {
      setCoursesData(data);
      const chMap = {};
      data.forEach((c) => {
        chMap[c._id.toString()] = (c.markdownContent || []).map((m) => ({
          id: m._id.toString(),
          label: m.title,
        }));
      });
      setChaptersData(chMap);
    }).catch(() => {});
  }, []);

  // Load existing exam when editing
  useEffect(() => {
    if (!isEdit) return;
    api.get(`/exams/${resolvedExamId}`).then(({ data }) => {
      setForm({
        title: data.title || "",
        courses: data.courseIds || [],
        date: data.scheduledAt ? data.scheduledAt.slice(0, 10) : "",
        questions: String(data.totalQuestions || ""),
        duration: String(data.durationMinutes || ""),
        showAnswers: data.showAnswers || false,
        passingScore: data.passingScore ?? 60,
        chapters: (data.chapterWeights || []).map((w) => ({
          courseId: w.courseId,
          chapterId: w.chapterId,
          chapterLabel: w.chapterLabel || w.chapterId,
          pct: w.weightPct,
          qType: w.questionType,
        })),
      });
    }).catch(() => {});
  }, [resolvedExamId, isEdit]);

  const total = totalPct(form.chapters);
  const pctOk = total === 100 || form.chapters.length === 0;

  const goToExamList = () => navigate("/teacher/exams");
  const goToCancelTarget = () => {
    if (isEdit) { navigate(`/teacher/exams/${resolvedExamId}`); return; }
    goToExamList();
  };

  const handleSubmit = async () => {
    if (!pctOk) return;
    if (!form.title.trim() || !form.date || !form.questions || !form.duration) {
      setError("Please fill in all required fields (title, date, questions, duration).");
      setStep(1);
      return;
    }
    setSaving(true);
    setError("");
    const payload = {
      title: form.title,
      courses: form.courses,
      courseIds: form.courses,
      date: form.date,
      duration: Number(form.duration),
      questions: Number(form.questions),
      showAnswers: form.showAnswers,
      passingScore: form.passingScore,
      chapters: form.chapters,
    };
    try {
      if (isEdit) {
        await api.put(`/exams/${resolvedExamId}`, payload);
        navigate(`/teacher/exams/${resolvedExamId}`);
      } else {
        const { data } = await api.post("/exams", payload);
        navigate(`/teacher/exams/${data._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save exam.");
    } finally {
      setSaving(false);
    }
  };

  /* ── Course helpers ── */
  const addCourse = () => {
    if (!addCourseVal || form.courses.includes(addCourseVal)) return;
    setForm(f => ({ ...f, courses: [...f.courses, addCourseVal] }));
    setAddCourseVal("");
  };

  const removeCourse = (id) => {
    setForm(f => ({
      ...f,
      courses: f.courses.filter(c => c !== id),
      chapters: f.chapters.filter(ch => ch.courseId !== id),
    }));
  };

  /* ── Chapter helpers ── */
  const availableChapters = () => {
    if (!addChapterCourse) return [];
    const already = form.chapters.filter(c => c.courseId === addChapterCourse).map(c => c.chapterId);
    return (chaptersData[addChapterCourse] || []).filter(c => !already.includes(c.id));
  };

  const addChapter = () => {
    if (!addChapterCourse || !addChapterVal) return;
    const ch = (chaptersData[addChapterCourse] || []).find(c => c.id === addChapterVal);
    if (!ch) return;
    const courseObj = coursesData.find(c => c._id.toString() === addChapterCourse);
    setForm(f => ({
      ...f,
      chapters: [...f.chapters, {
        courseId: addChapterCourse,
        chapterId: ch.id,
        chapterLabel: ch.label,
        courseCode: courseObj?.title || "",
        pct: 0,
        qType: "MCQ",
      }],
    }));
    setAddChapterVal("");
  };

  const removeChapter = (i) => setForm(f => ({ ...f, chapters: f.chapters.filter((_, idx) => idx !== i) }));

  const updateChapter = (i, key, val) => setForm(f => {
    const chapters = [...f.chapters];
    chapters[i] = { ...chapters[i], [key]: val };
    return { ...f, chapters };
  });

  const autoBalance = () => {
    const n = form.chapters.length;
    if (!n) return;
    const base = Math.floor(100 / n);
    const remainder = 100 - base * n;
    setForm(f => ({
      ...f,
      chapters: f.chapters.map((c, i) => ({ ...c, pct: base + (i < remainder ? 1 : 0) })),
    }));
  };

  /* ── Steps ── */
  const STEPS = [
    { id: 1, icon: <FileTextOutlined />, label: "Basic Info" },
    { id: 2, icon: <AppstoreOutlined />, label: "Chapters" },
    { id: 3, icon: <SettingOutlined />,  label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-bg font-sans">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
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
            <li className="text-primary font-medium">
              {isEdit ? "Edit Exam" : "Create Exam"}
            </li>
          </ol>
        </nav>

        {/* ── Header ── */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={goToExamList} className="p-2 rounded-xl border border-border text-text-secondary hover:bg-surface-alt transition">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-2xl font-black text-text">{isEdit ? "Edit Exam" : "Create New Exam"}</h1>
              <p className="text-sm text-text-muted mt-0.5">{isEdit ? "Update exam parameters and chapter weights" : "Configure a new parameterized exam"}</p>
            </div>
          </div>
          {isEdit && (
            <button onClick={goToCancelTarget} className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-error/10 text-error text-sm font-bold hover:bg-error/20 transition border border-error/20">
              <CloseCircleOutlined /> Cancel Exam
            </button>
          )}
        </div>

        {/* ── Step indicator ── */}
        <div className="flex items-center gap-0 mb-8 p-1 bg-surface border border-border rounded-2xl w-full">
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setStep(s.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${step === s.id ? "bg-primary text-white shadow-sm" : "text-text-muted hover:text-text"}`}
            >
              {s.icon}
              <span className="hidden sm:inline">{s.label}</span>
              {s.id === 2 && form.chapters.length > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${step === 2 ? "bg-white/20 text-white" : "bg-surface-alt text-text-muted"}`}>
                  {form.chapters.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ══ STEP 1 – Basic Info ══ */}
        {step === 1 && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Left: title / date / time */}
            <div className="space-y-5">
              <div className="rounded-2xl border border-border bg-surface overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
                  <FileTextOutlined style={{ color: "var(--color-text-muted)", fontSize: 13 }} />
                  <h3 className="font-bold text-sm text-text">Basic Information</h3>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <Label>Exam Title</Label>
                    <Input placeholder="e.g. Midterm – Algorithms" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label hint="questions">Total Questions</Label>
                      <Input type="number" placeholder="40" value={form.questions} onChange={e => setForm(f => ({ ...f, questions: e.target.value }))} />
                    </div>
                    <div>
                      <Label hint="min">Duration</Label>
                      <Input type="number" placeholder="90" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <Label>Scheduled Date</Label>
                    <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                  </div>
                </div>
              </div>
            </div>

            {/* Right: courses */}
            <div className="rounded-2xl border border-border bg-surface overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <BookOutlined style={{ color: "var(--color-text-muted)", fontSize: 13 }} />
                  <h3 className="font-bold text-sm text-text">Courses</h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-alt text-text-muted">
                  {form.courses.length} selected
                </span>
              </div>
              <div className="p-5">
                {/* Add course row */}
                <div className="flex gap-2 mb-4">
                  <Select value={addCourseVal} onChange={e => setAddCourseVal(e.target.value)} className="flex-1">
                    <option value="">Select a course…</option>
                    {coursesData.filter(c => !form.courses.includes(c._id.toString())).map(c => (
                      <option key={c._id} value={c._id.toString()}>{c.title}</option>
                    ))}
                  </Select>
                  <button
                    onClick={addCourse}
                    disabled={!addCourseVal}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl bg-primary text-white text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary-hover transition shrink-0"
                  >
                    <PlusOutlined /> Add
                  </button>
                </div>

                {/* Selected courses */}
                {form.courses.length === 0 ? (
                  <div className="flex flex-col items-center py-8 text-center">
                    <BookOutlined style={{ fontSize: 24, color: "var(--color-text-muted)" }} />
                    <p className="text-xs text-text-muted mt-2">No courses added yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {form.courses.map((id, idx) => {
                      const course = coursesData.find(c => c._id.toString() === id);
                      const color = courseColor(idx);
                      const chapCount = form.chapters.filter(c => c.courseId === id).length;
                      return (
                        <div key={id} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-surface-alt group">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-black shrink-0"
                            style={{ background: color }}>
                            {(course?.title || id).slice(0, 2)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-text truncate">{course?.title || id}</p>
                            <p className="text-[10px] text-text-muted">{chapCount} chapter{chapCount !== 1 ? "s" : ""} selected</p>
                          </div>
                          <button onClick={() => removeCourse(id)}
                            className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-error/10 text-text-muted hover:text-error transition">
                            <DeleteOutlined style={{ fontSize: 12 }} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {form.courses.length > 0 && (
                  <button onClick={() => setStep(2)} className="mt-4 w-full py-2 rounded-xl text-xs font-bold bg-surface-alt text-primary hover:opacity-80 transition border border-primary/20">
                    Continue to Chapters →
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══ STEP 2 – Chapters ══ */}
        {step === 2 && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            {/* Chapter adder (2 cols) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-2xl border border-border bg-surface overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
                  <PlusOutlined style={{ color: "var(--color-text-muted)", fontSize: 13 }} />
                  <h3 className="font-bold text-sm text-text">Add Chapter</h3>
                </div>
                <div className="p-5 space-y-3">
                  {form.courses.length === 0 ? (
                    <div className="text-center py-6">
                      <InfoCircleOutlined style={{ fontSize: 20, color: "var(--color-text-muted)" }} />
                      <p className="text-xs text-text-muted mt-2">Add courses first in Step 1</p>
                    </div>
                  ) : (
                    <>
                      <div>
                        <Label>Course</Label>
                        <Select value={addChapterCourse} onChange={e => { setAddChapterCourse(e.target.value); setAddChapterVal(""); }}>
                          <option value="">Select course…</option>
                          {form.courses.map((id) => {
                            const course = coursesData.find(c => c._id.toString() === id);
                            return <option key={id} value={id}>{course?.title || id}</option>;
                          })}
                        </Select>
                      </div>
                      <div>
                        <Label>Chapter</Label>
                        <Select value={addChapterVal} onChange={e => setAddChapterVal(e.target.value)} disabled={!addChapterCourse}>
                          <option value="">Select chapter…</option>
                          {availableChapters().map(c => (
                            <option key={c.id} value={c.id}>{c.label}</option>
                          ))}
                        </Select>
                        {addChapterCourse && availableChapters().length === 0 && (
                          <p className="text-[10px] text-success mt-1 flex items-center gap-1">
                            <CheckOutlined /> All chapters added
                          </p>
                        )}
                      </div>
                      <button
                        onClick={addChapter}
                        disabled={!addChapterCourse || !addChapterVal}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-white text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary-hover transition"
                      >
                        <PlusOutlined /> Add Chapter
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Pct summary */}
              <div className="rounded-2xl border border-border bg-surface p-5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-text">Total Weight</h4>
                  <span className="text-lg font-black" style={{ color: pctColor(total) }}>{total}%</span>
                </div>
                <div className="h-2 rounded-full bg-surface-alt overflow-hidden mb-2">
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(total, 100)}%`, background: pctColor(total) }} />
                </div>
                <p className="text-[10px] text-text-muted">
                  {pctOk ? "✓ Percentages balance correctly" : total > 100 ? `${total - 100}% over limit` : `${100 - total}% remaining`}
                </p>
                {form.chapters.length > 0 && !pctOk && (
                  <button onClick={autoBalance}
                    className="mt-3 w-full py-2 rounded-xl text-xs font-bold bg-primary/10 text-primary hover:opacity-80 transition border border-primary/20">
                    Auto-Balance Equally
                  </button>
                )}
              </div>
            </div>

            {/* Chapter list (3 cols) */}
            <div className="lg:col-span-3">
              <div className="rounded-2xl border border-border bg-surface overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    <AppstoreOutlined style={{ color: "var(--color-text-muted)", fontSize: 13 }} />
                    <h3 className="font-bold text-sm text-text">Chapter Weights</h3>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-alt text-text-muted">
                    {form.chapters.length} chapters
                  </span>
                </div>
                <div className="p-4">
                  {form.chapters.length === 0 ? (
                    <div className="flex flex-col items-center py-14 text-center">
                      <AppstoreOutlined style={{ fontSize: 28, color: "var(--color-text-muted)" }} />
                      <p className="text-sm font-semibold text-text-muted mt-3">No chapters added</p>
                      <p className="text-xs text-text-muted opacity-60 mt-1">Select a course and chapter from the left panel</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                      {form.chapters.map((ch, i) => {
                        const courseIdx = form.courses.indexOf(ch.courseId);
                        return (
                          <ChapterRow
                            key={`${ch.chapterId}-${i}`}
                            ch={ch} idx={i} courseIdx={courseIdx}
                            onUpdate={(k, v) => updateChapter(i, k, v)}
                            onRemove={() => removeChapter(i)}
                            total={total}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══ STEP 3 – Settings ══ */}
        {step === 3 && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              {/* Show Answers toggle */}
              <div className="rounded-2xl border border-border bg-surface p-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-text">Show Answers Immediately</p>
                  <p className="text-xs text-text-muted mt-0.5">Students see correct answers right after submission</p>
                </div>
                <button
                  onClick={() => setForm(f => ({ ...f, showAnswers: !f.showAnswers }))}
                  className="relative w-12 h-6 rounded-full transition-colors shrink-0"
                  style={{ background: form.showAnswers ? "var(--color-success)" : "var(--color-border)" }}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${form.showAnswers ? "translate-x-6" : ""}`} />
                </button>
              </div>

              {/* Passing score */}
              <div className="rounded-2xl border border-border bg-surface p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-bold text-text">Passing Score</p>
                    <p className="text-xs text-text-muted mt-0.5">Minimum score to pass this exam</p>
                  </div>
                  <span className="text-2xl font-black" style={{ color: "var(--color-success)" }}>{form.passingScore}%</span>
                </div>
                <input
                  type="range" min="0" max="100" value={form.passingScore}
                  onChange={e => setForm(f => ({ ...f, passingScore: parseInt(e.target.value) }))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{ accentColor: "var(--color-success)" }}
                />
                <div className="flex justify-between text-[10px] text-text-muted mt-1">
                  <span>0%</span><span>50%</span><span>100%</span>
                </div>
              </div>
            </div>

            {/* Summary card */}
            <div className="rounded-2xl border border-border bg-surface overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
                <CheckOutlined style={{ color: "var(--color-success)", fontSize: 13 }} />
                <h3 className="font-bold text-sm text-text">Review Summary</h3>
              </div>
              <div className="divide-y divide-border">
                {[
                  { label: "Title",      val: form.title || "—" },
                  { label: "Courses",    val: form.courses.map(id => coursesData.find(c => c._id.toString() === id)?.title || id).join(", ") || "—" },
                  { label: "Date",       val: form.date || "—" },
                  { label: "Questions",  val: form.questions || "—" },
                  { label: "Duration",   val: form.duration ? `${form.duration} min` : "—" },
                  { label: "Chapters",   val: `${form.chapters.length} selected` },
                  { label: "Weight",     val: <span style={{ color: pctColor(total) }}>{total}%</span> },
                  { label: "Show Answers", val: form.showAnswers ? <span style={{ color: "var(--color-success)" }}>Yes</span> : "No" },
                  { label: "Passing Score", val: `${form.passingScore}%` },
                ].map(({ label, val }) => (
                  <div key={label} className="flex items-center justify-between px-5 py-2.5 hover:bg-surface-alt transition-colors">
                    <span className="text-xs text-text-muted">{label}</span>
                    <span className="text-xs font-bold text-text max-w-[60%] text-right truncate">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Footer actions ── */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-error/10 border border-error/20 text-xs text-error font-medium">{error}</div>
        )}
        <div className="mt-8 flex items-center justify-between gap-3 pt-6 border-t border-border">
          <button
            onClick={() => setStep(s => Math.max(1, s - 1))}
            disabled={step === 1}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-surface border border-border text-text hover:bg-surface-alt transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← Back
          </button>
          <div className="flex gap-2">
            <button onClick={goToCancelTarget} className="px-5 py-2.5 rounded-xl text-sm font-bold bg-surface-alt text-text hover:opacity-70 transition">
              Cancel
            </button>
            {step < 3 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-hover transition shadow-lg shadow-(--color-primary)/20 hover:-translate-y-0.5"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition shadow-lg hover:-translate-y-0.5 disabled:opacity-60"
                style={{ background: "var(--color-primary)", cursor: saving ? "not-allowed" : "pointer" }}
              >
                {saving ? <LoadingOutlined /> : <CheckOutlined />}
                {isEdit ? "Save Changes" : "Create Exam"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}