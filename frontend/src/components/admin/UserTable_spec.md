# Specification: frontend/src/components/admin/UserTable.jsx

## Purpose

Admin user management table with pagination and simple actions (activate/deactivate, delete).

## Props

- `users` array
- `loading` boolean
- `onToggleActive(userId)`
- `onDelete(userId)`
- `onEdit(user)`

## Behavior

Render table with columns: Name, Email, Role, Active, Actions. Show skeleton rows when loading.
