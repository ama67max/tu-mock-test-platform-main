import React from 'react';
import { format } from 'date-fns';

function SkeletonRow() {
  return (
    <tr>
      <td colSpan="7" className="py-4">
        <div className="animate-pulse space-y-2">
          <div className="h-3 bg-surface-container-highest w-3/4" />
          <div className="h-3 bg-surface-container-highest w-1/2" />
        </div>
      </td>
    </tr>
  );
}

function fmt(date) {
  try {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return '-';
    return format(d, 'MMM d, yyyy HH:mm');
  } catch (e) {
    return '-';
  }
}

function statusLabel(status) {
  return String(status || 'Pending')
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function RecentAttempts({ attempts = [], loading = false, showUser = false, onView, className = '' }) {
  if (loading) {
    return (
      <div className={`rounded-lg border border-border bg-surface-container-low p-4 ${className}`}>
        <table className="w-full text-sm text-secondary">
          <tbody>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </tbody>
        </table>
      </div>
    );
  }

  if (!Array.isArray(attempts) || attempts.length === 0) {
    return (
      <div className={`rounded-lg border border-dashed border-border bg-surface-container-low p-6 text-center text-sm text-secondary ${className}`}>
        Complete a mock test to see your recent activity.
      </div>
    );
  }

  return (
    <div className={className}>
      <ul aria-label="Recent attempts" className="space-y-3 md:hidden">
        {attempts.map((attempt) => (
          <li key={attempt.attemptId} className="rounded-lg border border-border bg-surface-container-low p-4 transition-colors hover:border-primary">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-primary">{attempt.examTitle || 'Untitled exam'}</p>
                <p className="mt-1 text-xs text-secondary">{fmt(attempt.submittedAt || attempt.startedAt)}</p>
              </div>
              <span className="shrink-0 rounded-full border border-surface-variant bg-surface-container-highest px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-secondary">
                {statusLabel(attempt.status)}
              </span>
            </div>
            <div className="mt-4 flex items-end justify-between gap-3 border-t border-surface-variant pt-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-secondary">Score</p>
                <p className="mt-1 text-lg font-black text-primary">
                  {typeof attempt.score === 'number' ? `${attempt.score} / ${attempt.totalMarks ?? '-'}` : '-'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onView && onView(attempt.attemptId)}
                className="min-h-11 rounded-lg border border-primary px-3 py-2 text-xs font-bold text-primary transition-colors hover:bg-primary hover:text-on-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                aria-label={`View scorecard for ${attempt.examTitle || 'untitled exam'}`}
              >
                View scorecard
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto rounded-lg border border-border bg-surface-container-low md:block">
      <table className="min-w-full text-sm text-primary">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-[0.18em] text-secondary">
            {showUser && <th className="px-4 py-3">User</th>}
            <th className="px-4 py-3">Exam</th>
            <th className="px-4 py-3">Score</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Started</th>
            <th className="px-4 py-3">Submitted</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {attempts.map((a) => (
            <tr key={a.attemptId} className="border-b border-border last:border-b-0">
              {showUser && <td className="px-4 py-4 align-top text-secondary">{a.user?.name || a.user?.id || '-'}</td>}
              <td className="px-4 py-4 align-top text-primary">{a.examTitle || '-'}</td>
              <td className="px-4 py-4 align-top text-primary">{typeof a.score === 'number' ? `${a.score} / ${a.totalMarks ?? '-'}` : '-'}</td>
              <td className="px-4 py-4 align-top text-primary">{statusLabel(a.status)}</td>
              <td className="px-4 py-4 align-top text-secondary">{fmt(a.startedAt)}</td>
              <td className="px-4 py-4 align-top text-secondary">{a.submittedAt ? fmt(a.submittedAt) : '-'}</td>
              <td className="px-4 py-4 align-top">
                <button
                  type="button"
                  onClick={() => onView && onView(a.attemptId)}
                  className="text-sm font-semibold text-primary underline-offset-4 transition hover:underline"
                  aria-label={`View scorecard for ${a.examTitle || 'untitled exam'}`}
                >
                  View scorecard
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
