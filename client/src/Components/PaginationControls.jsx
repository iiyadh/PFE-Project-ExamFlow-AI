import { LeftOutlined, RightOutlined } from "@ant-design/icons";

export default function PaginationControls({ current, total, pageSize, onChange }) {
  const totalPages = Math.ceil(total / pageSize);
  const pages = [];

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= current - 1 && i <= current + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <div className="flex items-center justify-between py-2">
      <p className="text-sm text-text-muted">
        Page <span className="font-medium text-text">{current}</span> of{" "}
        <span className="font-medium text-text">{totalPages}</span>
      </p>

      <div className="flex items-center gap-1">
        <button
          disabled={current === 1}
          onClick={() => onChange(current - 1)}
          className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-text-secondary hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all bg-surface"
        >
          <LeftOutlined className="text-xs" />
        </button>

        {pages.map((page, idx) =>
          page === "..." ? (
            <span key={`ellipsis-${idx}`} className="w-8 h-8 flex items-center justify-center text-sm text-text-muted">
              ···
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onChange(page)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-all border ${
                page === current
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "border-border text-text-secondary hover:border-primary hover:text-primary bg-surface"
              }`}
            >
              {page}
            </button>
          )
        )}

        <button
          disabled={current === totalPages}
          onClick={() => onChange(current + 1)}
          className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-text-secondary hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all bg-surface"
        >
          <RightOutlined className="text-xs" />
        </button>
      </div>
    </div>
  );
}