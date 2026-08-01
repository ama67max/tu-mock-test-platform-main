# Specification: frontend/src/components/dashboard/RecentAttempts.jsx

## File Path

frontend/src/components/dashboard/RecentAttempts.jsx

## Purpose

A compact, accessible table showing a list of recent exam attempts. Used on the student and admin dashboards to surface recent activity with quick actions (view details, retry). The component is presentation-focused — data is provided via props.

## Required Imports / Dependencies

- `React`
- `date-fns` for formatting dates (import `format`)

## Props

| Prop | Type | Required | Description |
| --- | ---: | :---: | --- |
| `attempts` | Array<Object> | yes | List of attempts: `{ attemptId, user?: { id, name }, examTitle, score, totalMarks, status, startedAt, submittedAt }` |
| `loading` | boolean | no | Show skeleton rows when true (default false) |
| `showUser` | boolean | no | When true, render the user column (admin view) (default false) |
| `onView` | function(attemptId) | no | Callback when View action clicked |
| `className` | string | no | Additional classes for root container |

## Behavior / Logic Steps

1. Render a responsive table with columns: (User?), Exam, Score, Status, Started, Submitted, Actions.
2. When `loading` is true, render 4 skeleton rows.
3. For empty array, render a friendly "No recent attempts" message.
4. Format dates using `format(new Date(date), 'MMM d, yyyy HH:mm')` and handle invalid dates gracefully.
5. Actions: a `View` button that calls `onView(attemptId)` if provided.
6. Keep component side-effect free; do not perform network requests.

## Styling

- Use Tailwind utility classes for table styling and responsive behavior.
- Keep the design compact so multiple cards fit the dashboard.

## Exports

- Default export: `RecentAttempts` React component

## Tests (suggested)

- Snapshot with sample data, loading state, and empty state.
- Verify `onView` is called with correct id when clicking View button.
