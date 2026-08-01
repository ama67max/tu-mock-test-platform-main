# Specification: frontend/src/components/admin/CategoryManager.jsx

## Purpose

UI for listing and creating categories. Uses `adminApi.getCategories` and `adminApi.createCategory` in page; the component itself is presentation-only.

## Props

- `categories` array
- `onCreate(name)`
- `loading` boolean

## Behavior

Render list with simple create form.
