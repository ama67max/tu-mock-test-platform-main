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

export default function RecentAttempts({ attempts = [], loading = false, showUser = false, onView, className = '' }) {
  if (loading) {
    return (
      <div className={`border border-border bg-surface-container-low p-4 ${className}`}>
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
      <div className={`border border-dashed border-border bg-surface-container-low p-6 text-center text-sm text-secondary ${className}`}>
        Complete a mock test to see your recent activity.
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto border border-border bg-surface-container-low ${className}`}>
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
              <td className="px-4 py-4 align-top text-primary">{typeof a.score === 'number' ? `${a.score}/${a.totalMarks ?? '-'}` : '-'}</td>
              <td className="px-4 py-4 align-top text-primary">{a.status || '-'}</td>
              <td className="px-4 py-4 align-top text-secondary">{fmt(a.startedAt)}</td>
              <td className="px-4 py-4 align-top text-secondary">{a.submittedAt ? fmt(a.submittedAt) : '-'}</td>
              <td className="px-4 py-4 align-top">
                <button
                  type="button"
                  onClick={() => onView && onView(a.attemptId)}
                  className="text-sm font-semibold text-primary underline-offset-4 transition hover:underline"
                  aria-label={`View attempt ${a.attemptId}`}
                >
                  View scorecard
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
