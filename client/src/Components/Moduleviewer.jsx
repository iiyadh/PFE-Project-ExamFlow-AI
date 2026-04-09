import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, Circle, CheckCircle2, Eye, Pencil, Plus, Save, X, Trash2 } from "lucide-react";
import { Tooltip, Progress, Divider ,Popconfirm   } from "antd";
import { MenuOutlined, CloseOutlined, BookOutlined } from "@ant-design/icons";
import ReactMarkdown from "react-markdown";
import { useParams } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import api from '../lib/api';

const normalizeModules = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.markdownContent)) return payload.markdownContent;
  if (typeof payload.content === "string") {
    try {
      const parsed = JSON.parse(payload.content);
      return Array.isArray(parsed) ? parsed : [];
    } catch (parseError) {
      console.error("Error parsing markdown content:", parseError);
      return [];
    }
  }
  if (typeof payload.title === "string" && typeof payload.content === "string") return [payload];
  return [];
};

const getModuleId = (module) => module?._id || module?.id;

// ── Markdown Editor Component ──────────────────────────────────────────────
const MarkdownEditor = ({ value, onChange }) => {
  const textareaRef = useRef(null);

  // Auto-resize
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  const insertMarkdown = (before, after = "") => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end);
    const newVal = value.slice(0, start) + before + selected + after + value.slice(end);
    onChange(newVal);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 0);
  };

  const toolbar = [
    { label: "B",   title: "Bold",        action: () => insertMarkdown("**", "**"), style: { fontWeight: 700 } },
    { label: "I",   title: "Italic",      action: () => insertMarkdown("_", "_"),  style: { fontStyle: "italic" } },
    { label: "H1",  title: "Heading 1",   action: () => insertMarkdown("# ")  },
    { label: "H2",  title: "Heading 2",   action: () => insertMarkdown("## ") },
    { label: "H3",  title: "Heading 3",   action: () => insertMarkdown("### ") },
    { label: "`",   title: "Inline code", action: () => insertMarkdown("`", "`"),  style: { fontFamily: "monospace" } },
    { label: "```", title: "Code block",  action: () => insertMarkdown("```\n", "\n```"), style: { fontFamily: "monospace", fontSize: "0.75em" } },
    { label: "❝",   title: "Blockquote", action: () => insertMarkdown("> ") },
    { label: "—",   title: "Divider",    action: () => insertMarkdown("\n---\n") },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        border: "1px solid var(--color-border)",
        borderRadius: "10px",
        overflow: "hidden",
        background: "var(--color-surface)",
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          gap: "2px",
          padding: "8px 10px",
          borderBottom: "1px solid var(--color-border)",
          background: "var(--color-surface-alt)",
          flexWrap: "wrap",
        }}
      >
        {toolbar.map((btn) => (
          <Tooltip key={btn.title} title={btn.title}>
            <button
              type="button"
              onClick={btn.action}
              style={{
                padding: "3px 8px",
                borderRadius: "5px",
                border: "1px solid var(--color-border)",
                background: "var(--color-surface)",
                color: "var(--color-text)",
                fontSize: "0.8rem",
                cursor: "pointer",
                transition: "background 0.15s",
                fontFamily: "system-ui",
                ...btn.style,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-border)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--color-surface)")}
            >
              {btn.label}
            </button>
          </Tooltip>
        ))}
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        style={{
          width: "100%",
          minHeight: "320px",
          padding: "1.25rem",
          background: "transparent",
          color: "var(--color-text)",
          fontFamily: "'Fira Code', 'Cascadia Code', monospace",
          fontSize: "0.9rem",
          lineHeight: 1.7,
          resize: "vertical",
          border: "none",
          outline: "none",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
};

// ── Add / Edit Section Modal ───────────────────────────────────────────────
const SectionModal = ({ mode, initialData, onSave, onClose }) => {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [content, setContent] = useState(initialData?.content ?? "");
  const isEdit = mode === "edit";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "14px",
          width: "100%",
          maxWidth: "760px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 24px 64px rgba(0,0,0,0.35)",
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1rem 1.5rem",
            borderBottom: "1px solid var(--color-border)",
            background: "var(--color-surface-alt)",
          }}
        >
          <span style={{ fontFamily: "system-ui", fontWeight: 600, color: "var(--color-text)", fontSize: "0.95rem" }}>
            {isEdit ? "Edit Section" : "Add New Section"}
          </span>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "var(--color-text-muted)",
              display: "flex",
              alignItems: "center",
              padding: "4px",
              borderRadius: "6px",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Title field */}
          <div>
            <label
              style={{ display: "block", marginBottom: "6px", fontSize: "0.8rem", fontWeight: 600, fontFamily: "system-ui", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}
            >
              Section Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Introduction to Variables"
              style={{
                width: "100%",
                padding: "0.6rem 0.9rem",
                border: "1px solid var(--color-border)",
                borderRadius: "8px",
                background: "var(--color-bg)",
                color: "var(--color-text)",
                fontFamily: "system-ui",
                fontSize: "0.95rem",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Content editor */}
          <div>
            <label
              style={{ display: "block", marginBottom: "6px", fontSize: "0.8rem", fontWeight: 600, fontFamily: "system-ui", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}
            >
              Content (Markdown)
            </label>
            <MarkdownEditor value={content} onChange={setContent} />
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            justifyContent: "flex-end",
            padding: "1rem 1.5rem",
            borderTop: "1px solid var(--color-border)",
            background: "var(--color-surface-alt)",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "0.5rem 1.2rem",
              border: "1px solid var(--color-border)",
              borderRadius: "8px",
              background: "transparent",
              color: "var(--color-text-secondary)",
              fontFamily: "system-ui",
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => { if (title.trim()) onSave({ title: title.trim(), content }); }}
            disabled={!title.trim()}
            style={{
              padding: "0.5rem 1.2rem",
              border: "none",
              borderRadius: "8px",
              background: title.trim() ? "var(--color-primary)" : "var(--color-border)",
              color: title.trim() ? "#fff" : "var(--color-text-muted)",
              fontFamily: "system-ui",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: title.trim() ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Save size={14} />
            {isEdit ? "Save Changes" : "Add Section"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────
const ModuleViewer = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visited, setVisited] = useState(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { cid } = useParams();
  const { role } = useAuthStore();
  const [modules, setModules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Teacher-specific state
  const isTeacher = role === "teacher";
  const [editMode, setEditMode] = useState(false);
  const [modal, setModal] = useState(null); // null | { mode: 'add' | 'edit', index?: number }

  const fetchModules = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/markdown/${cid}`);
      const normalized = normalizeModules(response.data.markdownContent);
      setModules(normalized);

      if (role === "student" && normalized.length > 0) {
        try {
          const progressResponse = await api.get(`/progress/${cid}`);
          const visitedModuleIds = Array.isArray(progressResponse.data?.visitedModules)
            ? progressResponse.data.visitedModules
                .map((module) => (typeof module === "string" ? module : module?._id))
                .filter(Boolean)
            : [];

          const moduleIndexById = new Map(
            normalized.map((module, index) => [String(getModuleId(module)), index])
          );

          const visitedIndexes = visitedModuleIds
            .map((id) => moduleIndexById.get(String(id)))
            .filter((index) => Number.isInteger(index));

          if (visitedIndexes.length > 0) {
            setVisited(new Set(visitedIndexes));
            setCurrentIndex(visitedIndexes[visitedIndexes.length - 1]);
          } else {
            setVisited(new Set([0]));
            setCurrentIndex(0);
          }
        } catch (progressError) {
          console.error("Error fetching student progress:", progressError);
          setVisited(new Set([0]));
          setCurrentIndex(0);
        }
      } else {
        setVisited(new Set([0]));
        setCurrentIndex(0);
      }

      setError(null);
    } catch (err) {
      console.error("Error fetching markdown content:", err);
      setError("Failed to load course content. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchModules(); }, [cid, role]);

  const currentModule = modules[currentIndex];
  const progress = modules.length ? Math.round((visited.size / modules.length) * 100) : 0;

  const goTo = useCallback((index) => {
    if (index < 0 || index >= modules.length) return;
    setCurrentIndex(index);
    setVisited((prev) => new Set([...prev, index]));
  }, [modules.length]);

  const handlePrevious = useCallback(() => { if (currentIndex > 0) goTo(currentIndex - 1); }, [currentIndex, goTo]);
  const handleNext = useCallback(() => { if (currentIndex < modules.length - 1) goTo(currentIndex + 1); }, [currentIndex, modules.length, goTo]);

  useEffect(() => {
    if (!modules.length) return;
    const handleKey = (e) => {
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrevious();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleNext, handlePrevious, modules.length]);

  useEffect(() => {
    if (role !== "student" || !modules.length) return;

    const visitedModuleIds = Array.from(visited)
      .map((index) => getModuleId(modules[index]))
      .filter(Boolean);

    if (!visitedModuleIds.length) return;

    const syncProgress = async () => {
      try {
        await api.put(`/progress/${cid}`, { visitedModules: visitedModuleIds });
      } catch (syncError) {
        console.error("Error updating student progress:", syncError);
      }
    };

    syncProgress();
  }, [visited, modules, cid, role]);

  // ── Teacher actions ──────────────────────────────────────────────────────
  const handleSaveSection = async ({ title, content }) => {
    if (modal.mode === "add") {
      const res = await api.post(`/markdown/${cid}`, { title, content });
      const newModule = res.data;
      const updated = [...modules, newModule];
      setModules(updated);
      goTo(updated.length - 1);
    } else if (modal.mode === "edit") {
      await api.put(`/markdown/${modules[modal.index]._id}`, { title, content });
      setModules((prev) =>
        prev.map((m, i) => (i === modal.index ? { ...m, title, content } : m))
      );
    }
    setModal(null);
  };

  const handleDeleteSection = async (index) => {
    await api.delete(`/markdown/${modules[index]._id}`);
    const updated = modules.filter((_, i) => i !== index);
    setModules(updated);
    setCurrentIndex(Math.min(currentIndex, updated.length - 1));
  };

  // ── Loading / Error / Empty states ───────────────────────────────────────
  if (isLoading) return (
    <div className="flex items-center justify-center h-screen">
      <p style={{ color: "var(--color-text-muted)", fontFamily: "system-ui" }}>Loading course content...</p>
    </div>
  );
  if (error) return (
    <div className="flex items-center justify-center h-screen">
      <p style={{ color: "var(--color-text-muted)", fontFamily: "system-ui" }}>{error}</p>
    </div>
  );
  if (modules.length === 0) return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <p style={{ color: "var(--color-text-muted)", fontFamily: "system-ui" }}>No content available for this course.</p>
      {isTeacher && (
        <button
          onClick={() => setModal({ mode: "add" })}
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "0.6rem 1.2rem", border: "none", borderRadius: "8px",
            background: "var(--color-primary)", color: "#fff",
            fontFamily: "system-ui", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer",
          }}
        >
          <Plus size={15} /> Add First Section
        </button>
      )}
    </div>
  );

  return (
    <>
      <div
        className="flex overflow-hidden"
        style={{
          height: "calc(100vh - 5rem)",
          background: "var(--color-bg)",
          color: "var(--color-text)",
          fontFamily: "'Crimson Pro', Georgia, serif",
        }}
      >
        {/* ── Sidebar ─────────────────────────────────────────────────── */}
        <aside
          className="flex h-full flex-col transition-all duration-300 border-r"
          style={{
            width: sidebarOpen ? "300px" : "0px",
            minWidth: sidebarOpen ? "300px" : "0px",
            background: "var(--color-surface)",
            borderColor: "var(--color-border)",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-6 py-5 border-b shrink-0 sticky top-0 z-10"
            style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
          >
            <BookOutlined style={{ color: "var(--color-primary)", fontSize: 20 }} />
            <span
              className="font-bold text-base tracking-wide uppercase"
              style={{ color: "var(--color-primary)", letterSpacing: "0.1em", fontFamily: "system-ui" }}
            >
              Sections
            </span>
          </div>

          {/* Progress (student only) */}
          {role === "student" && (
            <div className="px-6 py-4 border-b shrink-0" style={{ borderColor: "var(--color-border)" }}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium uppercase tracking-widest" style={{ color: "var(--color-text-muted)" }}>Progress</span>
                <span className="text-xs font-bold" style={{ color: "var(--color-primary)" }}>{progress}%</span>
              </div>
              <Progress percent={progress} showInfo={false} size="small" strokeColor="var(--color-primary)" trailColor="var(--color-border)" />
            </div>
          )}

          {/* Module List */}
          <nav className="flex-1 min-h-0 overflow-y-auto py-3 px-3">
            {modules.map((module, index) => {
              const isActive = currentIndex === index;
              const isVisited = visited.has(index);
              return (
                <div
                  key={module._id || module.id || `${index}-${module.title}`}
                  className="group relative mb-1"
                >
                  <button
                    onClick={() => goTo(index)}
                    className="w-full text-left rounded-lg px-4 py-3 flex items-center gap-3 transition-all duration-200"
                    style={{
                      background: isActive ? "var(--color-primary)" : "transparent",
                      color: isActive ? "#fff" : isVisited ? "var(--color-text)" : "var(--color-text-muted)",
                      border: isActive ? "none" : "1px solid transparent",
                      paddingRight: isTeacher ? "2.5rem" : "1rem",
                    }}
                  >
                    {role === "student" && (
                      <span className="shrink-0">
                        {isVisited
                          ? <CheckCircle2 size={16} style={{ color: isActive ? "rgba(255,255,255,0.8)" : "var(--color-success)" }} />
                          : <Circle size={16} style={{ color: isActive ? "rgba(255,255,255,0.6)" : "var(--color-text-muted)" }} />
                        }
                      </span>
                    )}
                    <span className="text-sm font-medium leading-snug" style={{ fontFamily: "system-ui", lineHeight: 1.4 }}>
                      <span className="text-xs mr-2" style={{ opacity: isActive ? 0.7 : 0.5 }}>
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {module.title}
                    </span>
                  </button>

                  {/* Teacher: edit/delete icons per row */}
                  {isTeacher && (
                    <div
                      className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ zIndex: 10 }}
                    >
                      <Tooltip title="Edit section">
                        <button
                          onClick={(e) => { e.stopPropagation(); setModal({ mode: "edit", index }); }}
                          style={{
                            padding: "4px", borderRadius: "5px", border: "none",
                            background: "var(--color-surface-alt)",
                            color: "var(--color-text-muted)",
                            cursor: "pointer", display: "flex", alignItems: "center",
                          }}
                        >
                          <Pencil size={12} />
                        </button>
                      </Tooltip>
                      <Popconfirm
                        title="Delete this section?"
                        onConfirm={(e) => { e.stopPropagation(); handleDeleteSection(index); }}
                      >
                      <Tooltip title="Delete section">
                        <button
                          style={{
                            padding: "4px", borderRadius: "5px", border: "none",
                            background: "var(--color-surface-alt)",
                            color: "var(--color-text-muted)",
                            cursor: "pointer", display: "flex", alignItems: "center",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-muted)")}
                        >
                          <Trash2 size={12} />
                        </button>
                      </Tooltip>
                      </Popconfirm>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Add Section button (teacher only) */}
            {isTeacher && (
              <button
                onClick={() => setModal({ mode: "add" })}
                className="w-full mt-3 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all"
                style={{
                  border: "1.5px dashed var(--color-border)",
                  color: "var(--color-text-muted)",
                  background: "transparent",
                  fontFamily: "system-ui",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--color-primary)"; e.currentTarget.style.color = "var(--color-primary)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--color-border)"; e.currentTarget.style.color = "var(--color-text-muted)"; }}
              >
                <Plus size={14} /> Add Section
              </button>
            )}
          </nav>

          <Divider style={{ margin: 0, borderColor: "var(--color-border)" }} />

          <div className="px-6 py-4 text-center shrink-0">
            <span className="text-xs" style={{ color: "var(--color-text-muted)", fontFamily: "system-ui" }}>
              {role === "student" ? `${visited.size} of ${modules.length} viewed` : `${modules.length} section${modules.length !== 1 ? "s" : ""}`}
            </span>
          </div>
        </aside>

        {/* ── Main Content ─────────────────────────────────────────────── */}
        <main className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Top Bar */}
          <header
            className="flex items-center justify-between px-6 py-4 border-b shrink-0"
            style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
          >
            <div className="flex items-center gap-3">
              <Tooltip title={sidebarOpen ? "Close sidebar" : "Open sidebar"}>
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="flex items-center justify-center w-9 h-9 rounded-lg transition-colors"
                  style={{
                    color: "var(--color-text-secondary)",
                    background: "var(--color-surface-alt)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  {sidebarOpen ? <CloseOutlined style={{ fontSize: 14 }} /> : <MenuOutlined style={{ fontSize: 14 }} />}
                </button>
              </Tooltip>
              {currentModule && (
                <div className="flex flex-col gap-1">
                  <p className="text-xs uppercase tracking-widest" style={{ color: "var(--color-text-muted)", fontFamily: "system-ui" }}>
                    Section {currentIndex + 1} / {modules.length}
                  </p>
                  <h1
                    className="text-base font-semibold leading-tight"
                    style={{ color: "var(--color-text)", fontFamily: "'Crimson Pro', Georgia, serif" }}
                  >
                    {currentModule.title}
                  </h1>
                </div>
              )}
            </div>

            {/* Right side: mode toggle (teacher) + navigation */}
            <div className="flex items-center gap-2">
              {/* Navigation buttons */}
              {currentIndex !== 0 && (
                <button
                  onClick={handlePrevious}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background: "var(--color-surface-alt)",
                    color: "var(--color-text-secondary)",
                    border: "1px solid var(--color-border)",
                    fontFamily: "system-ui",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--color-border)"; e.currentTarget.style.color = "var(--color-text)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "var(--color-surface-alt)"; e.currentTarget.style.color = "var(--color-text-secondary)"; }}
                >
                  <ChevronLeft size={16} /> Previous
                </button>
              )}
              {currentIndex < modules.length - 1 && (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background: "var(--color-primary)",
                    color: "#fff",
                    border: "none",
                    fontFamily: "system-ui",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-primary-hover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "var(--color-primary)")}
                >
                  Next <ChevronRight size={16} />
                </button>
              )}
            </div>
          </header>

          {/* ── Content Area ─────────────────────────────────────────── */}
          <div className="flex-1 min-h-0 overflow-y-auto" style={{ background: "var(--color-bg)" }}>
            <div className="max-w-3xl mx-auto px-8 py-12">
              {currentModule && (
                <>
                  {/* EDIT MODE: inline editor for current section */}
                  {isTeacher && editMode ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                      {/* Inline title edit */}
                      <div>
                        <label style={{ display: "block", marginBottom: "6px", fontSize: "0.78rem", fontWeight: 600, fontFamily: "system-ui", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                          Section Title
                        </label>
                        <input
                          value={currentModule.title}
                          onChange={(e) =>
                            setModules((prev) =>
                              prev.map((m, i) => (i === currentIndex ? { ...m, title: e.target.value } : m))
                            )
                          }
                          style={{
                            width: "100%", padding: "0.6rem 0.9rem",
                            border: "1px solid var(--color-border)", borderRadius: "8px",
                            background: "var(--color-surface)", color: "var(--color-text)",
                            fontFamily: "system-ui", fontSize: "1rem", outline: "none",
                            boxSizing: "border-box",
                          }}
                        />
                      </div>
                      {/* Inline content editor */}
                      <div>
                        <label style={{ display: "block", marginBottom: "6px", fontSize: "0.78rem", fontWeight: 600, fontFamily: "system-ui", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                          Content (Markdown)
                        </label>
                        <MarkdownEditor
                          value={currentModule.content ?? ""}
                          onChange={(val) =>
                            setModules((prev) =>
                              prev.map((m, i) => (i === currentIndex ? { ...m, content: val } : m))
                            )
                          }
                        />
                      </div>
                      {/* Save inline hint */}
                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button
                          onClick={() => {
                            setEditMode(false);
                            handleSaveSection({ title: currentModule.title, content: currentModule.content });
                          }}
                          style={{
                            display: "flex", alignItems: "center", gap: "6px",
                            padding: "0.5rem 1.2rem", border: "none", borderRadius: "8px",
                            background: "var(--color-primary)", color: "#fff",
                            fontFamily: "system-ui", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer",
                          }}
                        >
                          <Save size={14} /> Save & Preview
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* VIEW MODE: rendered markdown */
                    <div
                      style={{
                        "--md-h1-color": "var(--color-text)",
                        "--md-h2-color": "var(--color-text)",
                        "--md-h3-color": "var(--color-text-secondary)",
                        "--md-p-color": "var(--color-text-secondary)",
                        "--md-code-bg": "var(--color-surface-alt)",
                        "--md-border": "var(--color-primary)",
                        "--md-link": "var(--color-accent)",
                      }}
                    >
                      <ReactMarkdown
                        components={{
                          h1: ({ node, ...props }) => (
                            <h1 style={{ fontSize: "2.5rem", fontWeight: 700, marginBottom: "1rem", marginTop: "0", color: "var(--color-text)", fontFamily: "'Crimson Pro', Georgia, serif", lineHeight: 1.15, letterSpacing: "-0.02em", borderBottom: "3px solid var(--color-primary)", paddingBottom: "0.75rem" }} {...props} />
                          ),
                          h2: ({ node, ...props }) => (
                            <h2 style={{ fontSize: "1.6rem", fontWeight: 600, marginTop: "2.5rem", marginBottom: "0.75rem", color: "var(--color-text)", fontFamily: "'Crimson Pro', Georgia, serif", lineHeight: 1.25 }} {...props} />
                          ),
                          h3: ({ node, ...props }) => (
                            <h3 style={{ fontSize: "1.2rem", fontWeight: 600, marginTop: "2rem", marginBottom: "0.5rem", color: "var(--color-text-secondary)", fontFamily: "system-ui", textTransform: "uppercase", letterSpacing: "0.05em" }} {...props} />
                          ),
                          p: ({ node, ...props }) => (
                            <p style={{ color: "var(--color-text-secondary)", marginBottom: "1.25rem", lineHeight: 1.85, fontSize: "1.05rem", fontFamily: "'Crimson Pro', Georgia, serif" }} {...props} />
                          ),
                          code: ({ node, inline, ...props }) =>
                            inline ? (
                              <code style={{ background: "var(--color-surface-alt)", color: "var(--color-ai)", padding: "2px 8px", borderRadius: "4px", fontSize: "0.875em", fontFamily: "'Fira Code', 'Cascadia Code', monospace", border: "1px solid var(--color-border)" }} {...props} />
                            ) : (
                              <code style={{ display: "block", background: "var(--color-surface)", color: "var(--color-text)", padding: "1.25rem", borderRadius: "8px", fontSize: "0.875rem", fontFamily: "'Fira Code', 'Cascadia Code', monospace", overflowX: "auto", border: "1px solid var(--color-border)", borderLeft: "3px solid var(--color-ai)" }} {...props} />
                            ),
                          pre: ({ node, ...props }) => (
                            <pre style={{ background: "var(--color-surface)", padding: "0", borderRadius: "8px", overflowX: "auto", margin: "1.5rem 0", border: "1px solid var(--color-border)" }} {...props} />
                          ),
                          blockquote: ({ node, ...props }) => (
                            <blockquote style={{ borderLeft: "4px solid var(--color-primary)", paddingLeft: "1.25rem", margin: "1.5rem 0", color: "var(--color-text-muted)", fontStyle: "italic", background: "var(--color-surface-alt)", padding: "1rem 1.25rem", borderRadius: "0 8px 8px 0" }} {...props} />
                          ),
                          ul: ({ node, ...props }) => (
                            <ul style={{ paddingLeft: "1.5rem", margin: "1rem 0", color: "var(--color-text-secondary)", lineHeight: 1.85 }} {...props} />
                          ),
                          ol: ({ node, ...props }) => (
                            <ol style={{ paddingLeft: "1.5rem", margin: "1rem 0", color: "var(--color-text-secondary)", lineHeight: 1.85 }} {...props} />
                          ),
                          li: ({ node, ...props }) => (
                            <li style={{ marginBottom: "0.4rem", color: "var(--color-text-secondary)", fontFamily: "'Crimson Pro', Georgia, serif", fontSize: "1.05rem" }} {...props} />
                          ),
                          a: ({ node, ...props }) => (
                            <a style={{ color: "var(--color-accent)", textDecoration: "underline", textUnderlineOffset: "3px" }} {...props} />
                          ),
                          strong: ({ node, ...props }) => (
                            <strong style={{ color: "var(--color-text)", fontWeight: 700 }} {...props} />
                          ),
                        }}
                      >
                        {currentModule?.content ?? ""}
                      </ReactMarkdown>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* ── Add / Edit Modal (teacher only) ──────────────────────────────── */}
      {modal && (
        <SectionModal
          mode={modal.mode}
          initialData={modal.mode === "edit" ? modules[modal.index] : undefined}
          onSave={handleSaveSection}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
};

export default ModuleViewer;