import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  LabelList,
} from 'recharts';

function Skeleton({ height = 280 }) {
  return <div className="w-full animate-pulse rounded-[24px] bg-slate-900/70" style={{ height }} />;
}

export default function SubjectBreakdown({
  data = [],
  height = 280,
  showQuestions = false,
  loading = false,
  colors = { score: '#38bdf8', questions: '#22d3ee' },
}) {
  if (loading) return <Skeleton height={height} />;

  const hasData = Array.isArray(data) && data.length > 0;
  if (!hasData) {
    return (
      <div className="flex h-full items-center justify-center rounded-[24px] bg-slate-950/80 p-6" style={{ height }}>
        <div className="text-sm text-slate-400">No subject data available</div>
      </div>
    );
  }

  const sorted = [...data].sort((a, b) => b.avgScore - a.avgScore);

  return (
    <div className="rounded-[24px] p-3">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={sorted} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" />
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{ fill: '#cbd5e1', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="subject"
            width={150}
            tick={{ fill: '#cbd5e1', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            wrapperStyle={{ borderRadius: 16, borderColor: '#334155', backgroundColor: '#0f172a' }}
            labelStyle={{ color: '#ffffff' }}
            itemStyle={{ color: '#cbd5e1' }}
            cursor={{ fill: 'rgba(148,163,184,0.08)' }}
            formatter={(value, name) => [value, name === 'avgScore' ? 'Avg Score' : 'Questions']}
          />
          <Legend wrapperStyle={{ color: '#cbd5e1' }} />

          <Bar dataKey="avgScore" name="Avg Score" fill={colors.score} barSize={18}>
            <LabelList dataKey="avgScore" position="right" formatter={(val) => `${val}%`} fill="#e2e8f0" />
          </Bar>

          {showQuestions && (
            <Bar dataKey="questionCount" name="Questions" fill={colors.questions} barSize={12} />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
