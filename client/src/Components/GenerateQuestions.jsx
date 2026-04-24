import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  StarOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
  UploadOutlined,
  SettingOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  UnorderedListOutlined,
  AppstoreOutlined,
  LoadingOutlined,
  ThunderboltOutlined,
  RightOutlined,
} from "@ant-design/icons";
import api from '../lib/api';


const QUESTION_TYPES = [
  {
    id: "single_answer",
    label: "One Answer",
    icon: <CheckCircleOutlined className="text-base" />,
  },
  {
    id: "multiple_answer",
    label: "Multiple Answers",
    icon: <AppstoreOutlined className="text-base" />,
  },
  {
    id: "short_answer",
    label: "Short Answer",
    icon: <UnorderedListOutlined className="text-base" />,
  },
  {
    id: "both",
    label: "Mixed",
    icon: <AppstoreOutlined className="text-base" />,
  },
];

const DIFFICULTIES = [
  {
    id: "easy",
    label: "Easy",
    activeClass:
      "bg-emerald-50 text-emerald-800 border-emerald-500 dark:bg-emerald-900/30 dark:text-emerald-300",
  },
  {
    id: "medium",
    label: "Medium",
    activeClass:
      "bg-amber-50 text-amber-800 border-amber-500 dark:bg-amber-900/30 dark:text-amber-300",
  },
  {
    id: "hard",
    label: "Hard",
    activeClass:
      "bg-red-50 text-red-800 border-red-500 dark:bg-red-900/30 dark:text-red-300",
  },
  {
    id: "mixed",
    label: "Mixed",
    activeClass:
      "bg-surface-alt text-primary border-primary dark:bg-surface-alt",
  },
];

const BLOOMS = [
  "Any level",
  "Remember",
  "Understand",
  "Apply",
  "Analyze",
  "Evaluate",
  "Create",
];

/* ── Reusable field label ─────────────────────────── */
const Label = ({ children, required }) => (
  <label className="block text-sm font-medium text-text-secondary mb-1.5">
    {children}
    {required && <span className="text-error ml-0.5">*</span>}
  </label>
);

/* ── Section card wrapper ─────────────────────────── */
const SectionCard = ({ icon, title, subtitle, children }) => (
  <div className="bg-surface border border-border rounded-2xl p-6">
    <div className="flex items-center gap-2 text-text font-medium mb-1">
      <span className="text-primary">{icon}</span>
      {title}
    </div>
    {subtitle && (
      <p className="text-sm text-text-muted mb-4">{subtitle}</p>
    )}
    {children}
  </div>
);

/* ── Select wrapper ───────────────────────────────── */
const Select = ({ value, onChange, children, placeholder }) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="
        w-full h-10 pl-3 pr-8 rounded-lg text-sm
        bg-surface text-text
        border border-border
        appearance-none outline-none cursor-pointer
        hover:border-accent focus:border-primary
        focus:ring-2 focus:ring-primary/10
        transition-colors
      "
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {children}
    </select>
    <svg
      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  </div>
);

