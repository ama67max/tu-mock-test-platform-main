# ExamTimer Component Specification

| Field | Value |
| --- | --- |
| File Path | frontend/src/components/exam/ExamTimer.jsx |
| Purpose | Visual countdown timer for an active exam session. |

## Dependencies

- React
- lucide-react icons

## Logic Steps

1. Render a timer card showing minutes and seconds.
2. Highlight when the timer is low on time.
3. Support an optional label and custom class name.

## Props

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| seconds | number | yes | Remaining time in seconds |
| label | string | no | Optional label shown above the timer |
| className | string | no | Extra classes |
