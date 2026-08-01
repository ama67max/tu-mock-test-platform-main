# Specification: frontend/src/components/dashboard/PerformanceChart.jsx

## File Path

frontend/src/components/dashboard/PerformanceChart.jsx

## Purpose

A responsive chart component that visualizes exam performance trends over time for dashboard pages. Primary visualization is a line chart for average score with optional area and secondary axis for attempt counts.

## Required Imports / Dependencies

- `React`
- `recharts` components: `ResponsiveContainer`, `LineChart`, `Line`, `XAxis`, `YAxis`, `Tooltip`, `CartesianGrid`, `Legend`, `Area` (as needed)
- `date-fns` for date formatting (optional)

## Props

| Prop | Type | Required | Description |
| --- | ---: | :---: | --- |
| `data` | Array<Object> | yes | [{ date: ISOString|timestamp, avgScore: number, attempts: number }] sorted ascending by date |
| `height` | number | no | Chart container height (default 240) |
| `showAttempts` | boolean | no | If true, render a second line/area for `attempts` (default true) |
| `loading` | boolean | no | Show a skeleton while loading (default false) |
| `colors` | object | no | { score: '#4F46E5', attempts: '#06B6D4' } to override colors |
| `dateFormat` | string | no | date-fns format for x-axis ticks (default 'MMM d') |

## Behavior / Logic Steps

1. If `loading` is true, render a simple skeleton placeholder of the given `height`.
2. Render `ResponsiveContainer` with the provided `height` and a `LineChart` inside.
3. X axis: use `date` field; format ticks using `date-fns` `format` if available, else use raw string.
4. Primary Y axis: `avgScore` (0-100) with ticks at sensible intervals. Secondary Y axis (right) for `attempts` when `showAttempts` is true.
5. Provide tooltip with formatted date and both values.
6. Provide `Legend` when `showAttempts` is true.
7. Ensure component is defensive: handle empty `data` and invalid dates gracefully.

## Exports

- Default export: `PerformanceChart` React component

## Examples

```jsx
<PerformanceChart
  data={[{date: '2026-07-01', avgScore: 72.3, attempts: 1200}, ...]}
  height={280}
  showAttempts={true}
/>
```

## Tests (suggested)

- Snapshot test with sample data.
- Verify tooltip content when hovering simulated points (enzyme/react-testing-library).
- Accessibility: ensure chart has aria-label and descriptive fallback when no data.
