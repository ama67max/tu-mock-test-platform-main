# Specification: frontend/src/components/admin/ExamCreator.jsx

## Purpose

Form component to create/edit exam metadata (title, duration, totalMarks, category).

## Props

- `onSubmit(payload)` - called with exam payload
- `initial` - optional initial values

## Behavior

Client-side validation for required fields. Keep UI simple and use Tailwind.
