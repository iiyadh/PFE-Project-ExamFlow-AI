import { useState, useCallback } from "react";
import { Link, useLocation , useParams } from "react-router-dom";
import QuestionSearchBar from "../Components/QuestionSearchBar";
import QuestionFiltersSidebar from "../Components/QuestionFiltersSidebar";
import QuestionResultGrid from "../Components/QuestionResultGrid";
import BulkSelectToolbar from "../Components/BulkSelectToolbar";
import AddToExamModal from "../Components/AddToExamModal";
import PaginationControls from "../Components/PaginationControls";
import QuestionEditor from "../Components/QuestionEditor";
import QuestionPreviewModal from "../Components/QuestionPreviewModal";
import {
  DatabaseOutlined, PlusOutlined, DownloadOutlined, FilterOutlined,
  CheckCircleFilled, ExclamationCircleOutlined, RightOutlined,
} from "@ant-design/icons";

const INITIAL_QUESTIONS = Array.from({ length: 48 }, (_, i) => ({
  id: `q-${i + 1}`,
  type: i % 3 === 0 ? "short_answer" : "mcq",
  difficulty: ["easy", "medium", "hard"][i % 3],
  chapter: `Chapter ${(i % 6) + 1}`,
  course: ["Mathematics", "Physics", "Biology", "Chemistry"][i % 4],
  text: [
    "What is the derivative of sin(x) with respect to x?",
    "Explain Newton's second law of motion and provide an example.",
    "Which organelle is responsible for energy production in cells?",
    "What is the chemical formula for water?",
    "Solve for x: 2x + 5 = 13",
    "Describe the process of photosynthesis.",
    "What is the speed of light in vacuum?",
    "Define osmosis and explain its importance in biology.",
  ][i % 8],
  options: i % 3 !== 0 ? ["cos(x)", "-cos(x)", "-sin(x)", "tan(x)"] : null,
  correctAnswer: i % 3 !== 0 ? 0 : null,
  status: ["approved", "pending", "flagged"][i % 3],
  score: Math.floor(70 + (i * 13) % 30),
  tags: [["calculus", "trigonometry"], ["mechanics", "forces"], ["cell biology"], ["chemistry", "formulas"]][i % 4],
  createdAt: new Date(Date.now() - i * 86400000 * 2).toISOString(),
  source: i % 5 === 0 ? "manual" : "ai",
}));

