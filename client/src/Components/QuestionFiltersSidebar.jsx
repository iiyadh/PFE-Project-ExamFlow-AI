import { CheckOutlined, RobotOutlined, EditOutlined } from "@ant-design/icons";

const FILTER_GROUPS = [
  {
    key: "type",
    label: "Question Type",
    options: [
      { value: "mcq", label: "Multiple Choice" },
      { value: "short_answer", label: "Short Answer" },
    ],
  },
  {
    key: "difficulty",
    label: "Difficulty",
    options: [
      { value: "easy", label: "Easy", color: "var(--color-success)" },
      { value: "medium", label: "Medium", color: "var(--color-warning)" },
      { value: "hard", label: "Hard", color: "var(--color-error)" },
    ],
  },
];

function FilterChip({ selected, onClick, children, color }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm transition-all border ${
        selected
          ? "bg-primary/10 border-primary/30 text-primary font-medium"
          : "border-transparent text-text-secondary hover:bg-surface-alt hover:text-text"
      }`}
    >
      <span className="flex items-center gap-2">
        {color && <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />}
        {children}
      </span>
      {selected && <CheckOutlined className="text-xs text-primary" />}
    </button>
  );
}

export default function QuestionFiltersSidebar({ filters, onChange, questions }) {
  const toggle = (key, val) => {
    const curr = filters[key] || [];
    onChange(key, curr.includes(val) ? curr.filter(x => x !== val) : [...curr, val]);
  };

  const counts = {};
  questions.forEach(q => {
    counts[q.type] = (counts[q.type] || 0) + 1;
    counts[q.difficulty] = (counts[q.difficulty] || 0) + 1;
    counts[q.status] = (counts[q.status] || 0) + 1;
    counts[q.course] = (counts[q.course] || 0) + 1;
    counts[q.source] = (counts[q.source] || 0) + 1;
  });

  return (
    <div className="space-y-5">
      {/* Source Filter */}
      <div>
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 px-1">Source</p>
        <div className="space-y-0.5">
          {[{ value: "ai", label: "AI Generated", icon: <RobotOutlined /> }, { value: "manual", label: "Manual Entry", icon: <EditOutlined /> }].map(opt => (
            <FilterChip key={opt.value} selected={filters.source?.includes(opt.value)} onClick={() => toggle("source", opt.value)}>
              <span className="flex items-center gap-2 text-text-muted">{opt.icon}</span>
              {opt.label}
              <span className="ml-auto text-text-muted text-xs">{counts[opt.value] || 0}</span>
            </FilterChip>
          ))}
        </div>
      </div>

      {FILTER_GROUPS.map(group => (
        <div key={group.key}>
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 px-1">{group.label}</p>
          <div className="space-y-0.5">
            {group.options.map(opt => (
              <FilterChip
                key={opt.value}
                selected={filters[group.key]?.includes(opt.value)}
                onClick={() => toggle(group.key, opt.value)}
                color={opt.color}
              >
                {opt.label}
                <span className="ml-auto text-text-muted text-xs">{counts[opt.value] || 0}</span>
              </FilterChip>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}