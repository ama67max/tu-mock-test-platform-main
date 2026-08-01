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
      'flex h-11 w-11 items-center justify-center rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm';

    switch (status) {
      case 'current':
        return `${base} border-2 border-primary bg-primary text-white scale-105`;
      case 'answered':
        return `${base} border border-success-600 bg-success-50 text-success-700 hover:bg-success-100`;
      case 'marked':
        return `${base} border border-warning-600 bg-warning-50 text-warning-700 hover:bg-warning-100`;
      case 'answered-marked':
        return `${base} border border-primary bg-primary text-white hover:bg-on-surface`;
      default:
        return `${base} border border-surface-variant bg-surface-container-low text-secondary hover:border-outline hover:bg-surface-container hover:text-on-surface`;
    }
  };

  return (
    <div className="rounded-xl border border-surface-variant bg-surface-container-lowest p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-surface-variant">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-secondary">Navigation</h3>
          <p className="text-xs text-secondary mt-1">{totalCount} total questions</p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs font-medium">
          <span className="rounded-lg bg-success-50 border border-success-600 px-2.5 py-1 text-success-700">
            {answeredCount} Done
          </span>
          <span className="rounded-lg bg-warning-50 border border-warning-600 px-2.5 py-1 text-warning-700">
            {markedCount} Flagged
          </span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-5 gap-2.5 sm:grid-cols-6 md:grid-cols-8">
        {questions.map((question, index) => (
          <button
            key={question?._id || question?.id || index}
            type="button"
            onClick={() => onSelect?.(index)}
            className={getButtonClass(index)}
            title={`Question ${index + 1}`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs text-secondary pt-4 border-t border-surface-variant">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-md border border-surface-variant bg-surface-container-low" />
          <span>Unanswered</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-md border border-success-600 bg-success-50" />
          <span>Answered</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-md border border-warning-600 bg-warning-50" />
          <span>Flagged</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-md border-2 border-primary bg-primary" />
          <span>Current</span>
        </div>
      </div>
    </div>
  );
}

export default ExamNavigation;

