# nginx/nginx.conf Spec (Task 113)

Purpose:

- Provide an `nginx.conf` suitable for running as a reverse proxy in front of the frontend SPA and the backend API.

Requirements:

- Listen on port 80 (HTTP). Use a simple configuration that can be extended for SSL.
- Route requests starting with `/api/` to the backend upstream (e.g., `http://backend:4000`).
- Serve the frontend single-page app from `/usr/share/nginx/html` with `try_files $uri /index.html`.
- Set sensible client body size and timeouts for file uploads (e.g., CSV bulk uploads).
- Add basic gzip and caching headers for static assets.

Notes:

- Keep configuration minimal and well-documented for developers.
