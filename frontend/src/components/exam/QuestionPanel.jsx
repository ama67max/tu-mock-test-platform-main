import { memo } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import Button from '../common/Button';
import OptionSelector from './OptionSelector';
import MathRenderer from '../common/MathRenderer';

function QuestionPanel({
  question,
  selectedValue,
  isMarkedForReview = false,
  onSelect,
  onToggleReview,
}) {
  if (!question) return null;

  const options = Array.isArray(question.options)
    ? question.options.map((option, index) => {
        if (typeof option === 'string') {
          return {
            value: option,
            label: option,
            key: `${option}-${index}`,
          };
        }

        if (typeof option === 'object' && option !== null) {
          return {
            value: option.value ?? option.label ?? option.text ?? option.id ?? `${index}`,
            label: option.label ?? option.text ?? option.value ?? option.id ?? `${index}`,
            key: option.id ?? option.value ?? option.label ?? `${index}`,
          };
        }

        return {
          value: `${index}`,
          label: `${index + 1}`,
          key: `${index}`,
        };
      })
    : typeof question.options === 'object' && question.options !== null
      ? Object.entries(question.options).map(([value, label]) => ({
          value,
          label,
          key: `${value}-${label}`,
        }))
      : [];

  return (
    <div className="border border-border bg-surface-container-lowest p-5 sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <span className="inline-flex border border-border bg-surface-container-highest px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-secondary">
            Question {question.orderIndex || 1}
          </span>
          <h3 className="text-subheading font-bold leading-8 text-on-surface">
            <MathRenderer content={question.questionText || question.question || 'No question text available.'} />
          </h3>
        </div>

        <button
          type="button"
          onClick={onToggleReview}
            className={`flex shrink-0 items-center gap-2 border px-4 py-2 text-sm font-bold transition-colors duration-150 ${
            isMarkedForReview
              ? 'border-primary bg-primary text-on-primary'
              : 'border-border bg-surface-container-low text-secondary hover:border-primary hover:text-primary'
          }`}
        >
          {isMarkedForReview ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
          <span>{isMarkedForReview ? 'Flagged for review' : 'Flag question for review'}</span>
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {options.map((option, index) => (
          <OptionSelector
            key={option.key || `${option.value}-${index}`}
            value={option.value}
            label={<MathRenderer content={option.label} />}
            checked={selectedValue === option.value}
            optionLetter={String.fromCharCode(65 + index)}
            groupName={`question-${question._id || question.id || question.orderIndex || 1}`}
            onChange={() => onSelect?.(option.value)}
          />
        ))}
      </div>
    </div>
  );
}

// Memoized so a per-second timer tick in the parent doesn't force this panel
// (and every option row inside it) to re-render — only real prop changes do.
export default memo(QuestionPanel);