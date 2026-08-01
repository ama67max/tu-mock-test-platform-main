# Button Component Specification

| Field | Value |
| --- | --- |
| File Path | frontend/src/components/common/Button.jsx |
| Purpose | Reusable button primitive with loading, disabled, full-width, and variant support. |

## Dependencies

- React
- clsx / tailwind-merge
- LoadingSpinner component

## Logic Steps

1. Render a styled button with a default variant and size.
2. Disable interaction when `disabled` or `isLoading` is true.
3. Show a spinner when loading state is active.
4. Support optional full-width layout and custom classes.

## Props

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| variant | string | no | `primary`, `secondary`, `danger`, or `ghost` |
| size | string | no | `sm`, `md`, or `lg` |
| isLoading | boolean | no | Displays loading spinner and disables the button |
| disabled | boolean | no | Disables the button |
| fullWidth | boolean | no | Makes the button span the full width |
| children | node | yes | Button label/content |
| className | string | no | Custom classes |

## API Contract

- Input: button state and content from the parent component.
- Output: a styled button element with proper accessibility attributes.
