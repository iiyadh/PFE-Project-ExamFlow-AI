import { useState, useEffect, useCallback, useRef } from "react";
import api from "../lib/api";
import {
  LeftOutlined,
  RightOutlined,
  BookOutlined,
  FlagFilled,
  FlagOutlined,
  ClockCircleOutlined,
  AppstoreOutlined,
  CheckCircleFilled,
  ExclamationCircleFilled,
  CloseCircleOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { Link, useNavigate, useParams } from "react-router-dom";

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export default function ExamTakerPage() {
  const navigate = useNavigate();
  const { examId } = useParams();

  const [questions, setQuestions] = useState([]);
  const [attemptId, setAttemptId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [bookmarks, setBookmarks] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(90 * 60);
  const [showNav, setShowNav] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const answersRef = useRef(answers);
  const bookmarksRef = useRef(bookmarks);
  const submitted = useRef(false);
  answersRef.current = answers;
  bookmarksRef.current = bookmarks;

  // Start or resume attempt on mount
  useEffect(() => {
    const examMeta = JSON.parse(sessionStorage.getItem("currentExam") || "{}");
    const duration = examMeta.duration || 90;

    api.post("/exam-attempts", { examId }).then(({ data }) => {
      const { attempt, questions: qs } = data;
      setAttemptId(attempt._id);
      setQuestions(qs.map((q, i) => ({
        id: i,
        module: attempt.answers[i]?.chapter || "General",
        text: q.text,
        options: q.options || [],
        type: q.type,
      })));

      // Restore answers and bookmarks if resuming
      const restoredAnswers = {};
      const restoredBookmarks = new Set();
      (attempt.answers || []).forEach((a, i) => {
        if (a.chosenOptionIndex !== null && a.chosenOptionIndex !== undefined) {
          restoredAnswers[i] = a.chosenOptionIndex;
        }
        if (a.bookmarked) restoredBookmarks.add(i);
      });
      setAnswers(restoredAnswers);
      setBookmarks(restoredBookmarks);

      // Calculate remaining time
      const elapsed = Math.floor((Date.now() - new Date(attempt.startedAt).getTime()) / 1000);
      setTimeLeft(Math.max(0, duration * 60 - elapsed));

      localStorage.setItem("last_attempt_id", attempt._id);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [examId]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!attemptId) return;
    const interval = setInterval(() => {
      const payload = Object.keys(answersRef.current).map((qId) => ({
        index: parseInt(qId),
        chosenOptionIndex: answersRef.current[qId],
        bookmarked: bookmarksRef.current.has(parseInt(qId)),
      }));
      if (payload.length > 0) {
        api.put(`/exam-attempts/${attemptId}/answers`, { answers: payload }).catch(() => {});
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [attemptId]);

  // Countdown timer
  useEffect(() => {
    if (loading) return;
    const t = setInterval(() => {
      setTimeLeft((p) => {
        if (p <= 1) {
          clearInterval(t);
          if (!submitted.current && attemptId) {
            submitted.current = true;
            autoSubmit();
          }
          return 0;
        }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [loading, attemptId]);

  const autoSubmit = () => {
    const finalAnswers = answersRef.current
      ? Object.keys(answersRef.current).map((qId) => ({
          index: parseInt(qId),
          chosenOptionIndex: answersRef.current[qId],
          bookmarked: bookmarksRef.current.has(parseInt(qId)),
        }))
      : [];
    api.post(`/exam-attempts/${attemptId}/submit`, { finalAnswers })
      .catch(() => {})
      .finally(() => navigate(`/student/exams/${examId}/results`));
  };

  const q = questions[current] || {};
  const answered = Object.keys(answers).length;
  const bookmarked = bookmarks.size;
  const unanswered = questions.length - answered;
  const progress = questions.length > 0 ? (answered / questions.length) * 100 : 0;
  const isWarning = timeLeft < 300;
  const isCritical = timeLeft < 60;

  const toggleBookmark = useCallback(() => {
    if (q.id === undefined) return;
    setBookmarks((prev) => {
      const next = new Set(prev);
      next.has(q.id) ? next.delete(q.id) : next.add(q.id);
      return next;
    });
  }, [q.id]);

  const selectAnswer = (idx) => {
    setAnswers((prev) => ({ ...prev, [q.id]: idx }));
  };

  const goTo = (idx) => {
    setCurrent(idx);
    setShowNav(false);
  };

  const openReviewPanel = () => {
    setShowNav(false);
    localStorage.setItem("exam_session", JSON.stringify({
      examId,
      attemptId,
      answers,
      bookmarks: [...bookmarks],
      questions: questions.map((qq) => ({ text: qq.text, module: qq.module })),
    }));
    navigate(`/student/exams/${examId}/review`);
  };

  const handleConfirmSubmit = async () => {
    if (submitting || submitted.current) return;
    submitted.current = true;
    setSubmitting(true);
    setShowConfirm(false);

    const finalAnswers = questions.map((_, i) => ({
      index: i,
      chosenOptionIndex: answers[i] ?? null,
      bookmarked: bookmarks.has(i),
    }));
    try {
      await api.post(`/exam-attempts/${attemptId}/submit`, { finalAnswers });
    } catch (_) { /* navigate anyway */ }
    localStorage.setItem("last_attempt_id", attemptId);
    navigate(`/student/exams/${examId}/results`);
  };

  const getQStatus = (qq) => {
    const idx = qq.id;
    if (answers[idx] !== undefined && bookmarks.has(idx)) return "bookmarked-answered";
    if (answers[idx] !== undefined) return "answered";
    if (bookmarks.has(idx)) return "bookmarked";
    return "unanswered";
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-5rem)] bg-bg! flex items-center justify-center">
        <div className="text-primary text-sm">Loading exam…</div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-bg! flex flex-col">
      <div className="px-6 pt-3 pb-1">
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
                to={`/student/exams/${examId}/instructions`}
                className="text-text-secondary hover:text-primary font-medium transition-colors duration-150"
              >
                Instructions
              </Link>
            </li>
            <li>
              <RightOutlined className="text-text-muted!" style={{ fontSize: 10 }} />
            </li>
            <li className="text-primary font-medium">
              Take Exam
            </li>
          </ol>
        </nav>
      </div>

      {/* Header */}
      <header className="bg-surface! border-b! border-border! px-6 py-3 flex items-center justify-between sticky top-20 z-20">
        <div className="flex items-center gap-3">
          <BookOutlined className="text-primary!" />
          <div>
            <p className="text-xs! text-text-muted!">{JSON.parse(sessionStorage.getItem("currentExam") || "{}").title || "Exam"}</p>
            <p className="text-sm! font-semibold text-text!">Question {current + 1} of {questions.length}</p>
          </div>
        </div>

        {/* Timer */}
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-base! border transition-colors
          ${isCritical
            ? "bg-error/10! border-error/30! text-error! animate-pulse"
            : isWarning
            ? "bg-warning/10! border-warning/30! text-warning!"
            : "bg-surface-alt! border-border! text-text!"}
        `}>
          <ClockCircleOutlined />
          {formatTime(timeLeft)}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNav(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border! text-sm! text-text-secondary! hover:bg-surface-alt! transition-colors"
          >
            <AppstoreOutlined />
            <span className="hidden sm:inline">Navigator</span>
          </button>
          <button
            onClick={() => setShowConfirm(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary! hover:bg-primary-hover! text-white! text-sm! font-semibold transition-colors"
          >
            <SendOutlined />
            Submit
          </button>
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-1 bg-border!">
        <div
          className="h-full bg-primary! transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Main */}
      <div className="flex-1 flex">
        {/* Question area */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
          <div className="w-full max-w-2xl space-y-6">
            {/* Question header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-text-muted! bg-surface-alt! border border-border! px-2 py-1 rounded-lg">
                  {q.module || "General"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-text-muted!">
                  {current + 1} / {questions.length}
                </span>
                <button
                  onClick={toggleBookmark}
                  className={`p-2 rounded-lg border transition-colors ${
                    bookmarks.has(q.id)
                      ? "bg-warning/10! border-warning/30! text-warning!"
                      : "border-border! text-text-muted! hover:text-warning!"
                  }`}
                >
                  {bookmarks.has(q.id) ? <FlagFilled /> : <FlagOutlined />}
                </button>
              </div>
            </div>

            {/* Question card */}
            <div className="bg-surface! rounded-2xl border border-border! p-8">
              <p className="text-lg font-semibold text-text! leading-relaxed mb-8">
                {q.text}
              </p>

              <div className="space-y-3">
                {(q.options || []).map((opt, i) => {
                  const isSelected = answers[q.id] === i;
                  return (
                    <button
                      key={i}
                      onClick={() => selectAnswer(i)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left! transition-all group
                        ${isSelected
                          ? "bg-primary/8! border-primary! text-text!"
                          : "bg-surface-alt! border-border! text-text-secondary! hover:border-primary/40! hover:bg-primary/5!"}
                      `}
                    >
                      <span className={`w-8 h-8 rounded-lg border-2! flex items-center justify-center text-sm! font-bold shrink-0 transition-colors
                        ${isSelected
                          ? "bg-primary! border-primary! text-white!"
                          : "border-border! text-text-muted! group-hover:border-primary/50!"}
                      `}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className={`text-sm font-medium ${isSelected ? "text-text!" : ""}`}>
                        {opt}
                      </span>
                      {isSelected && (
                        <CheckCircleFilled className="ml-auto text-primary!" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrent((p) => Math.max(0, p - 1))}
                disabled={current === 0}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm! font-medium transition-colors
                  ${current === 0
                    ? "border-border! text-text-muted! cursor-not-allowed opacity-50"
                    : "border-border! text-text-secondary! hover:bg-surface-alt!"}
                `}
              >
                <LeftOutlined /> Previous
              </button>

              <div className="flex items-center gap-1">
                {questions.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === current
                        ? "bg-primary! w-6"
                        : answers[i] !== undefined
                        ? "bg-success!"
                        : "bg-border!"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={() => setCurrent((p) => Math.min(questions.length - 1, p + 1))}
                disabled={current === questions.length - 1}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm! font-medium transition-colors
                  ${current === questions.length - 1
                    ? "bg-surface-alt! text-text-muted! cursor-not-allowed opacity-50 border border-border!"
                    : "bg-primary! hover:bg-primary-hover! text-white!"}
                `}
              >
                Next <RightOutlined />
              </button>
            </div>
          </div>
        </div>

        {/* Side stats strip */}
        <div className="hidden lg:flex flex-col gap-4 p-4 w-52 bg-surface! border-l! border-border!">
          <h3 className="text-xs font-semibold text-text-muted! uppercase tracking-wider pt-2">Progress</h3>
          {[
            { label: "Answered", val: answered, color: "!bg-[var(--color-success)]", icon: <CheckCircleFilled className="text-success!" /> },
            { label: "Unanswered", val: unanswered, color: "!bg-[var(--color-border)]", icon: <ExclamationCircleFilled className="text-text-muted!" /> },
            { label: "Bookmarked", val: bookmarked, color: "!bg-[var(--color-warning)]", icon: <FlagFilled className="text-warning!" /> },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-2 p-3 rounded-xl bg-surface-alt! border border-border!">
              {s.icon}
              <div className="flex-1">
                <p className="text-xs text-text-muted!">{s.label}</p>
                <p className="text-lg font-bold text-text! leading-none">{s.val}</p>
              </div>
            </div>
          ))}

          <div className="mt-2">
            <div className="flex justify-between text-xs! text-text-muted! mb-1.5">
              <span>Completion</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-border! rounded-full overflow-hidden">
              <div
                className="h-full bg-success! rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="mt-auto space-y-2">
            <div className="flex items-center gap-2 text-xs!">
              <span className="w-3 h-3 rounded-sm bg-primary" /> Answered
            </div>
            <div className="flex items-center gap-2 text-xs!">
              <span className="w-3 h-3 rounded-sm bg-warning" /> Bookmarked
            </div>
            <div className="flex items-center gap-2 text-xs!">
              <span className="w-3 h-3 rounded-sm bg-border" /> Unanswered
            </div>
          </div>
        </div>
      </div>

      {/* Navigator Drawer */}
      {showNav && (
        <div className="fixed inset-x-0 bottom-0 top-20 z-30 flex">
          <div className="flex-1 bg-black/40!" onClick={() => setShowNav(false)} />
          <div className="w-80 bg-surface! border-l! border-border! flex flex-col p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-text!">Question Navigator</h3>
              <button onClick={() => setShowNav(false)} className="text-text-muted!">
                <CloseCircleOutlined />
              </button>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((qq, i) => {
                const status = getQStatus(qq);
                return (
                  <button
                    key={qq.id}
                    onClick={() => goTo(i)}
                    className={`aspect-square rounded-lg text-xs! font-bold border transition-colors
                      ${i === current ? "ring-2! ring-primary! ring-offset-1!" : ""}
                      ${status === "answered" ? "bg-primary! border-primary! text-white!" :
                        status === "bookmarked" ? "bg-warning/15! border-warning! text-warning!" :
                        status === "bookmarked-answered" ? "bg-warning! border-warning! text-white!" :
                        "bg-surface-alt! border-border! text-text-muted!"}
                    `}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
            <div className="mt-6 space-y-2 text-xs!">
              {[
                { color: "bg-[var(--color-primary)]!", label: "Answered" },
                { color: "bg-[var(--color-warning)]!", label: "Bookmarked & Answered" },
                { color: "bg-[var(--color-warning)]/15! border border-[var(--color-warning)]!", label: "Bookmarked" },
                { color: "bg-[var(--color-surface-alt)]! border border-[var(--color-border)]!", label: "Unanswered" },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-2 text-text-secondary!">
                  <span className={`w-4 h-4 rounded ${l.color}`} /> {l.label}
                </div>
              ))}
            </div>
            <button
              onClick={openReviewPanel}
              className="mt-5 w-full py-2.5 rounded-xl border border-border! text-sm! text-text-secondary! hover:bg-surface-alt! transition-colors"
            >
              Open Review Panel
            </button>
          </div>
        </div>
      )}

      {/* Submit Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50!">
          <div className="bg-surface! rounded-2xl border border-border! p-6 w-full max-w-sm shadow-2xl!">
            <div className="text-center! mb-6">
              <div className="w-12 h-12 rounded-full bg-warning/10! flex items-center justify-center mx-auto mb-3">
                <ExclamationCircleFilled className="text-! text-xl!" />
              </div>
              <h3 className="font-bold text-text! mb-1">Submit Exam?</h3>
              <p className="text-sm! text-text-muted!">This action cannot be undone.</p>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-6 text-center!">
              {[
                { val: answered, label: "Answered", color: "!text-[var(--color-success)]" },
                { val: unanswered, label: "Unanswered", color: "!text-[var(--color-error)]" },
                { val: bookmarked, label: "Flagged", color: "!text-[var(--color-warning)]" },
              ].map((s) => (
                <div key={s.label} className="bg-surface-alt! rounded-xl p-3">
                  <div className={`text-xl font-bold ${s.color}`}>{s.val}</div>
                  <div className="text-xs text-text-muted!">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-border! text-sm! text-text-secondary! hover:bg-surface-alt! transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSubmit}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl bg-primary! hover:bg-primary-hover! text-white! text-sm! font-semibold transition-colors disabled:opacity-60"
              >
                {submitting ? "Submitting…" : "Confirm Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
