# Specification: frontend/src/components/admin/AdminStats.jsx

## Purpose

Shows admin-focused statistic cards (total users, total exams, total questions, active attempts). Reuses `StatCard`.

## Props

- `stats` object with keys: `users`, `exams`, `questions`, `activeAttempts`
- `loading` boolean

## Behavior

Render four `StatCard` components in a grid.
