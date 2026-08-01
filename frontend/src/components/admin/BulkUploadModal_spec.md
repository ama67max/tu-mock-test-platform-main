# Specification: frontend/src/components/admin/BulkUploadModal.jsx

## Purpose

Modal component for CSV bulk upload of questions. Allows selecting a CSV file and triggers an `onUpload(file)` callback. Shows parsing preview (first few rows) and validation errors if provided.

## Props

- `isOpen` boolean
- `onClose()`
- `onUpload(file)`
- `loading` boolean
- `errors` array (optional)

## Behavior

- Accept only `.csv` files. Read first few lines for preview using FileReader. Do not parse fully in UI.
- Keep component side-effect free; actual upload handled by `onUpload`.
