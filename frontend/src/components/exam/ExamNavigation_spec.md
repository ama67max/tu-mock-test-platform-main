# ExamNavigation Component Specification

| Field | Value |
| --- | --- |
| File Path | frontend/src/components/exam/ExamNavigation.jsx |
| Purpose | Grid-based question navigator for the exam interface. |

## Dependencies

- React

## Logic Steps

1. Render a button for each question in the current exam.
2. Show distinct styles for current, answered, marked, and unanswered questions.
3. Call `onSelect` when a question button is pressed.

## Props

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| questions | array | yes | List of questions |
| currentIndex | number | yes | Current active question index |
| answers | object | no | Map of selected answers |
| markedForReview | object | no | Map of flagged questions |
| onSelect | function | no | Callback when a question is selected |
