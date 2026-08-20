import { Clock, AlertTriangle } from 'lucide-react';

function formatTime(totalSeconds) {
  const safeSeconds = Math.max(0, Number(totalSeconds) || 0);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function ExamTimer({ seconds, label = 'Time Remaining', className = '' }) {
  const isLowTime = seconds <= 300;

  return (
    <div
      className={`border p-4 transition-colors duration-150 sm:p-6 ${
        isLowTime
          ? 'border-primary bg-surface-container-highest text-primary'
          : 'border-border bg-surface-container-lowest text-on-surface'
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-secondary">
          <Clock size={16} className={isLowTime ? 'text-primary animate-pulse' : 'text-secondary'} />
          <span>{label}</span>
        </div>

        {isLowTime && (
          <div className="flex items-center gap-2 border border-primary bg-primary px-3 py-1 text-xs font-bold text-on-primary">
            <AlertTriangle size={14} />
            <span>Finish soon</span>
          </div>
        )}
      </div>

      {/* tabular-nums keeps digit widths fixed so the clock doesn't
          shift/jitter every second as characters like "1" vs "8" change */}
      <div className="mt-4 flex items-baseline gap-3">
        <span className="font-headline text-display font-bold leading-none tabular-nums text-on-surface">
          {formatTime(seconds)}
        </span>
        <span className="text-xs font-bold text-secondary">mins : secs</span>
      </div>
    </div>
  );
}

export default ExamTimer;