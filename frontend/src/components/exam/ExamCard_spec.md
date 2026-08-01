# ExamCard Component Specification

| Field | Value |
| --- | --- |
| File Path | frontend/src/components/exam/ExamCard.jsx |
| Purpose | Reusable card component for displaying an exam summary and launch action. |

## Dependencies

- React
- lucide-react icons
- Button component

## Logic Steps

1. Display exam title, category, duration, and total marks.
2. Show a status badge for published or draft exams.
3. Render a call-to-action button to start or view the exam.
4. Support an optional custom action slot.

## Props

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| exam | object | yes | Exam data from the API |
| onStart | function | no | Called when the user starts the exam |
| actionLabel | string | no | Button label |
| children | node | no | Optional custom action content |
