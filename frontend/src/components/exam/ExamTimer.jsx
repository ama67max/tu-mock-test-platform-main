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
      className={`rounded-xl border p-4 shadow-sm transition-colors duration-150 sm:p-6 ${
        isLowTime
          ? 'border-warning-600 bg-warning-50 text-warning-700'
          : 'border-surface-variant bg-surface-container-lowest text-on-surface'
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-secondary">
          <Clock size={16} className={isLowTime ? 'text-warning-700 animate-pulse' : 'text-secondary'} />
          <span>{label}</span>
        </div>

        {isLowTime && (
          <div className="flex items-center gap-2 rounded-lg border border-warning-600 bg-warning-100 px-3 py-1 text-xs font-bold text-warning-700">
            <AlertTriangle size={14} />
            <span>Low time</span>
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