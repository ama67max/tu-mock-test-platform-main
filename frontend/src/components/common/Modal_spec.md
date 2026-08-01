# Modal Component Specification

| Field | Value |
| --- | --- |
| File Path | frontend/src/components/common/Modal.jsx |
| Purpose | Reusable modal dialog for forms, confirmations, and content overlays. |

## Dependencies

- React
- react-dom for portal rendering
- lucide-react for the close icon
- Button component for the default footer action

## Logic Steps

1. Render the modal only when `isOpen` is true.
2. Trap focus and keyboard interaction by listening for the Escape key.
3. Prevent background scrolling while the modal is open.
4. Close the modal when the backdrop is clicked.
5. Render an optional header, body, and footer with configurable size.

## Props

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| isOpen | boolean | yes | Controls whether the modal is visible |
| onClose | function | yes | Called when the modal should close |
| title | string | no | Optional modal title |
| children | node | yes | Modal body content |
| footer | node | no | Custom footer content |
| size | string | no | One of `sm`, `md`, `lg`, `xl` |
| showCloseButton | boolean | no | Whether to render the top-right close button |

## API Contract

- Input: modal state and content from the parent component.
- Output: callback to close the modal and optional custom footer UI.
