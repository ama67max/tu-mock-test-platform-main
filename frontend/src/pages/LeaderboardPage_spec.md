# Specification: frontend/src/pages/LeaderboardPage.jsx

## File Path

frontend/src/pages/LeaderboardPage.jsx

## Purpose

Page to display top performers (leaderboard) for a selected exam. Allows selecting an exam (by id), viewing top N performers, and exporting leaderboard CSV.

## Required Imports / Dependencies

- React, useEffect, useState
- `analyticsApi.getTopPerformers` from `frontend/src/api/analyticsApi.js`
- `resultApi.exportResultsCSV` from `frontend/src/api/resultApi.js` for CSV export

## Props / UI Controls

- Exam selector: simple input for `examId` (number) and a `Load` button. The page will also attempt to use `analyticsApi.getDashboardStats()` to find a `defaultExamId` on mount.
- Limit selector: small dropdown or input to control number of top performers to fetch (default 10).
- Export button: calls CSV export and triggers download.

## Behavior / Logic Steps

1. On mount, attempt to fetch `defaultExamId` from `analyticsApi.getDashboardStats()` and auto-load leaderboard.
2. When user changes `examId` and clicks `Load`, fetch `getTopPerformers(examId, limit)`.
3. Show loading state while fetching and an error message on failure.
4. Render a table: Rank, Name, Score, Rank (if provided), Completed At.
5. Export CSV button should call `resultApi.exportResultsCSV({ examId })`, receive a blob, and trigger a download with an appropriate filename.
6. Defensive: if no examId, show a short prompt to enter/select an exam.

## Exports

- Default export: `LeaderboardPage` React component

## Tests (suggested)

- Mock `analyticsApi` and `resultApi` to validate loading, table rendering, and CSV blob download trigger.
