# Specification: frontend/src/components/dashboard/SubjectBreakdown.jsx

## File Path

frontend/src/components/dashboard/SubjectBreakdown.jsx

## Purpose

Visual component that displays a per-subject performance breakdown for an exam or user. Shows average score per subject (percentage) and optionally the number of questions per subject.

## Required Imports / Dependencies

- `React`
- `recharts`: `ResponsiveContainer`, `BarChart`, `Bar`, `XAxis`, `YAxis`, `Tooltip`, `CartesianGrid`, `Legend`, `LabelList`
- `date-fns` not required

## Props

| Prop | Type | Required | Description |
| --- | ---: | :---: | --- |
| `data` | Array<Object> | yes | [{ subject: string, avgScore: number, questionCount?: number }] |
| `height` | number | no | Chart height (default 280) |
| `showQuestions` | boolean | no | If true, render `questionCount` as secondary bar (default false) |
| `loading` | boolean | no | Show skeleton when loading (default false) |
| `colors` | object | no | { score: '#10B981', questions: '#3B82F6' } override defaults |

## Behavior / Logic Steps

1. If `loading` true show a skeleton placeholder.
2. If `data` is empty show a friendly "No data" state.
3. Render an accessible grouped bar chart sorted by `avgScore` descending.
4. Primary Y-axis is percentage (0-100) for `avgScore`. Secondary Y-axis (right) for `questionCount` when `showQuestions`.
5. Bars display value labels; tooltip shows both metrics.
6. Component must be side-effect free and style using Tailwind utilities.

## Exports

- Default export: `SubjectBreakdown` React component

## Tests (suggested)

- Snapshot with sample data and with `showQuestions` true.
- Tooltip and label rendering checks.
