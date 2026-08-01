# Specification: frontend/src/components/admin/QuestionUploader.jsx

## Purpose

Form to create a single question (text, options, correct answer, difficulty, marks). Minimal UI for admin to add questions.

## Props

- `onSubmit(question)`
- `initial` (optional)

## Behavior

Collect inputs and call `onSubmit` with normalized object. Keep validation minimal.
