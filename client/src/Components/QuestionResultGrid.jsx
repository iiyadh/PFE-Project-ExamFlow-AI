import QuestionCard from "./QuestionCard";
import { InboxOutlined } from "@ant-design/icons";

export default function QuestionResultGrid({ questions, selectedIds, onSelect, onEdit, onDelete, onPreview, viewMode }) {
  if (!questions.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-surface-alt flex items-center justify-center mb-4">
          <InboxOutlined className="text-3xl text-text-muted" />
        </div>
        <h3 className="text-base font-semibold text-text mb-1">No questions found</h3>
        <p className="text-sm text-text-muted max-w-xs">
          Try adjusting your search or filters to find what you're looking for.
        </p>
      </div>
    );
  }

  if (viewMode === "list") {
    return (
      <div className="space-y-2">
        {questions.map(q => (
          <QuestionCard
            key={q.id}
            question={q}
            selected={selectedIds.includes(q.id)}
            onSelect={onSelect}
            onEdit={onEdit}
            onDelete={onDelete}
            onPreview={onPreview}
            viewMode="list"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {questions.map(q => (
        <QuestionCard
          key={q.id}
          question={q}
          selected={selectedIds.includes(q.id)}
          onSelect={onSelect}
          onEdit={onEdit}
          onDelete={onDelete}
          onPreview={onPreview}
          viewMode="grid"
        />
      ))}
    </div>
  );
}