/* ── Main component ───────────────────────────────── */
const GenerateQuestions = () => {
  const navigate = useNavigate();
  const { classId } = useParams();
  const { state } = useLocation();
  const [genqtab, setGenqtab] = useState("prompt");
  const [customPrompt, setCustomPrompt] = useState("");
  const [courses, setCourses] = useState([]);
  const [chaptersMap, setChaptersMap] = useState({});
  const [course, setCourse] = useState("");
  const [chapter, setChapter] = useState("");
  const [qType, setQType] = useState("mcq");
  const [count, setCount] = useState(10);
  const [difficulty, setDifficulty] = useState("easy");
  const [language, setLanguage] = useState("English");
  const [blooms, setBlooms] = useState("Any level");
  const [instructions, setInstructions] = useState("");
  const [autoVerify, setAutoVerify] = useState(true);
  const [avoidDupes, setAvoidDupes] = useState(false);
  const [advOpen, setAdvOpen] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!classId) return;
    api.get(`/course/${classId}/with-chapters`).then(({ data }) => {
      const courseList = data.map((c) => ({ value: c._id, label: c.title }));
      const chMap = data.reduce((acc, c) => {
        acc[c._id] = (c.markdownContent || []).map((m) => ({ value: m._id, label: m.title }));
        return acc;
      }, {});
      setCourses(courseList);
      setChaptersMap(chMap);
      if (courseList.length > 0) {
        setCourse(courseList[0].value);
        const firstChapters = chMap[courseList[0].value] || [];
        setChapter(firstChapters[0]?.value || "");
      }
    }).catch((err) => console.error("Failed to load courses:", err));
  }, [classId]);

  const chapters = chaptersMap[course] || [];
  const typeLabels = { single_answer: "One Answer", multiple_answer: "Multiple Answers", short_answer: "Short Answer", both: "Mixed" };
  const diffLabel =
    DIFFICULTIES.find((d) => d.id === difficulty)?.label || "—";
  const estSeconds = Math.round(count * (qType === "both" ? 2 : 1.5));
  const estTime =
    estSeconds < 60 ? `~${estSeconds} sec` : `~${Math.ceil(estSeconds / 60)} min`;

  const courseName =
    courses.find((c) => c.value === course)?.label || "—";
  const chapterName =
    chapters.find((c) => c.value === chapter)?.label?.split(" — ")[0] || "—";
  const className = state?.className;

  const handleCourseChange = (nextCourse) => {
    setCourse(nextCourse);
    const nextChapters = chaptersMap[nextCourse] || [];
    setChapter(nextChapters[0]?.value || "");
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const chapterLabel = chapters.find((c) => c.value === chapter)?.label || "Selected chapter";
      const resolvedCourse = courses.find((c) => c.value === course)?.label || className || "General Course";
      const { data } = await api.post("/questions/generate", {
        chapter: chapterLabel,
        course: resolvedCourse,
        q_type: qType,
        difficulty,
        num_questions: count,
        language,
        blooms,
        instructions,
        prompt: customPrompt,
        mode: genqtab,
        autoVerify,
        avoidDupes,
      });
      navigate("/teacher/genprogress", {
        state: {
          classId,
          className,
          chapter: chapterLabel,
          course: resolvedCourse,
          count,
          type: typeLabels[qType],
          questions: data.questions,
        },
      });
    } catch (err) {
      console.error("Generate failed:", err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg px-6 py-8">
      <nav className="max-w-5xl mx-auto text-sm my-3" aria-label="Breadcrumb">
        <ol className="list-none p-0 inline-flex items-center gap-1.5">
          <li>
            <Link
              to="/teacher/classes"
              className="text-text-secondary hover:text-primary font-medium transition-colors duration-150"
            >
              Classes
            </Link>
          </li>
          {className && (
            <>
              <li>
                <RightOutlined className="text-text-muted!" style={{ fontSize: 10 }} />
              </li>
              <li>
                <span className="text-text-secondary! font-medium">{className}</span>
              </li>
            </>
          )}
          <li>
            <RightOutlined className="text-text-muted!" style={{ fontSize: 10 }} />
          </li>
          <li className="text-primary! font-medium">
            Generate Questions
          </li>
        </ol>
      </nav>

      {/* ── Page header ── */}
      <div className="max-w-5xl mx-auto mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-medium text-text">
              <StarOutlined className="text-ai" />
              Generate Questions
              <span className="inline-flex items-center gap-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-md px-2.5 py-0.5 text-xs font-medium">
                <ThunderboltOutlined className="text-[11px]" />
                AI-Powered
              </span>
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              Configure your parameters and let AI generate tailored exam
              questions.
            </p>
          </div>
        </div>
      </div>

      {/* ── Layout ── */}
      <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-5">

        {/* ── Main column ── */}
        <div className="flex-1 flex flex-col gap-5">

          {/* Content source */}
          <SectionCard
            icon={<FileTextOutlined />}
            title="Content Source"
            subtitle="Switch between prompt-based generation and chapter-context generation."
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => setGenqtab("prompt")}
                className={`
                  flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all duration-150
                  ${
                    genqtab === "prompt"
                      ? "border-primary bg-surface-alt text-primary"
                      : "border-border bg-surface text-text-secondary hover:border-primary hover:text-primary"
                  }
                `}
              >
                <InfoCircleOutlined className="text-base" />
                Prompt Mode
              </button>
              <button
                onClick={() => setGenqtab("upload")}
                className={`
                  flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all duration-150
                  ${
                    genqtab === "upload"
                      ? "border-primary bg-surface-alt text-primary"
                      : "border-border bg-surface text-text-secondary hover:border-primary hover:text-primary"
                  }
                `}
              >
                <UploadOutlined className="text-base" />
                Generate with Context
              </button>
            </div>

            {genqtab === "prompt" ? (
              <div>
                <Label required>Prompt</Label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Describe what kind of questions to generate, target skills, and constraints…"
                  rows={4}
                  className="
                    w-full px-3 py-2.5 rounded-lg text-sm resize-y
                    bg-surface text-text
                    border border-border
                    outline-none placeholder-text-muted
                    hover:border-accent focus:border-primary
                    focus:ring-2 focus:ring-primary/10
                    transition-colors
                  "
                />
                <p className="text-xs text-text-muted mt-2">
                  Example: "Generate 10 mixed questions focused on arrays and linked lists with practical coding scenarios."
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label required>Course</Label>
                  <Select
                    value={course}
                    onChange={handleCourseChange}
                    placeholder="Select a course…"
                  >
                    {courses.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label required>Chapter</Label>
                  <Select
                    value={chapter}
                    onChange={setChapter}
                    placeholder="Select a chapter…"
                  >
                    {chapters.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </Select>
                  <p className="text-xs text-text-muted mt-1.5">
                    Questions will be scoped to the selected chapter's learning
                    objectives.
                  </p>
                </div>
              </div>
            )}
          </SectionCard>

          {/* Question type */}
          <SectionCard
            icon={<InfoCircleOutlined />}
            title="Question Type"
            subtitle="Choose the format of questions to be generated."
          >
            <div className="grid grid-cols-3 gap-3">
              {QUESTION_TYPES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setQType(t.id)}
                  className={`
                    flex flex-col items-center justify-center gap-2
                    h-[72px] rounded-xl border text-sm font-medium
                    transition-all duration-150
                    ${
                      qType === t.id
                        ? "border-primary bg-surface-alt text-primary"
                        : "border-border bg-surface text-text-secondary hover:border-primary hover:text-primary"
                    }
                  `}
                >
                  <span
                    className={`
                      w-7 h-7 rounded-lg flex items-center justify-center text-sm
                      ${qType === t.id ? "bg-primary text-white" : "bg-surface-alt text-text-muted"}
                    `}
                  >
                    {t.icon}
                  </span>
                  {t.label}
                </button>
              ))}
            </div>
          </SectionCard>
          {/* Count & Difficulty */}
          <SectionCard
            icon={
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M12 2v20M2 12h20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            }
            title="Count & Difficulty"
            subtitle="Set how many questions to generate and the target difficulty level."
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Slider */}
              <div>
                <Label required>Number of questions</Label>
                <input
                  type="range"
                  min={1}
                  max={50}
                  step={1}
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  className="w-full accent-primary mt-1"
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-text-muted">1</span>
                  <div className="text-center">
                    <div className="text-3xl font-medium text-primary leading-none">
                      {count}
                    </div>
                    <div className="text-xs text-text-muted mt-0.5">
                      questions
                    </div>
                  </div>
                  <span className="text-xs text-text-muted">50</span>
                </div>
              </div>

              {/* Difficulty pills */}
              <div>
                <Label>Difficulty level</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {DIFFICULTIES.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setDifficulty(d.id)}
                      className={`
                        px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all
                        ${
                          difficulty === d.id
                            ? d.activeClass
                            : "bg-surface text-text-secondary border-border hover:border-accent hover:text-accent"
                        }
                      `}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-text-muted mt-3">
                  Affects Bloom's taxonomy level and answer complexity.
                </p>
              </div>
            </div>
          </SectionCard>

          {/* Advanced options */}
          <div className="bg-surface border border-border rounded-2xl overflow-hidden">
            <button
              onClick={() => setAdvOpen((v) => !v)}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-surface-alt transition-colors"
            >
              <div className="flex items-center gap-2 text-sm font-medium text-text">
                <SettingOutlined className="text-text-muted" />
                Advanced Options
              </div>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                style={{
                  transform: advOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s",
                }}
              >
                <path
                  d="M6 9l6 6 6-6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  className="text-text-muted"
                />
              </svg>
            </button>

            {advOpen && (
              <div className="px-6 pb-6 flex flex-col gap-4 border-t border-border">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                  <div>
                    <Label>Language</Label>
                    <Select value={language} onChange={setLanguage}>
                      {["English", "French", "Arabic"].map((l) => (
                        <option key={l}>{l}</option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label>Bloom's taxonomy target</Label>
                    <Select value={blooms} onChange={setBlooms}>
                      {BLOOMS.map((b) => (
                        <option key={b}>{b}</option>
                      ))}
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Additional instructions (optional)</Label>
                  <textarea
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="e.g. Focus on practical examples, avoid theoretical definitions…"
                    rows={3}
                    className="
                      w-full px-3 py-2.5 rounded-lg text-sm resize-y
                      bg-surface text-text
                      border border-border
                      outline-none placeholder-text-muted
                      hover:border-accent focus:border-primary
                      focus:ring-2 focus:ring-primary/10
                      transition-colors
                    "
                  />
                </div>

                <div className="flex flex-wrap gap-5">
                  {[
                    {
                      id: "verify",
                      label: "Auto-verify generated questions",
                      checked: autoVerify,
                      setter: setAutoVerify,
                    },
                    {
                      id: "dupes",
                      label: "Avoid duplicates from question bank",
                      checked: avoidDupes,
                      setter: setAvoidDupes,
                    },
                  ].map((opt) => (
                    <label
                      key={opt.id}
                      className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={opt.checked}
                        onChange={(e) => opt.setter(e.target.checked)}
                        className="accent-primary w-4 h-4"
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div className="lg:w-64 flex flex-col gap-4">

          {/* Summary */}
          <div className="bg-surface border border-border rounded-2xl p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-text mb-4">
              <FileTextOutlined className="text-primary" />
              Generation Summary
            </div>

            <div className="flex flex-col divide-y divide-border">
              {[
                { key: "Mode", val: genqtab === "prompt" ? "Prompt" : "Generate with Context" },
                ...(genqtab === "prompt"
                  ? [
                      {
                        key: "Prompt",
                        val: customPrompt.trim() ? `${customPrompt.trim().slice(0, 10)}${customPrompt.trim().length > 26 ? "..." : ""}` : "Not provided",
                        valClass: customPrompt.trim() ? "text-text" : "text-text-muted",
                      },
                    ]
                  : [
                      { key: "Course", val: courseName },
                      { key: "Chapter", val: chapterName },
                    ]),
                { key: "Type", val: typeLabels[qType] },
                {
                  key: "Questions",
                  val: count,
                  valClass: "text-primary text-xl font-medium",
                },
                {
                  key: "Difficulty",
                  val: diffLabel,
                  valClass:
                    difficulty === "easy"
                      ? "text-emerald-700"
                      : difficulty === "medium"
                      ? "text-amber-700"
                      : difficulty === "hard"
                      ? "text-red-700"
                      : "text-primary",
                },
              ].map((row) => (
                <div
                  key={row.key}
                  className="flex items-center justify-between py-2"
                >
                  <span className="text-xs text-text-muted">{row.key}</span>
                  <span
                    className={`text-sm font-medium text-text ${row.valClass || ""}`}
                  >
                    {row.val}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={handleGenerate}
              disabled={generating}
              className="
                mt-4 w-full h-11 rounded-xl
                bg-primary hover:bg-primary-hover
                text-white text-sm font-medium
                flex items-center justify-center gap-2
                transition-colors duration-150
                disabled:opacity-70 disabled:cursor-not-allowed
              "
            >
              {generating ? (
                <>
                  <LoadingOutlined spin />
                  Generating…
                </>
              ) : (
                <>
                  <StarOutlined />
                  Generate Questions
                </>
              )}
            </button>
          </div>

          {/* How it works */}
          <div className="bg-surface-alt border border-border rounded-2xl p-4">
            <div className="flex items-center gap-1.5 text-xs font-medium text-primary mb-2">
              <InfoCircleOutlined />
              How it works
            </div>
            <ul className="text-xs text-text-secondary space-y-1.5 list-disc list-inside">
              <li>AI scans chapter content &amp; objectives</li>
              <li>Questions aligned to difficulty &amp; Bloom's level</li>
              <li>Auto-verification runs asynchronously</li>
              <li>Review &amp; approve before adding to exam</li>
            </ul>
          </div>

          {/* Est. time */}
          <div className="flex items-center gap-3 px-4 py-3 bg-surface border border-border rounded-xl">
            <ClockCircleOutlined className="text-text-muted text-base" />
            <div>
              <div className="text-[11px] text-text-muted">Estimated time</div>
              <div className="text-sm font-medium text-text">{estTime}</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default GenerateQuestions;