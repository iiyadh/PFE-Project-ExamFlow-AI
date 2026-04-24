import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../lib/api";
import { CheckOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, SaveOutlined, RightOutlined } from "@ant-design/icons";

const INITIAL_QUESTIONS = [
  {
    id: 1, text: "What is the primary pigment responsible for capturing light energy during photosynthesis?",
    type: "MCQ",
    options: ["Carotenoid", "Chlorophyll a", "Xanthophyll", "Phycocyanin"], correct: 1,
    difficulty: "Medium",
  },
  {
    id: 2, text: "Which stage of photosynthesis directly produces ATP and NADPH without fixing carbon?",
    type: "MCQ",
    options: ["Light-dependent", "Calvin cycle", "Krebs cycle", "Glycolysis"], correct: 0,
    difficulty: "Easy",
  },
  {
    id: 3, text: "In the Calvin cycle, how many CO₂ molecules are needed to produce one molecule of glucose?",
    type: "MCQ",
    options: ["3", "4", "6", "12"], correct: 2,
    difficulty: "Hard",
  },
  {
    id: 4, text: "Where in the chloroplast does the Calvin cycle take place?",
    type: "MCQ",
    options: ["Thylakoid membrane", "Stroma", "Outer membrane", "Lumen"], correct: 1,
    difficulty: "Easy",
  },
  {
    id: 5, text: "What is the role of water molecules in the light-dependent reactions of photosynthesis?",
    type: "MCQ",
    options: ["Electron acceptor", "CO₂ carrier", "Electron donor", "ATP stabilizer"], correct: 2,
    difficulty: "Medium",
  },
  {
    id: 6,
    text: "Name the gas released as a byproduct of photosynthesis.",
    type: "Short Answer",
    answer: "Oxygen",
    difficulty: "Easy",
  },
  {
    id: 7,
    text: "State the primary function of RuBisCO in the Calvin cycle.",
    type: "Short Answer",
    answer: "It catalyzes carbon fixation by attaching CO₂ to RuBP.",
    difficulty: "Medium",
  },
];

const DIFFICULTY_STYLES = {
  Easy:   "bg-[#D1FAE5] text-[#065F46]",
  Medium: "bg-[#FEF3C7] text-[#92400E]",
  Hard:   "bg-[#FEE2E2] text-[#991B1B]",
};

const OPTION_LETTERS = ["A", "B", "C", "D"];

const QUESTION_DIFFICULTIES = ["Easy", "Medium", "Hard"];
const QUESTION_TYPES = ["Single Answer", "Multiple Answer", "Short Answer"];

