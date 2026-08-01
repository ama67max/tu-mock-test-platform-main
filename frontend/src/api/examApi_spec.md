# examApi Component Specification

| Field | Value |
| --- | --- |
| File Path | frontend/src/api/examApi.js |
| Purpose | Frontend API helpers for listing exams and fetching exam details. |

## Dependencies

- axios instance from axiosConfig

## Logic Steps

1. Expose a helper to fetch the list of available exams.
2. Expose a helper to fetch a single exam by id.
3. Use the shared axios instance with consistent auth handling.

## API Contract

- `getExams(params)` -> GET `/exams`
- `getExamById(id)` -> GET `/exams/:id`
