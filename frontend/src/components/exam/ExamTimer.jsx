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
      className={`rounded-xl border p-6 shadow-sm transition-all duration-300 ${
        isLowTime
          ? 'border-warning-600 bg-warning-50 text-warning-700'
          : 'border-surface-variant bg-surface-container-lowest text-on-surface'
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-secondary">
          <Clock size={18} className={isLowTime ? 'text-warning-700 animate-pulse' : 'text-secondary'} />
          <span>{label}</span>
        </div>

        {isLowTime && (
          <div className="flex items-center gap-1.5 rounded-lg bg-warning-100 px-3 py-1 text-xs font-semibold text-warning-700 border border-warning-600">
            <AlertTriangle size={14} />
            <span>Time running low!</span>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-baseline gap-3">
        <span className="text-[40px] font-bold tracking-wider font-mono text-on-surface leading-none drop-shadow-sm">
          {formatTime(seconds)}
        </span>
        <span className="text-xs font-medium text-secondary">mins : secs</span>
      </div>
    </div>
  );
}

export default ExamTimer;

