# docker-compose.yml Spec (Task 112)

Purpose:

- Define a development-friendly `docker-compose.yml` that brings up PostgreSQL, Redis, backend, frontend, and an optional nginx reverse proxy.

Requirements:

- Services: `postgres`, `redis`, `backend`, `frontend`, `nginx` (optional/proxy).
- `postgres` should use a named volume for persistence and expose default port 5432.
- `redis` should use the official image and expose default port 6379.
- `backend` should build from `./backend`, expose port `4000` and be linked to `postgres` and `redis` via environment variables derived from `.env` where applicable.
- `frontend` should build from `./frontend` and expose port `5173` (Vite dev), or be served by `nginx` in production mode.
- `nginx` should be optional; when present it should forward `/api` to backend and root to the frontend static files.
- Use `depends_on` where appropriate to order startup.
- Provide example environment variables and volumes.

Notes:

- Keep the file focused on local developer experience. Production deployment may differ.
