import React from 'react';
import { format } from 'date-fns';

function SkeletonRow() {
  return (
    <tr>
      <td colSpan="7" className="py-4">
        <div className="animate-pulse space-y-2">
          <div className="h-3 bg-slate-900 rounded w-3/4" />
          <div className="h-3 bg-slate-900 rounded w-1/2" />
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
      <div className={`rounded-[24px] bg-slate-950/80 p-4 ${className}`}>
        <table className="w-full text-sm text-slate-300">
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
      <div className={`rounded-[24px] bg-slate-950/80 p-6 text-center text-sm text-slate-400 ${className}`}>
        No recent attempts
      </div>
    );
  }

  return (
    <div className={`rounded-[24px] bg-slate-950/80 overflow-x-auto ${className}`}>
      <table className="min-w-full text-sm text-slate-200">
        <thead>
          <tr className="border-b border-white/10 text-left text-xs uppercase tracking-[0.24em] text-slate-400">
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
            <tr key={a.attemptId} className="border-b border-white/10 last:border-b-0">
              {showUser && <td className="px-4 py-4 align-top text-slate-300">{a.user?.name || a.user?.id || '-'}</td>}
              <td className="px-4 py-4 align-top text-slate-200">{a.examTitle || '-'}</td>
              <td className="px-4 py-4 align-top text-slate-200">{typeof a.score === 'number' ? `${a.score}/${a.totalMarks ?? '-'}` : '-'}</td>
              <td className="px-4 py-4 align-top text-slate-200">{a.status || '-'}</td>
              <td className="px-4 py-4 align-top text-slate-300">{fmt(a.startedAt)}</td>
              <td className="px-4 py-4 align-top text-slate-300">{a.submittedAt ? fmt(a.submittedAt) : '-'}</td>
              <td className="px-4 py-4 align-top">
                <button
                  type="button"
                  onClick={() => onView && onView(a.attemptId)}
                  className="text-sm font-semibold text-sky-300 transition hover:text-white"
                  aria-label={`View attempt ${a.attemptId}`}
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
