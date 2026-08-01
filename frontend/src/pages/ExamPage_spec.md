# ExamPage Component Specification

| Field | Value |
| --- | --- |
| File Path | frontend/src/pages/ExamPage.jsx |
| Purpose | Main student exam page for taking a live mock exam. |

## Dependencies

- React
- useExam hook
- useTimer hook
- ExamTimer, QuestionPanel, ExamNavigation components
- Button component

## Logic Steps

1. Load an exam attempt for the selected exam.
2. Render the timer, question panel, and question navigation.
3. Allow answer selection and review toggling.
4. Submit the exam and show a completion state.

## Props

None.

## API Contract

- Uses the exam hook and current exam state from the store.
