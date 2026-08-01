# Navbar Component Specification

| Field | Value |
| --- | --- |
| File Path | frontend/src/components/layout/Navbar.jsx |
| Purpose | Top navigation bar for guest and authenticated users. |

## Dependencies

- React Router
- lucide-react
- useAuth hook

## Logic Steps

1. Show public links for guests and authenticated-only links for signed-in users.
2. Render a mobile menu toggle and a user dropdown when authenticated.
3. Handle logout and route navigation.

## Props

None.

## API Contract

- Reads auth state from the auth hook.
- Triggers logout and navigation when the user signs out.
