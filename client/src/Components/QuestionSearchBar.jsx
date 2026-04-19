import { SearchOutlined, CloseCircleFilled } from "@ant-design/icons";

export default function QuestionSearchBar({ value, onChange }) {
  return (
    <div className="relative group">
      <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors text-sm z-10" />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Search questions, chapters..."
        className="w-full pl-9 pr-9 py-2.5 bg-surface-alt border border-border rounded-xl text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
      />
      {value && (
        <button onClick={() => onChange("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-error transition-colors">
          <CloseCircleFilled className="text-sm" />
        </button>
      )}
    </div>
  );
}