# useExam Hook Specification

| Field | Value |
| --- | --- |
| File Path | frontend/src/hooks/useExam.js |
| Purpose | React hook for coordinating exam data, answers, navigation, and submission state. |

## Dependencies

- React
- Zustand exam store
- attempt API helpers

## Logic Steps

1. Expose exam state from the Zustand store.
2. Provide helpers to load an exam and start an attempt.
3. Allow answer updates, review toggling, and navigation.
4. Return loading and submission flags for the UI.

## API Contract

- Input: exam selection and attempt payload from the UI.
- Output: exam state helpers and derived UI state.
