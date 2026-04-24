const StatusBadge = ({ status }) => {
  const map = {
    upcoming:    { label: "Upcoming",    bg: "bg-[color:var(--color-info)]/15",    text: "text-[color:var(--color-info)]",    dot: "bg-[color:var(--color-info)]" },
    completed:   { label: "Completed",   bg: "bg-[color:var(--color-success)]/15", text: "text-[color:var(--color-success)]", dot: "bg-[color:var(--color-success)]" },
    draft:       { label: "Draft",       bg: "bg-[color:var(--color-text-muted)]/15", text: "text-[color:var(--color-text-muted)]", dot: "bg-[color:var(--color-text-muted)]" },
    in_progress: { label: "In Progress", bg: "bg-[color:var(--color-warning)]/15", text: "text-[color:var(--color-warning)]", dot: "bg-[color:var(--color-warning)]" },
  };
  const s = map[status] || map.draft;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
};

export default StatusBadge;