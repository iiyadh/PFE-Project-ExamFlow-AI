import { PlusCircleOutlined, DeleteOutlined, CloseOutlined, CheckSquareOutlined } from "@ant-design/icons";

export default function BulkSelectToolbar({ selectedCount, totalCount, allSelected, onSelectAll, onClear, onAddToExam, onDelete }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-primary rounded-xl text-white shadow-lg animate-in slide-in-from-top-2 duration-200">
      <div className="flex items-center gap-2 flex-1">
        <CheckSquareOutlined className="text-white/80" />
        <span className="text-sm font-semibold">
          {selectedCount} question{selectedCount !== 1 ? "s" : ""} selected
        </span>
        <span className="text-white/50 text-xs">of {totalCount}</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onSelectAll}
          className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-all border border-white/10"
        >
          {allSelected ? "Deselect all" : "Select all on page"}
        </button>
        <button
          onClick={onDelete}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-error text-white text-xs font-semibold hover:bg-error/80 transition-all"
        >
          <DeleteOutlined />
          Delete
        </button>

        <button
          onClick={onClear}
          className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
        >
          <CloseOutlined className="text-xs" />
        </button>
      </div>
    </div>
  );
}