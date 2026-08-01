# Specification: frontend/src/components/dashboard/StatCard.jsx

## File Path

frontend/src/components/dashboard/StatCard.jsx

## Purpose

Small, reusable dashboard stat card used across student and admin dashboards to display a single KPI (e.g., `Avg Score`, `Total Attempts`, `Pass Rate`). Should be accessible, responsive, and styleable via Tailwind classes.

## Required Imports / Dependencies

- `React` — for component creation
- Optional: `lucide-react` icons (passed as `Icon` prop)

## Props

| Prop | Type | Required | Description |
| --- | ---: | :---: | --- |
| `title` | string | yes | Short label displayed above the value |
| `value` | string  number | yes | Primary metric value |
| `suffix` | string | no | Small suffix shown after value (e.g., `%`) |
| `delta` | number | no | Difference vs previous period (positive or negative) |
| `trend` | 'up'  'down'  null | no | Visual trend indicator (affects color/arrow) |
| `icon` | React component | no | Optional icon component to render in corner |
| `loading` | boolean | no | If true, show skeleton/placeholder instead of value |
| `className` | string | no | Additional classes to apply to root container |

## Behavior / Logic Steps

1. Render a rounded card with subtle shadow and padding. Keep background white (or `bg-surface` if theming) and support dark mode via Tailwind.
2. Top-left: `title` in muted text. Top-right: optional `icon` inside a small circle.
3. Center: Big `value` with optional `suffix` on the right.
4. Bottom: `delta` with an arrow and color: green for positive, red for negative, gray for zero/absent.
5. If `loading` is true, show a gray animated skeleton for the value area.
6. Ensure keyboard and screen-reader accessibility: use semantic tags and provide `aria-label` where appropriate.

## Styling

- Use Tailwind utility classes; no external CSS file. Keep sizes compact so multiple cards fit on dashboard grid.

## Exports

- Default export: `StatCard` React component

## Examples

```jsx
<StatCard
  title="Avg Score"
  value={78.4}
  suffix="%"
  delta={+2.3}
  trend="up"
  icon={TrendingUp}
/>
```

## Tests (suggested)

- Render snapshot with and without delta and icon.
- Accessibility: ensure title is available to screen readers and loading state has appropriate role.

---
