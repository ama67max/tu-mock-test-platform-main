# TU Mock Test Platform

This repository contains a high-concurrency mock exam platform with a Node.js/Express backend, a React + Vite frontend, PostgreSQL, and Redis.

Setup (development)

Prerequisites:

- Docker & Docker Compose
- Node.js 18+ and npm

Quick start with Docker Compose:

```bash
# from repository root
docker-compose up --build
```

This will start PostgreSQL, Redis, the backend (port 4000), the frontend dev server (5173), and an nginx proxy on port 80.

Local development (without Docker):

```bash
# install deps
cd backend && npm install
cd ../frontend && npm install

# run backend
cd backend && npm run dev

# run frontend
cd frontend && npm run dev
```

Important files

- `docker-compose.yml` - development docker composition
- `nginx/nginx.conf` - reverse proxy config for frontend/backend
- `Makefile` - convenience commands (`make up`, `make build`, `make test`)
- `高并发试题平台.md` - project blueprint and task list

Running tests

Frontend tests (Vitest):

```bash
cd frontend
npm test
```

Clerk authentication

The application can use Clerk for Google, email, and phone authentication without changing the Prisma schema. Configure the backend and frontend variables from the example files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Set `AUTH_PROVIDER=clerk`, `CLERK_SECRET_KEY`, and `VITE_CLERK_PUBLISHABLE_KEY`. In the Clerk dashboard, enable the Google, email, and phone providers and configure the local and production origins. The backend verifies Clerk sessions and resolves the existing local user by verified email.

Students can start an attempt and save answers before phone verification, but the backend rejects manual exam submission and all result/history/answer reads with `PHONE_VERIFICATION_REQUIRED` until Clerk reports a verified phone number. Automatic time-expiry finalization remains available for exam integrity; its result is still protected by the same verification gate.

Contributing

Follow the project's single-file task workflow: create a `.md` spec next to any new file, then implement the file and add tests.
