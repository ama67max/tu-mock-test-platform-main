# Specification: frontend/src/api/analyticsApi.js

## File Path

frontend/src/api/analyticsApi.js

## Purpose

Client-side API module for fetching analytics data used by the dashboard and charts (overview stats, subject breakdown, trend data, top performers, per-exam stats). Uses the project's configured Axios instance so auth and interceptors are applied.

## Required Imports / Dependencies

- `axios` — import from `./axiosConfig`

## Exports (Public API)

- `getDashboardStats(params)` — fetch overview statistics (totals, averages)
- `getSubjectBreakdown(examId)` — fetch per-subject performance breakdown
- `getTrendData({ examId, range })` — fetch time-series score/trend data
- `getTopPerformers(examId, limit)` — fetch top N performers for an exam
- `getExamStats(examId)` — fetch detailed stats for a specific exam

## Logic Steps

1. Use the configured Axios instance for all requests.
2. Accept `params` objects for list endpoints and pass them as query params.
3. Validate required arguments (e.g., `examId`) and throw an Error early if missing.
4. Normalize errors to `Error` objects with `error.payload = err.response?.data`.
5. Keep this module side-effect free (no toasts/UI).

## API Contracts (Backend endpoints - expected)

| Function | Method | Path | Query / Body | Success Response (shape) |
| --- | ---: | --- | --- | --- |
| `getDashboardStats` | GET | `/api/analytics/dashboard` | `examId?` | `{ data: { totalAttempts, avgScore, passRate, activeUsers } }` |
| `getSubjectBreakdown` | GET | `/api/analytics/subjects` | `examId` | `{ data: [ { subject, avgScore, questionCount } ] }` |
| `getTrendData` | GET | `/api/analytics/trends` | `examId, range` | `{ data: [ { date, avgScore, attempts } ] }` |
| `getTopPerformers` | GET | `/api/analytics/top-performers` | `examId, limit` | `{ data: [ { userId, name, score, rank } ] }` |
| `getExamStats` | GET | `/api/analytics/exams/:examId/stats` | — | `{ data: { examId, distribution, median, stddev } }` |

## Error Handling

- Throw `Error(message)` where `message` is `err.response?.data?.message || err.message`.
- Attach `err.response?.data` as `error.payload` for callers that need structured info.

## Examples

```js
import { getDashboardStats, getSubjectBreakdown } from '../api/analyticsApi';
const stats = await getDashboardStats({ examId: 42 });
const subjects = await getSubjectBreakdown(42);
```

## Tests (suggested)

- Unit tests mocking `axios` responses for each function, verifying return shape and normalized errors.
- Integration tests against staging analytics endpoints to validate performance and payloads.

---

Prepared for Task 92: implement `frontend/src/api/analyticsApi.js`.
