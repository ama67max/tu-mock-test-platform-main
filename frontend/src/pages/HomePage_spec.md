# HomePage.spec

Purpose: Define the content and behavior expected from the `HomePage` component.

Requirements:

- Render a welcoming hero section with the app name and short description.
- Show primary actions/links: `Dashboard`, `Exams`, `Leaderboard`, `Login`.
- If a `user` prop or auth context exists, show a `Go to Dashboard` CTA instead of `Login`.
- Be responsive and use existing style system (Tailwind classes).
- Minimal layout so tests can assert presence of key texts and links.

Accessibility:

- Use semantic headings (h1) for the main title.
- Links should have discernible text.

Notes:

- Keep implementation lightweight — this page is mostly a simple landing component.
- Tests will check for title text and the presence of the key navigation links.
