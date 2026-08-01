# LoadingSpinner Component Specification

| Field | Value |
| --- | --- |
| File Path | frontend/src/components/common/LoadingSpinner.jsx |
| Purpose | Reusable loading indicator with optional full-screen overlay support. |

## Dependencies

- React
- clsx / tailwind-merge
- UI store for global overlay state
- SVG assets for the spinner animation

## Logic Steps

1. Render a spinner with a size variant.
2. Add an accessible status region and screen-reader label.
3. Optionally render the spinner inside a full-screen overlay.
4. Show a global overlay when the UI store indicates global loading.

## Props

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| size | string | no | `sm`, `md`, `lg`, or `xl` |
| label | string | no | Accessible label |
| className | string | no | Extra classes |
| overlay | boolean | no | Whether to render a centered overlay |

## API Contract

- Input: loading state configuration from the parent or UI store.
- Output: accessible spinner UI with optional overlay behavior.
