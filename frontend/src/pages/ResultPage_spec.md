# Specification: frontend/src/pages/ResultPage.jsx

## File Path

frontend/src/pages/ResultPage.jsx

## Purpose

Page to display a detailed result for a single attempt, including summary (score, exam, user), per-question answers with correctness and marks, and optional explanation text. Fetches data from `resultApi.getResult` and `resultApi.getAttemptAnswers`.

## Required Imports / Dependencies

- `React`, `useEffect`, `useState`
- `useParams`, `useNavigate` from `react-router-dom` to get `attemptId` from route and optionally navigate
- `resultApi` functions: `getResult`, `getAttemptAnswers`
- `date-fns` `format` for date formatting

## Behavior / Logic Steps

1. Read `attemptId` from route params; if missing show an informative message.
2. On mount, fetch both result summary and attempt answers in parallel. Manage `loading`, `error`, and data states separately.
3. Render summary card: exam title, user (if present), score (marks/total, percentage), started/submitted times, status.
4. Render answers list: for each answer show question text, selected option, correct answer, correctness flag, marks obtained, and explanation if any.
5. Include a `Back` button to navigate back (using `useNavigate`).
6. Normalize and surface API errors as human-friendly messages; no toasts in this module.

## Exports

- Default export: `ResultPage` React component

## Tests (suggested)

- Unit: mock `resultApi` to return sample payloads and verify rendering of summary and answers.
- Integration: verify navigation back and error handling.
