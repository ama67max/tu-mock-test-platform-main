import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-slate-800 rounded ${className}`} />;
}

export default function StatCard({
  title,
  value,
  suffix,
  delta,
  icon: Icon,
  loading = false,
  className = '',
}) {
  const showDelta = typeof delta === 'number';
  const positive = showDelta && delta > 0;
  const negative = showDelta && delta < 0;

  return (
    <div
      className={`rounded-[28px] border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 shadow-2xl transition-transform duration-200 hover:-translate-y-0.5 ${className}`}
      role="group"
      aria-label={`stat card ${title}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">{title}</p>
          <div className="mt-4 flex items-baseline gap-2">
            {loading ? (
              <Skeleton className="w-28 h-10" />
            ) : (
              <div className="text-3xl font-semibold text-white sm:text-4xl">
                {value}
                {suffix ? <span className="ml-2 text-sm font-medium text-slate-300">{suffix}</span> : null}
              </div>
            )}
          </div>
        </div>

        {Icon ? (
          <div className="flex h-12 w-12 items-center justify-center rounded-3xl border border-white/10 bg-white/5 text-slate-200">
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>

      <div className="mt-5">
        {showDelta ? (
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium text-white/80 ring-1 ring-white/10">
            {positive ? <ArrowUp className="h-3.5 w-3.5 text-emerald-300" /> : negative ? <ArrowDown className="h-3.5 w-3.5 text-rose-300" /> : null}
            <span className={positive ? 'text-emerald-300' : negative ? 'text-rose-300' : 'text-slate-300'}>
              {Math.abs(delta)}%
            </span>
            <span className="text-slate-400">vs previous</span>
          </div>
        ) : (
          <div className="h-5" />
        )}
      </div>
    </div>
  );
}