export default function QuestionBankPage() {
  const location = useLocation();
  const className = location.state?.className;

  // Core data
  const [questions, setQuestions] = useState(INITIAL_QUESTIONS);

  // UI
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ type: [], difficulty: [], status: [], course: [], chapter: [], source: [] });
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [viewMode, setViewMode] = useState("grid");

  // Modals
  const [showAddToExam, setShowAddToExam] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [previewQuestion, setPreviewQuestion] = useState(null);
  const [deleteConfirmIds, setDeleteConfirmIds] = useState([]);

  // Toast
  const [toast, setToast] = useState(null);
  const { classId } = useParams();

  const pageSize = 12;

  // ── Filtering ────────────────────────────────────────────────────────────────
  const filtered = questions.filter((q) => {
    const matchSearch = !search
      || q.text.toLowerCase().includes(search.toLowerCase())
      || q.tags?.some(t => t.includes(search.toLowerCase()));
    const matchType = !filters.type.length || filters.type.includes(q.type);
    const matchDiff = !filters.difficulty.length || filters.difficulty.includes(q.difficulty);
    const matchStatus = !filters.status.length || filters.status.includes(q.status);
    const matchCourse = !filters.course.length || filters.course.includes(q.course);
    const matchSource = !filters.source?.length || filters.source.includes(q.source);
    return matchSearch && matchType && matchDiff && matchStatus && matchCourse && matchSource;
  });

  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleFilterChange = (key, val) => {
    setFilters(prev => ({ ...prev, [key]: val }));
    setCurrentPage(1);
  };

  const activeFilterCount = Object.values(filters).flat().length;

  // ── Selection ────────────────────────────────────────────────────────────────
  const handleSelect = useCallback((id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedIds.length === paginated.length) setSelectedIds([]);
    else setSelectedIds(paginated.map(q => q.id));
  }, [selectedIds, paginated]);

  // ── Add / Edit ───────────────────────────────────────────────────────────────
  const handleOpenAdd = () => {
    setEditingQuestion(null);
    setShowEditor(true);
  };

  const handleOpenEdit = (question) => {
    setEditingQuestion(question);
    setShowEditor(true);
  };

  const handleSaveQuestion = (formData) => {
    const tags = formData.tags
      ? formData.tags.split(",").map(t => t.trim()).filter(Boolean)
      : [];

    if (editingQuestion) {
      setQuestions(prev => prev.map(q =>
        q.id === editingQuestion.id
          ? {
              ...q,
              text: formData.question,
              type: formData.type === "MCQ" ? "mcq" : "short_answer",
              difficulty: formData.difficulty,
              course: formData.course,
              chapter: formData.chapter,
              options: formData.type === "MCQ" ? formData.options : null,
              correctAnswer: formData.type === "MCQ" ? formData.correctAnswer : null,
              answer: formData.type !== "MCQ" ? formData.answer : undefined,
              tags,
              status: "pending",
            }
          : q
      ));
      showToast("Question updated successfully");
    } else {
      const newQ = {
        id: `q-${Date.now()}`,
        text: formData.question,
        type: formData.type === "MCQ" ? "mcq" : "short_answer",
        difficulty: formData.difficulty,
        course: formData.course,
        chapter: formData.chapter,
        options: formData.type === "MCQ" ? formData.options : null,
        correctAnswer: formData.type === "MCQ" ? formData.correctAnswer : null,
        answer: formData.type !== "MCQ" ? formData.answer : undefined,
        status: "pending",
        score: null,
        tags,
        createdAt: new Date().toISOString(),
        source: "manual",
      };
      setQuestions(prev => [newQ, ...prev]);
      showToast("Question added to the bank");
    }

    setShowEditor(false);
    setEditingQuestion(null);
  };

  const handleCancelEditor = () => {
    setShowEditor(false);
    setEditingQuestion(null);
  };

  // ── Delete ───────────────────────────────────────────────────────────────────
  const handleRequestDelete = (idOrIds) => {
    setDeleteConfirmIds(Array.isArray(idOrIds) ? idOrIds : [idOrIds]);
  };

  const handleConfirmDelete = () => {
    const count = deleteConfirmIds.length;
    setQuestions(prev => prev.filter(q => !deleteConfirmIds.includes(q.id)));
    setSelectedIds(prev => prev.filter(id => !deleteConfirmIds.includes(id)));
    setDeleteConfirmIds([]);
    showToast(`${count} question${count !== 1 ? "s" : ""} deleted`);
  };

  // ── Preview ──────────────────────────────────────────────────────────────────
  const handlePreview = (question) => setPreviewQuestion(question);

  return (
    <div className="min-h-screen bg-bg text-text font-['DM_Sans',sans-serif]">

      
      {/* Header */}
      <div className="bg-surface border-b border-border px-6 py-4 sticky top-20 z-30">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <DatabaseOutlined className="text-white text-base" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-text leading-tight">Question Bank</h1>
              <p className="text-xs text-text-muted">{filtered.length} questions available</p>
            </div>
          </div>

          <div className="flex-1 max-w-xl hidden md:block">
            <QuestionSearchBar value={search} onChange={setSearch} />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(v => !v)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${sidebarOpen ? "bg-primary text-white border-primary" : "border-border text-text-secondary hover:border-primary hover:text-primary bg-surface"}`}
            >
              <FilterOutlined />
              <span className="hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && (
                <span className="bg-white text-primary text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <button
            className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all bg-surface text-text-secondary hover:bg-surface-alt hover:text-text"
              >
              <Link to={`/teacher/genques/${classId}`} state={{ className }}> Generate Question</Link>
            </button>
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-all shadow-sm"
            >
              <PlusOutlined />
              <span className="hidden sm:inline">New Question</span>
            </button>
          </div>
        </div>

        <div className="max-w-[1600px] mx-auto mt-3 md:hidden">
          <QuestionSearchBar value={search} onChange={setSearch} />
        </div>

        <nav className="max-w-[1600px] mx-auto mt-2 text-sm" aria-label="Breadcrumb">
          <ol className="list-none p-0 inline-flex items-center gap-1.5">
            <li>
              <Link
                to="/teacher/classes"
                className="text-text-secondary hover:text-primary font-medium transition-colors duration-150"
              >
                Classes
              </Link>
            </li>
            <li>
              <RightOutlined className="text-text-muted" style={{ fontSize: 10 }} />
            </li>
            {className && (
              <>
                <li>
                  <span className="text-text-secondary font-medium">{className}</span>
                </li>
                <li>
                  <RightOutlined className="text-text-muted" style={{ fontSize: 10 }} />
                </li>
              </>
            )}
            <li className="text-primary font-medium">
              Question Bank
            </li>
          </ol>
        </nav>
      </div>

      <div className="max-w-[1600px] mx-auto flex gap-0">
        {/* Sidebar */}
        <div className={`transition-all duration-300 overflow-hidden ${sidebarOpen ? "w-72 min-w-[288px]" : "w-0 min-w-0"}`}>
          <div className="sticky top-[73px] h-[calc(100vh-73px)] overflow-y-auto p-4">
            <QuestionFiltersSidebar filters={filters} onChange={handleFilterChange} questions={questions} />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0 p-4 md:p-6 flex flex-col gap-4">
          {/* Bulk toolbar */}
          {selectedIds.length > 0 && (
            <BulkSelectToolbar
              selectedCount={selectedIds.length}
              totalCount={paginated.length}
              allSelected={selectedIds.length === paginated.length}
              onSelectAll={handleSelectAll}
              onClear={() => setSelectedIds([])}
              onAddToExam={() => setShowAddToExam(true)}
              onDelete={() => handleRequestDelete(selectedIds)}
            />
          )}

          {/* Stats bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm text-text-secondary">
                Showing <span className="font-semibold text-text">{paginated.length}</span> of{" "}
                <span className="font-semibold text-text">{filtered.length}</span> questions
              </span>
              {activeFilterCount > 0 && (
                <button
                  onClick={() => setFilters({ type: [], difficulty: [], status: [], course: [], chapter: [], source: [] })}
                  className="text-xs text-primary hover:underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
            <div className="flex items-center gap-1 bg-surface-alt rounded-lg p-1">
              {["grid", "list"].map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize ${viewMode === mode ? "bg-surface text-primary shadow-sm" : "text-text-muted hover:text-text-secondary"}`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Grid / List */}
          <QuestionResultGrid
            questions={paginated}
            selectedIds={selectedIds}
            onSelect={handleSelect}
            onEdit={handleOpenEdit}
            onDelete={handleRequestDelete}
            onPreview={handlePreview}
            viewMode={viewMode}
          />

          {/* Pagination */}
          {filtered.length > pageSize && (
            <PaginationControls
              current={currentPage}
              total={filtered.length}
              pageSize={pageSize}
              onChange={setCurrentPage}
            />
          )}
        </div>
      </div>

      {/* Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleCancelEditor} />
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <QuestionEditor
              question={editingQuestion}
              onSave={handleSaveQuestion}
              onCancel={handleCancelEditor}
            />
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewQuestion && (
        <QuestionPreviewModal
          question={previewQuestion}
          onClose={() => setPreviewQuestion(null)}
          onEdit={(q) => { setPreviewQuestion(null); handleOpenEdit(q); }}
        />
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirmIds.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteConfirmIds([])} />
          <div className="relative bg-surface rounded-2xl border border-border w-full max-w-sm shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-error/10 flex items-center justify-center shrink-0">
                <ExclamationCircleOutlined className="text-error text-lg" />
              </div>
              <h3 className="text-base font-bold text-text">
                Delete {deleteConfirmIds.length > 1 ? `${deleteConfirmIds.length} Questions` : "Question"}?
              </h3>
            </div>
            <p className="text-sm text-text-secondary mb-6">
              {deleteConfirmIds.length === 1
                ? "This question will be permanently removed from the bank. This action cannot be undone."
                : `${deleteConfirmIds.length} questions will be permanently removed from the bank. This action cannot be undone.`}
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteConfirmIds([])}
                className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-alt transition-all border border-border"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-lg bg-error text-white text-sm font-semibold hover:bg-error/80 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl border border-success/30 bg-surface shadow-lg text-sm font-medium animate-in slide-in-from-bottom-2">
          <CheckCircleFilled className="text-success shrink-0" />
          <span className="text-text">{toast}</span>
        </div>
      )}
    </div>
  );
}
