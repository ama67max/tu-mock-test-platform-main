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
import { useTheme } from '../../contexts/ThemeContext';

function Skeleton({ height = 280, isDark = false }) {
  return (
    <div
      className={`w-full animate-pulse rounded-[24px] ${isDark ? 'bg-surface-container-low' : 'bg-surface-container-lowest'}`}
      style={{ height }}
    />
  );
}

export default function SubjectBreakdown({
  data = [],
  height = 280,
  showQuestions = false,
  loading = false,
  colors,
}) {
  const { isDark } = useTheme();
  const chartColors = colors || (isDark
    ? {
        score: '#E5E5E5',
        questions: '#A1A1AA',
        grid: 'rgba(255, 255, 255, 0.1)',
        text: '#FAFAFA',
        tooltipBg: '#18181B',
      }
    : {
        score: '#18181B',
        questions: '#3F3F46',
        grid: 'rgba(0, 0, 0, 0.1)',
        text: '#18181B',
        tooltipBg: '#FFFFFF',
      });

  if (loading) return <Skeleton height={height} isDark={isDark} />;

  const hasData = Array.isArray(data) && data.length > 0;
  if (!hasData) {
    return (
      <div className={`flex h-full items-center justify-center rounded-[24px] p-6 ${isDark ? 'bg-surface-container-low' : 'bg-surface-container-lowest'}`} style={{ height }}>
        <div className="text-sm text-secondary">Complete a mock test to see subject strength</div>
      </div>
    );
  }

  const sorted = [...data].sort((a, b) => b.avgScore - a.avgScore);

  return (
    <div className="rounded-[24px] p-3">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={sorted} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{ fill: chartColors.text, fontSize: 12, fontWeight: 700 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="subject"
            width={180}
            tick={{ fill: chartColors.text, fontSize: 12, fontWeight: 700 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            wrapperStyle={{ borderRadius: 16, borderColor: chartColors.text, backgroundColor: chartColors.tooltipBg }}
            labelStyle={{ color: chartColors.text, fontWeight: 700 }}
            itemStyle={{ color: chartColors.text }}
            cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)' }}
            formatter={(value, name) => [value, name === 'avgScore' ? 'Avg Score' : 'Questions']}
          />
          <Legend wrapperStyle={{ color: chartColors.text, fontWeight: 700 }} />

          <Bar dataKey="avgScore" name="Avg Score" fill={chartColors.score} barSize={20}>
            <LabelList dataKey="avgScore" position="right" formatter={(val) => `${val}%`} fill={chartColors.text} />
          </Bar>

          {showQuestions && (
            <Bar dataKey="questionCount" name="Questions" fill={chartColors.questions} barSize={12} />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
