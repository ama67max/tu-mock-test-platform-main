# ExamListPage Component Specification

| Field | Value |
| --- | --- |
| File Path | frontend/src/pages/ExamListPage.jsx |
| Purpose | Student-facing page that lists published exams and allows starting one. |

## Dependencies

- React
- useEffect/useState
- examApi helpers
- ExamCard component
- LoadingSpinner component

## Logic Steps

1. Fetch the list of published exams on mount.
2. Show a loading spinner while the request is in progress.
3. Render an empty state if no exams are returned.
4. Display exams using the shared ExamCard component.

## Props

None.

## API Contract

- Calls `getExams()` and renders the returned exam list.
