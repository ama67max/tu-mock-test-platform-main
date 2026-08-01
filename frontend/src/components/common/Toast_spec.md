# Toast Component Specification

| Field | Value |
| --- | --- |
| File Path | frontend/src/components/common/Toast.jsx |
| Purpose | Thin wrapper around the app toast system for consistent notification helpers. |

## Dependencies

- react-hot-toast

## Logic Steps

1. Re-export the base toast instance.
2. Provide typed helpers for success, error, and info messages.
3. Merge default options with any custom options passed from the caller.

## Props / API

- `successToast(message, options)`
- `errorToast(message, options)`
- `infoToast(message, options)`
- Default export: the raw toast instance
