import { useState } from "react";
import {
  CloseOutlined, FileTextOutlined, CheckCircleFilled,
  SearchOutlined, PlusOutlined, ExclamationCircleOutlined
} from "@ant-design/icons";

const MOCK_EXAMS = [
  { id: "e1", title: "Midterm Exam 2024", course: "Mathematics", questionCount: 20, dueDate: "2024-03-15" },
  { id: "e2", title: "Chapter 3 Quiz", course: "Physics", questionCount: 10, dueDate: "2024-02-28" },
  { id: "e3", title: "Final Exam", course: "Biology", questionCount: 40, dueDate: "2024-05-20" },
  { id: "e4", title: "Unit Test — Thermodynamics", course: "Chemistry", questionCount: 15, dueDate: "2024-03-01" },
];

export default function AddToExamModal({ selectedQuestions, onClose, onConfirm }) {
  const [examSearch, setExamSearch] = useState("");
  const [selectedExam, setSelectedExam] = useState(null);
  const [step, setStep] = useState(1); // 1 = select exam, 2 = confirm

  const filtered = MOCK_EXAMS.filter(e =>
    !examSearch || e.title.toLowerCase().includes(examSearch.toLowerCase()) || e.course.toLowerCase().includes(examSearch.toLowerCase())
  );

  const handleConfirm = () => {
    if (step === 1 && selectedExam) { setStep(2); return; }
    onConfirm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-surface rounded-2xl border border-border w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="text-base font-bold text-text">Add to Exam</h2>
            <p className="text-xs text-text-muted">{selectedQuestions.length} question{selectedQuestions.length !== 1 ? "s" : ""} selected</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-surface-alt flex items-center justify-center text-text-muted hover:text-text transition-all">
            <CloseOutlined className="text-sm" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex px-6 pt-4 gap-2">
          {[1, 2].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s ? "bg-primary text-white" : "bg-surface-alt text-text-muted"}`}>
                {step > s ? <CheckCircleFilled /> : s}
              </div>
              <span className={`text-xs ${step === s ? "text-text font-medium" : "text-text-muted"}`}>
                {s === 1 ? "Select Exam" : "Confirm"}
              </span>
              {s < 2 && <div className={`h-px w-8 ${step > s ? "bg-primary" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        <div className="p-6">
          {step === 1 ? (
            <>
              {/* Search */}
              <div className="relative mb-3">
                <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm" />
                <input
                  type="text"
                  value={examSearch}
                  onChange={e => setExamSearch(e.target.value)}
                  placeholder="Search exams..."
                  className="w-full pl-9 pr-4 py-2 bg-surface-alt border border-border rounded-lg text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>

              {/* Exam list */}
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {filtered.map(exam => (
                  <button
                    key={exam.id}
                    onClick={() => setSelectedExam(exam.id === selectedExam ? null : exam.id)}
                    className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${selectedExam === exam.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${selectedExam === exam.id ? "bg-primary" : "bg-surface-alt"}`}>
                      <FileTextOutlined className={`text-sm ${selectedExam === exam.id ? "text-white" : "text-text-muted"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text truncate">{exam.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-text-muted">{exam.course}</span>
                        <span className="text-border">·</span>
                        <span className="text-xs text-text-muted">{exam.questionCount} questions</span>
                      </div>
                    </div>
                    {selectedExam === exam.id && <CheckCircleFilled className="text-primary shrink-0 mt-0.5" />}
                  </button>
                ))}
              </div>

              {/* Create new exam option */}
              <button className="w-full mt-2 flex items-center gap-2 p-3 rounded-xl border border-dashed border-border hover:border-primary hover:bg-primary/5 text-text-muted hover:text-primary transition-all">
                <PlusOutlined className="text-sm" />
                <span className="text-sm">Create new exam</span>
              </button>
            </>
          ) : (
            /* Confirm step */
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-success/10 border border-success/20">
                <CheckCircleFilled className="text-success" />
                <div>
                  <p className="text-sm font-medium text-text">
                    {MOCK_EXAMS.find(e => e.id === selectedExam)?.title}
                  </p>
                  <p className="text-xs text-text-muted">Selected exam</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Questions to add ({selectedQuestions.length})</p>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {selectedQuestions.map(q => (
                    <div key={q.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-alt">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${q.type === "mcq" ? "bg-accent/10 text-accent" : "bg-ai/10 text-ai"}`}>
                        {q.type === "mcq" ? "MCQ" : "SA"}
                      </span>
                      <p className="text-xs text-text truncate flex-1">{q.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 rounded-xl bg-warning/10 border border-warning/20">
                <ExclamationCircleOutlined className="text-warning shrink-0 mt-0.5" />
                <p className="text-xs text-text-secondary">
                  Adding these questions will not remove them from the Question Bank.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border bg-surface-alt/50">
          {step === 2 && (
            <button onClick={() => setStep(1)} className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text transition-all">
              Back
            </button>
          )}
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-alt transition-all border border-border">
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedExam}
            className="px-5 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {step === 1 ? "Next →" : "Confirm & Add"}
          </button>
        </div>
      </div>
    </div>
  );
}