# Specification: frontend/src/api/adminApi.js

## File Path

frontend/src/api/adminApi.js

## Purpose

Client-side API module for admin-specific endpoints (user management, exam creation, question upload, categories). Wraps the configured Axios instance and normalizes errors.

## Required Imports / Dependencies

- `axios` from `./axiosConfig`

## Exports

- `getUsers(params)`
- `updateUser(userId, payload)`
- `deleteUser(userId)`
- `createExam(payload)`
- `uploadQuestion(payload)`
- `createCategory(payload)`
- `getCategories()`

## Error Handling

- Normalize errors to `Error(message)` and attach `error.payload` with `err.response?.data`.

## Notes

- Keep module side-effect free and rely on interceptors for auth.
