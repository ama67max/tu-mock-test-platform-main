# QuestionPanel Component Specification

| Field | Value |
| --- | --- |
| File Path | frontend/src/components/exam/QuestionPanel.jsx |
| Purpose | Displays the current question, options, and answer state in the exam interface. |

## Dependencies

- React
- OptionSelector component
- Button component

## Logic Steps

1. Render the question text and number.
2. Show all options using the option selector.
3. Highlight whether the question is marked for review.
4. Support callbacks for answer selection and review toggling.

## Props

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| question | object | yes | Question data from the exam state |
| selectedValue | any | no | Current selected answer |
| isMarkedForReview | boolean | no | Whether the question is flagged |
| onSelect | function | no | Called when a user chooses an option |
| onToggleReview | function | no | Called when review status changes |
