import { Bookmark, BookmarkCheck } from 'lucide-react';
import Button from '../common/Button';
import OptionSelector from './OptionSelector';

function QuestionPanel({
  question,
  selectedValue,
  isMarkedForReview = false,
  onSelect,
  onToggleReview,
}) {
  if (!question) return null;

  const options = Array.isArray(question.options)
    ? question.options
    : typeof question.options === 'object'
      ? Object.entries(question.options).map(([value, label]) => ({ value, label }))
      : [];

  return (
    <div className="rounded-xl border border-surface-variant bg-surface-container-lowest p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <span className="inline-block rounded-lg bg-surface-container-highest px-3 py-1 text-xs font-semibold uppercase tracking-wider text-secondary border border-surface-variant">
            Question {question.orderIndex || 1}
          </span>
          <h3 className="mt-3 text-2xl font-semibold leading-snug text-on-surface">
            {question.questionText || question.question || 'No question text available.'}
          </h3>
        </div>

        <button
          type="button"
          onClick={onToggleReview}
          className={`flex shrink-0 items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-semibold transition-all duration-200 ${
            isMarkedForReview
              ? 'border-warning-600 bg-warning-50 text-warning-700'
              : 'border-surface-variant bg-surface-container-low text-secondary hover:border-outline hover:bg-surface-container'
          }`}
        >
          {isMarkedForReview ? <BookmarkCheck size={16} className="text-warning-700" /> : <Bookmark size={16} />}
          <span>{isMarkedForReview ? 'Marked for Review' : 'Mark for Review'}</span>
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {options.map((option) => (
          <OptionSelector
            key={option.value}
            value={option.value}
            label={option.label}
            checked={selectedValue === option.value}
            onChange={() => onSelect?.(option.value)}
          />
        ))}
      </div>
    </div>
  );
}

export default QuestionPanel;

