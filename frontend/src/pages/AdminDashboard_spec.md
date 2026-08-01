# Specification: frontend/src/pages/AdminDashboard.jsx

## Purpose

Admin landing page showing `AdminStats`, recent users table, and quick actions. Fetches admin stats and user list via `adminApi` and `analyticsApi`.

## Behavior

- On mount fetch stats and recent users.
- Display `AdminStats` and `UserTable`.
