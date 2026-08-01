# Specification: frontend/src/api/resultApi.js

## File Path

frontend/src/api/resultApi.js

## Purpose

Client-side API module for fetching and exporting exam results and attempt details from the backend. Provides a thin, well-documented wrapper around the shared Axios instance (`frontend/src/api/axiosConfig.js`) and standardizes return values and error handling for UI callers.

## Required Imports / Dependencies

- `axios` — import from `./axiosConfig` (the project's configured Axios instance)

## Exports (Public API)

- `getResults(params)` — fetch paginated results list (student or exam scoped)
- `getResult(attemptId)` — fetch detailed result summary for a single attempt
- `getAttemptAnswers(attemptId)` — fetch per-question answers for an attempt (for review)
- `exportResultsCSV(examId, options)` — request a CSV export (returns blob)

## Logic Steps

1. Use the configured Axios instance for all requests so interceptors (auth refresh) apply.
2. For list endpoints, accept a `params` object and pass it as query params (page, limit, examId, userId, sort).
3. For single-resource endpoints, validate `attemptId` presence and call the appropriate URL path.
4. For `exportResultsCSV`, call endpoint with `responseType: 'blob'` and return the blob for the UI to download.
5. Wrap each call in try/catch; on error, normalize to an `Error` with a helpful message and include `response?.data` if present.
6. Do not perform UI-side notifications in this module (keep it testable and side-effect free). Let callers handle toasts/errors.

## API Contracts (Backend endpoints - expected)

| Function | Method | Path | Query / Body | Success Response (shape) |
| --- | ---: | --- | --- | --- |
| `getResults` | GET | `/api/results` | `page, limit, examId, userId` | `{ data: [ { attemptId, userId, examId, score, startedAt, submittedAt } ], meta: { total, page, limit } }` |
| `getResult` | GET | `/api/results/:attemptId` | — | `{ data: { attemptId, user, exam, score, breakdown, answers } }` |
| `getAttemptAnswers` | GET | `/api/results/:attemptId/answers` | — | `{ data: [ { questionId, selectedOption, correct, marksObtained } ] }` |
| `exportResultsCSV` | GET | `/api/admin/results/export` | `examId` | `Blob (text/csv)` |

> Note: Actual backend routes may vary; frontend callers should match backend contract. Adjust path constants if backend uses a different route prefix.

## Error Handling

- Throw an `Error` with message constructed from `err.response?.data?.message || err.message` so UI can display human-friendly errors.
- Attach `err.response?.data` as `err.payload` before rethrowing for callers that need structured debug info.

## Examples

```js
import { getResults, getResult } from '../api/resultApi';

const { data, meta } = await getResults({ page: 1, limit: 20, examId: 42 });
const result = await getResult(123);
```

## Tests (suggested)

- Unit: mock `axios` to respond with typical shapes and verify each function returns `data` portion and throws normalized errors on 4xx/5xx.
- Integration: call against a staging backend and verify CSV blob response headers and content type.

## File Notes

- Keep the module side-effect free. Do not import UI components or toasters.
- Use named exports to allow tree-shaking.

---

Prepared for Task 91: implement `frontend/src/api/resultApi.js` next.
