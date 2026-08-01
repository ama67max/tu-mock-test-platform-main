import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Area,
} from 'recharts';
import { format } from 'date-fns';

function Skeleton({ height = 240 }) {
  return <div className="w-full animate-pulse rounded-[24px] bg-slate-900/70" style={{ height }} />;
}

function safeFormatDate(value, dateFormat) {
  try {
    const d = typeof value === 'number' ? new Date(value) : new Date(String(value));
    if (Number.isNaN(d.getTime())) return String(value);
    return format(d, dateFormat);
  } catch (e) {
    return String(value);
  }
}

export default function PerformanceChart({
  data = [],
  height = 240,
  showAttempts = true,
  loading = false,
  colors = { score: '#38bdf8', attempts: '#67e8f9' },
  dateFormat = 'MMM d',
}) {
  if (loading) return <Skeleton height={height} />;

  const hasData = Array.isArray(data) && data.length > 0;

  if (!hasData) {
    return (
      <div className="flex h-full items-center justify-center rounded-[24px] bg-slate-950/80 p-6" style={{ height }}>
        <div className="text-sm text-slate-400">No data available</div>
      </div>
    );
  }

  return (
    <div className="rounded-[24px] p-3">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 12, right: 18, left: 0, bottom: 6 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" />
          <XAxis
            dataKey="date"
            tickFormatter={(tick) => safeFormatDate(tick, dateFormat)}
            tick={{ fill: '#cbd5e1', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            minTickGap={16}
          />
          <YAxis
            yAxisId="left"
            domain={[0, 100]}
            tickFormatter={(v) => `${v}`}
            tick={{ fill: '#cbd5e1', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          {showAttempts && (
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fill: '#cbd5e1', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
          )}
          <Tooltip
            wrapperStyle={{ borderRadius: 16, borderColor: '#334155', backgroundColor: '#0f172a' }}
            labelStyle={{ color: '#ffffff' }}
            itemStyle={{ color: '#cbd5e1' }}
            cursor={{ stroke: '#334155', strokeWidth: 1 }}
            labelFormatter={(label) => safeFormatDate(label, dateFormat)}
            formatter={(value, name) => [value, name === 'avgScore' ? 'Avg Score' : name === 'attempts' ? 'Attempts' : name]}
          />
          <Legend wrapperStyle={{ color: '#cbd5e1' }} />

          <Area
            type="monotone"
            dataKey="avgScore"
            yAxisId="left"
            stroke={colors.score}
            fill={colors.score}
            fillOpacity={0.12}
            name="Avg Score"
          />

          <Line
            type="monotone"
            dataKey="avgScore"
            yAxisId="left"
            stroke={colors.score}
            strokeWidth={3}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
            name="Avg Score"
          />

          {showAttempts && (
            <Line
              type="monotone"
              dataKey="attempts"
              yAxisId="right"
              stroke={colors.attempts}
              strokeWidth={3}
              dot={false}
              name="Attempts"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
