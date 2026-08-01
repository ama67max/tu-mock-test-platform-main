# useTimer Hook Specification

| Field | Value |
| --- | --- |
| File Path | frontend/src/hooks/useTimer.js |
| Purpose | Countdown timer hook for active exam sessions with local persistence. |

## Dependencies

- React
- Zustand exam store

## Logic Steps

1. Initialize a countdown from the exam store's remaining time.
2. Tick every second until the timer reaches zero.
3. Persist the remaining time in localStorage for recovery.
4. Stop and cleanup when the exam completes or unmounts.

## API Contract

- Input: exam timer state from the store.
- Output: countdown state and helper methods for the UI.
