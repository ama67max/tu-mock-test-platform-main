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
import { useTheme } from '../../contexts/ThemeContext';

function Skeleton({ height = 240, isDark = false }) {
  return (
    <div
      className={`w-full animate-pulse rounded-[24px] ${isDark ? 'bg-surface-container-low' : 'bg-surface-container-lowest'}`}
      style={{ height }}
    />
  );
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
  colors,
  dateFormat = 'MMM d',
}) {
  const { isDark } = useTheme();
  const chartColors = colors || (isDark
    ? {
        score: '#E5E5E5',
        attempts: '#A1A1AA',
        grid: 'rgba(255, 255, 255, 0.1)',
        text: '#FAFAFA',
        tooltipBg: '#18181B',
      }
    : {
        score: '#18181B',
        attempts: '#3F3F46',
        grid: 'rgba(0, 0, 0, 0.1)',
        text: '#18181B',
        tooltipBg: '#FFFFFF',
      });

  if (loading) return <Skeleton height={height} isDark={isDark} />;

  const hasData = Array.isArray(data) && data.length > 0;

  if (!hasData) {
    return (
      <div className={`flex h-full items-center justify-center rounded-[24px] p-6 ${isDark ? 'bg-surface-container-low' : 'bg-surface-container-lowest'}`} style={{ height }}>
        <div className="text-sm text-secondary">No data available yet</div>
      </div>
    );
  }

  return (
    <div className="rounded-[24px] p-3">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 12, right: 18, left: 0, bottom: 6 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
          <XAxis
            dataKey="date"
            tickFormatter={(tick) => safeFormatDate(tick, dateFormat)}
            tick={{ fill: chartColors.text, fontSize: 12, fontWeight: 700 }}
            tickLine={false}
            axisLine={false}
            minTickGap={16}
          />
          <YAxis
            yAxisId="left"
            domain={[0, 100]}
            tickFormatter={(v) => `${v}`}
            tick={{ fill: chartColors.text, fontSize: 12, fontWeight: 700 }}
            tickLine={false}
            axisLine={false}
          />
          {showAttempts && (
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fill: chartColors.text, fontSize: 12, fontWeight: 700 }}
              tickLine={false}
              axisLine={false}
            />
          )}
          <Tooltip
            wrapperStyle={{ borderRadius: 16, borderColor: chartColors.text, backgroundColor: chartColors.tooltipBg }}
            labelStyle={{ color: chartColors.text, fontWeight: 700 }}
            itemStyle={{ color: chartColors.text }}
            cursor={{ stroke: chartColors.text, strokeWidth: 1 }}
            labelFormatter={(label) => safeFormatDate(label, dateFormat)}
            formatter={(value, name) => [value, name === 'avgScore' ? 'Avg Score' : name === 'attempts' ? 'Attempts' : name]}
          />
          <Legend wrapperStyle={{ color: chartColors.text, fontWeight: 700 }} />

          <Area
            type="monotone"
            dataKey="avgScore"
            yAxisId="left"
            stroke={chartColors.score}
            fill={chartColors.score}
            fillOpacity={0.12}
            name="Avg Score"
          />

          <Line
            type="monotone"
            dataKey="avgScore"
            yAxisId="left"
            stroke={chartColors.score}
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
              stroke={chartColors.attempts}
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
