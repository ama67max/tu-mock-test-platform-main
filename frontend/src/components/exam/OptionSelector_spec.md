# OptionSelector Component Specification

| Field | Value |
| --- | --- |
| File Path | frontend/src/components/exam/OptionSelector.jsx |
| Purpose | Reusable option choice control for exam answers. |

## Dependencies

- React

## Logic Steps

1. Render a selectable option row with a radio-style indicator.
2. Show the chosen state when `checked` is true.
3. Call `onChange` when the option is selected.

## Props

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| value | string | yes | Option value |
| label | string | yes | Option label text |
| checked | boolean | no | Whether this option is currently selected |
| onChange | function | no | Callback invoked when selected |
