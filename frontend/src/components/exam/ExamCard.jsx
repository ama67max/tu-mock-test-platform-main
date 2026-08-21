import { Clock3, BookOpen, BadgeCheck, ArrowRight, Download, CheckCircle2, WifiOff } from 'lucide-react';
import Button from '../common/Button';

function ExamCard({
  exam,
  onStart,
  onPrefetch,
  isCached = false,
  isCaching = false,
  actionLabel = 'Start Exam',
  children,
}) {
  if (!exam) return null;

  const duration = exam.durationMinutes || exam.duration || 0;
  const totalMarks = exam.totalMarks || exam.marks || 0;
  const isPublished = exam.isPublished ?? true;

  return (
    <article className="exam-card-reveal group relative flex h-full flex-col rounded-lg border border-border bg-surface-container-lowest p-6 transition-[background-color,border-color,box-shadow,transform] duration-300 hover:border-primary hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                isPublished
                  ? 'bg-primary text-on-primary border border-primary'
                    : 'bg-surface-container-low text-secondary border border-border'
              }`}
            >
              {isPublished ? 'Published' : 'Draft'}
            </span>

            {isCached ? (
              <span className="flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1 text-xs font-semibold text-white border border-primary">
                <CheckCircle2 size={12} />
                <span>Offline ready</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 rounded-lg bg-surface-container-low px-2.5 py-1 text-xs font-medium text-secondary border border-surface-variant">
                <WifiOff size={12} />
                <span>Online only</span>
              </span>
            )}
          </div>

          <h3 className="text-lg font-semibold text-on-surface group-hover:text-primary transition-colors mt-2">
            {exam.title}
          </h3>
          <p className="text-sm text-secondary line-clamp-2 leading-relaxed">{exam.description || 'Practice exam'}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
        <div className="flex items-center gap-2 rounded-lg bg-surface-container-low p-3 border border-surface-variant">
          <BookOpen className="h-4 w-4 text-primary shrink-0" />
          <span className="truncate text-on-surface">{exam.category?.name || exam.category || 'General'}</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-surface-container-low p-3 border border-surface-variant">
          <Clock3 className="h-4 w-4 text-primary shrink-0" />
          <span className="text-on-surface">{duration} mins</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-surface-container-low p-3 border border-surface-variant">
          <BadgeCheck className="h-4 w-4 text-primary shrink-0" />
          <span className="text-on-surface">{totalMarks} marks</span>
        </div>
      </div>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-surface-variant pt-4">
        <div>
          <p className="text-xs text-secondary">
            {exam.passingMarks ? `Passing Mark: ${exam.passingMarks}` : 'Ready to begin'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onPrefetch && !isCached && (
            <button
              type="button"
              onClick={onPrefetch}
              disabled={isCaching}
              className="flex items-center gap-1.5 rounded-lg border border-surface-variant bg-surface-container-low px-3 py-2 text-xs font-semibold text-on-surface transition-all hover:border-outline hover:bg-surface-container disabled:opacity-50"
              title="Download exam for offline access"
            >
              <Download size={14} className={isCaching ? 'animate-bounce' : ''} />
              <span>{isCaching ? 'Saving...' : 'Save Offline'}</span>
            </button>
          )}

          {children || (
            <Button size="sm" onClick={onStart}>
              {actionLabel}
              <ArrowRight size={16} />
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}

export default ExamCard;

