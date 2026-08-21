import React, { memo } from 'react';

function ExamNavigation({
  questions = [],
  currentIndex = 0,
  answers = {},
  markedForReview = {},
  onSelect,
}) {
  const getStatus = (index) => {
    const questionId = questions[index]?._id || questions[index]?.id || index;
    const isAnswered = answers[questionId] !== undefined;
    const isMarked = Boolean(markedForReview[questionId]);

    if (index === currentIndex) return 'current';
    if (isAnswered && isMarked) return 'answered-marked';
    if (isAnswered) return 'answered';
    if (isMarked) return 'marked';
    return 'unanswered';
  };

  const answeredCount = Object.keys(answers).length;
  const markedCount = Object.keys(markedForReview).length;
  const totalCount = questions.length;

  const getButtonClass = (index) => {
    const status = getStatus(index);
    const base =
      'flex h-9 w-9 items-center justify-center border text-sm font-bold transition-colors duration-150 ease-out';

    switch (status) {
      case 'current':
        return `${base} border-2 border-primary bg-primary text-on-primary ring-2 ring-primary/30 ring-offset-2 ring-offset-surface-container-lowest`;
      case 'answered':
        return `${base} border-primary bg-surface-container-highest text-primary hover:bg-primary hover:text-on-primary`;
      case 'marked':
        return `${base} border-2 border-primary bg-surface-container-low text-primary hover:bg-primary hover:text-on-primary`;
      case 'answered-marked':
        return `${base} border border-primary bg-primary text-on-primary`;
      default:
        return `${base} border border-surface-variant bg-surface-container-low text-secondary hover:border-outline hover:bg-surface-container hover:text-on-surface`;
    }
  };

  return (
    <nav
      aria-label="Exam question navigation"
      className="rounded-lg border border-surface-variant bg-surface-container-lowest p-4 transition-colors duration-200 sm:p-6"
    >
      <div className="flex items-center justify-between gap-4 border-b border-surface-variant pb-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-secondary">Navigation</h3>
          <p className="mt-1 text-xs text-secondary">{totalCount} total questions</p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs font-bold">
          <span className="border border-primary bg-surface-container-highest px-3 py-1 text-primary">
            {answeredCount} Done
          </span>
          <span className="border-2 border-primary bg-surface-container-low px-3 py-1 text-primary">
            {markedCount} Flagged
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-6 md:grid-cols-8">
        {questions.map((question, index) => (
          <button
            key={question?._id || question?.id || index}
            type="button"
            onClick={() => onSelect?.(index)}
            aria-label={`Question ${index + 1}${index === currentIndex ? ', current question' : ''}`}
            aria-current={index === currentIndex ? 'step' : undefined}
            className={`${getButtonClass(index)} min-h-11 min-w-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-surface-variant pt-4 text-xs text-secondary">
        <div className="flex items-center gap-2">
          <span className="h-4 w-4 border border-border bg-surface-container-low" />
          <span>Unanswered</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-4 w-4 border border-primary bg-surface-container-highest" />
          <span>Answered</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-4 w-4 border-2 border-primary bg-surface-container-low" />
          <span>Flagged</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-4 w-4 rounded-md border-2 border-primary bg-primary" />
          <span>Current</span>
        </div>
      </div>
    </nav>
  );
}

// Memoized so a per-second timer tick in the parent doesn't force the whole
// question grid to re-render — only real answer/index/review changes do.
export default memo(ExamNavigation);