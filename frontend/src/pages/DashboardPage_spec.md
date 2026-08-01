# Specification: frontend/src/pages/DashboardPage.jsx

## File Path

frontend/src/pages/DashboardPage.jsx

## Purpose

Student dashboard page that composes several dashboard components and fetches data from analytics and results APIs. Shows KPI cards, a performance trend chart, subject breakdown, and recent attempts.

## Required Imports / Dependencies

- React, useEffect, useState
- `frontend/src/components/dashboard/StatCard.jsx`
- `frontend/src/components/dashboard/PerformanceChart.jsx`
- `frontend/src/components/dashboard/SubjectBreakdown.jsx`
- `frontend/src/components/dashboard/RecentAttempts.jsx`
- `frontend/src/api/analyticsApi.js`
- `frontend/src/api/resultApi.js`

## Behavior / Logic Steps

1. On mount, fetch `getDashboardStats()` and `getResults({ limit: 6 })` concurrently.
2. If `getDashboardStats()` returns an `examId` or `defaultExamId`, fetch `getTrendData({ examId, range: '30d' })` and `getSubjectBreakdown(examId)`; otherwise, skip charts and show informational message.
3. Maintain loading states for KPIs, charts, and recent attempts separately.
4. Provide `onViewAttempt(attemptId)` handler to navigate or open attempt details — for now call `console.log` (UI consumer will override or wire router).
5. Layout: responsive grid — KPI row (4 cards), two-column main area (charts left, recent attempts right).
6. Keep component presentational: do not perform routing; expose hooks/callbacks for parent if needed later.

## Exports

- Default export: `DashboardPage` React component

## Tests (suggested)

- Snapshot with mocked API responses.
- Integration: mount and verify calls to `analyticsApi` and `resultApi` are made.