const GeneratedPreview = ({ chapter = "Chapter 4 — Photosynthesis", onSave, onDiscard }) => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const activeChapter = state?.chapter || chapter;
  const activeCourse = state?.course || "";
  const className = state?.className;
  const [questions, setQuestions] = useState(state?.questions || INITIAL_QUESTIONS);
  const [selected, setSelected] = useState(new Set(
    (state?.questions || INITIAL_QUESTIONS).slice(0, 4).map((q) => q.id)
  ));
  const [saving, setSaving] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [draftQuestion, setDraftQuestion] = useState(null);

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const removeQuestion = (id) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    setSelected((prev) => { const n = new Set(prev); n.delete(id); return n; });
  };

  const openEdit = (question) => {
    setEditingQuestionId(question.id);
    setDraftQuestion({
      ...question,
      options: question.options ? [...question.options] : ["", "", "", ""],
      answer: question.answer || "",
      type: question.type || "MCQ",
    });
  };

  const updateDraftOption = (index, value) => {
    setDraftQuestion((prev) => {
      if (!prev) return prev;
      const nextOptions = [...prev.options];
      nextOptions[index] = value;
      return { ...prev, options: nextOptions };
    });
  };

  const saveEdit = () => {
    if (!draftQuestion) return;

    setQuestions((prev) =>
      prev.map((question) =>
        question.id === draftQuestion.id ? draftQuestion : question
      )
    );
    setEditingQuestionId(null);
    setDraftQuestion(null);
  };

  const closeEdit = () => {
    setEditingQuestionId(null);
    setDraftQuestion(null);
  };

  const handleSaveToBank = async (questionsToSave) => {
    if (onSave) { onSave(questionsToSave); return; }
    setSaving(true);
    try {
      await Promise.all(
        questionsToSave.map((q) => {
          const hasOptions = q.type === "Single Answer" || q.type === "Multiple Answer";
          return api.post("/questions", {
            text: q.text,
            type:
              q.type === "Single Answer" ? "single_answer" :
              q.type === "Multiple Answer" ? "multiple_answer" : "short_answer",
            difficulty: q.difficulty.toLowerCase(),
            options: hasOptions ? q.options : null,
            correctAnswer: hasOptions ? q.correct : null,
            source: "ai",
            chapter: activeChapter || undefined,
            course: activeCourse || undefined,
          });
        })
      );
      navigate(state?.classId ? `/teacher/question-bank/${state.classId}` : "/teacher/classes");
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  const selectAll = () => setSelected(new Set(questions.map((q) => q.id)));
  const clearAll = () => setSelected(new Set());

  return (
    <div className="bg-bg min-h-screen p-8 font-sans">
      <nav className="max-w-2xl mx-auto text-sm my-3" aria-label="Breadcrumb">
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
                <span className="text-text-secondary font-medium">{className}</span>
              </li>
            </>
          )}
          <li>
            <RightOutlined className="text-text-muted!" style={{ fontSize: 10 }} />
          </li>
          <li className="text-primary font-medium">
            Generated Preview
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className="max-w-2xl mx-auto flex items-center gap-3 mb-5">
        <div>
          <p className="text-text font-medium text-base">Preview generated questions</p>
          <p className="text-text-muted text-sm">{activeChapter}</p>
        </div>
        <div className="ml-auto bg-[#EDE9FE] text-[#5B21B6] text-xs font-medium px-3 py-1 rounded-full">
          AI generated · {questions.length} questions
        </div>
      </div>

      {/* Toolbar */}
      <div className="max-w-2xl mx-auto flex flex-wrap items-center gap-2 mb-4">
        <span className="text-xs text-text-secondary">{selected.size} of {questions.length} selected</span>
        <button onClick={selectAll} className="px-3 py-1.5 rounded-lg border border-border bg-surface text-xs text-text-secondary hover:bg-surface-alt transition-colors">Select all</button>
        <button onClick={clearAll} className="px-3 py-1.5 rounded-lg border border-border bg-surface text-xs text-text-secondary hover:bg-surface-alt transition-colors">Clear</button>
        <button className="ml-auto px-3 py-1.5 rounded-lg border border-ai bg-ai text-white text-xs hover:opacity-90 transition-opacity flex items-center gap-1.5">
          <ReloadOutlined style={{ fontSize: 11 }} /> Regenerate selected
        </button>
        <button onClick={() => handleSaveToBank(questions.filter((q) => selected.has(q.id)))} disabled={saving} className="px-3 py-1.5 rounded-lg border border-primary bg-primary text-white text-xs hover:bg-primary-hover transition-colors flex items-center gap-1.5 disabled:opacity-60">
          <SaveOutlined style={{ fontSize: 11 }} /> {saving ? "Saving…" : "Save to bank"}
        </button>
      </div>

      {/* Question Cards */}
      <div className="max-w-2xl mx-auto flex flex-col gap-3">
        {questions.map((q) => (
          <div
            key={q.id}
            className={`bg-surface rounded-2xl border transition-all duration-150 px-5 py-4
              ${selected.has(q.id) ? "border-ai shadow-[0_0_0_2px_#EDE9FE]" : "border-border"}
            `}
          >
            {/* Question Header */}
            <div className="flex items-start gap-3 mb-3">
              {/* Checkbox */}
              <button
                onClick={() => toggleSelect(q.id)}
                className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors
                  ${selected.has(q.id) ? "bg-ai border-ai text-white" : "border-border bg-surface"}
                `}
              >
                {selected.has(q.id) && <CheckOutlined style={{ fontSize: 10 }} />}
              </button>
              {/* Q number */}
              <div className="w-6 h-6 rounded-full bg-surface-alt border border-[#DBEAFE] flex items-center justify-center text-[11px] font-medium text-primary shrink-0 mt-0.5">
                {q.id}
              </div>
              {/* Text */}
              <p className="text-sm text-text leading-relaxed flex-1">{q.text}</p>
              {/* Actions */}
              <div className="flex gap-1.5 ml-2">
                <button
                  onClick={() => openEdit(q)}
                  className="px-2 py-1 rounded-md border border-border text-[11px] text-text-secondary hover:bg-surface-alt transition-colors flex items-center gap-1"
                >
                  <EditOutlined style={{ fontSize: 10 }} /> Edit
                </button>
                <button
                  onClick={() => removeQuestion(q.id)}
                  className="px-2 py-1 rounded-md border border-border text-[11px] text-text-secondary hover:bg-[#FEF2F2] hover:text-error hover:border-[#FCA5A5] transition-colors flex items-center gap-1"
                >
                  <DeleteOutlined style={{ fontSize: 10 }} />
                </button>
              </div>
            </div>

            {/* Options */}
            {q.type === "Short Answer" ? (
              <div className="pl-14 mb-3">
                <div className="px-3 py-2.5 rounded-lg border border-[#DBEAFE] bg-[#EFF6FF] text-xs text-[#1E3A8A]">
                  <span className="font-semibold text-[11px] uppercase tracking-wide mr-1.5">Expected answer:</span>
                  {q.answer}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-1.5 pl-14 mb-3">
                {q.options.map((opt, i) => {
                  const isCorrect =
                    q.type === "Multiple Answer"
                      ? Array.isArray(q.correct) && q.correct.includes(i)
                      : i === q.correct;
                  return (
                    <div
                      key={i}
                      className={`px-3 py-2 rounded-lg border text-xs flex items-center gap-2
                        ${isCorrect
                          ? "border-[#A7F3D0] bg-[#ECFDF5] text-[#065F46]"
                          : "border-border bg-surface-alt text-text-secondary"
                        }
                      `}
                    >
                      <span className="font-semibold text-[11px] min-w-3.5">{OPTION_LETTERS[i]}</span>
                      {opt}
                      {isCorrect && <CheckOutlined style={{ fontSize: 9, marginLeft: "auto" }} />}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Meta tags */}
            <div className="flex items-center gap-2 pl-14 flex-wrap">
              <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${DIFFICULTY_STYLES[q.difficulty]}`}>
                {q.difficulty}
              </span>
              <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#EDE9FE] text-[#5B21B6]">
                {q.type || "MCQ"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {editingQuestionId && draftQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-2xl rounded-2xl bg-surface border border-border shadow-2xl">
            <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-border">
              <div>
                <p className="text-sm font-medium text-text">Edit question</p>
                <p className="text-xs text-text-muted">Update the question content and save changes locally.</p>
              </div>
              <button
                onClick={closeEdit}
                className="rounded-lg px-2 py-1 text-sm text-text-secondary hover:bg-surface-alt"
              >
                Close
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Question text</label>
                <textarea
                  value={draftQuestion.text}
                  onChange={(e) => setDraftQuestion((prev) => prev ? { ...prev, text: e.target.value } : prev)}
                  rows={4}
                  className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-text outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">Type</label>
                  <select
                    value={draftQuestion.type}
                    onChange={(e) =>
                      setDraftQuestion((prev) => {
                        if (!prev) return prev;
                        const nextType = e.target.value;
                        if (nextType === "Short Answer") {
                          return { ...prev, type: nextType, answer: prev.answer || "", options: ["", "", "", ""], correct: null };
                        }
                        if (nextType === "Multiple Answer") {
                          return { ...prev, type: nextType, options: prev.options?.length ? prev.options : ["", "", "", ""], correct: [] };
                        }
                        return { ...prev, type: nextType, options: prev.options?.length ? prev.options : ["", "", "", ""], correct: typeof prev.correct === "number" ? prev.correct : 0 };
                      })
                    }
                    className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-text outline-none focus:border-primary"
                  >
                    {QUESTION_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    {draftQuestion.type === "Short Answer" ? "Expected answer" :
                     draftQuestion.type === "Multiple Answer" ? "Correct options (toggle)" : "Correct option"}
                  </label>
                  {draftQuestion.type === "Short Answer" ? (
                    <input
                      value={draftQuestion.answer}
                      onChange={(e) => setDraftQuestion((prev) => prev ? { ...prev, answer: e.target.value } : prev)}
                      placeholder="Expected short answer"
                      className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-text outline-none focus:border-primary"
                    />
                  ) : draftQuestion.type === "Multiple Answer" ? (
                    <div className="flex flex-wrap gap-2">
                      {draftQuestion.options.map((_, index) => {
                        const selected = Array.isArray(draftQuestion.correct) && draftQuestion.correct.includes(index);
                        return (
                          <button
                            key={index}
                            type="button"
                            onClick={() => setDraftQuestion((prev) => {
                              if (!prev) return prev;
                              const current = Array.isArray(prev.correct) ? prev.correct : [];
                              const next = current.includes(index)
                                ? current.filter((x) => x !== index)
                                : [...current, index];
                              return { ...prev, correct: next };
                            })}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                              selected ? "bg-success text-white border-success" : "border-border text-text-secondary hover:border-primary"
                            }`}
                          >
                            {OPTION_LETTERS[index]}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <select
                      value={draftQuestion.correct}
                      onChange={(e) => setDraftQuestion((prev) => prev ? { ...prev, correct: Number(e.target.value) } : prev)}
                      className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-text outline-none focus:border-primary"
                    >
                      {draftQuestion.options.map((_, index) => (
                        <option key={index} value={index}>{OPTION_LETTERS[index]}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">Difficulty</label>
                  <select
                    value={draftQuestion.difficulty}
                    onChange={(e) => setDraftQuestion((prev) => prev ? { ...prev, difficulty: e.target.value } : prev)}
                    className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-text outline-none focus:border-primary"
                  >
                    {QUESTION_DIFFICULTIES.map((difficulty) => (
                      <option key={difficulty} value={difficulty}>{difficulty}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">Topic</label>
                  <input
                    value={draftQuestion.topic}
                    onChange={(e) => setDraftQuestion((prev) => prev ? { ...prev, topic: e.target.value } : prev)}
                    className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-text outline-none focus:border-primary"
                  />
                </div>
              </div>

              {(draftQuestion.type === "Single Answer" || draftQuestion.type === "Multiple Answer") && (
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">Options</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {draftQuestion.options.map((option, index) => (
                      <div key={index} className="space-y-1">
                        <div className="text-[11px] font-semibold text-text-muted">Option {OPTION_LETTERS[index]}</div>
                        <input
                          value={option}
                          onChange={(e) => updateDraftOption(index, e.target.value)}
                          className="w-full rounded-xl border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 px-6 py-5 border-t border-border">
              <button
                onClick={closeEdit}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-border bg-surface text-sm text-text-secondary hover:bg-surface-alt transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-primary bg-primary text-sm text-white hover:bg-primary-hover transition-colors"
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="max-w-2xl mx-auto flex items-center gap-3 mt-6">
        <span className="text-xs text-text-muted mr-auto">
          {selected.size} of {questions.length} selected will be saved
        </span>
        <button
          onClick={() => {
            if (onDiscard) {
              onDiscard();
              return;
            }
            navigate("/teacher/genques");
          }}
          className="px-4 py-2 rounded-xl border border-border bg-surface text-sm text-text-secondary hover:bg-surface-alt transition-colors"
        >
          Discard all
        </button>
        <button
          onClick={() => handleSaveToBank(questions.filter((q) => selected.has(q.id)))}
          disabled={saving}
          className="px-4 py-2 rounded-xl border border-primary bg-primary text-white text-sm hover:bg-primary-hover transition-colors flex items-center gap-2 disabled:opacity-60"
        >
          <SaveOutlined style={{ fontSize: 12 }} />
          {saving ? "Saving…" : "Save selected"}
        </button>
      </div>
    </div>
  );
}

export default GeneratedPreview;