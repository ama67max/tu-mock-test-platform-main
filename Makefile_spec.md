# Makefile Spec (Task 114)

Purpose:

- Provide convenient developer commands to build, run, and test services using Docker Compose and local npm scripts.

Requirements:

- Targets: `install`, `deps`, `build`, `up`, `down`, `logs`, `frontend-install`, `backend-install`, `test`, `lint`, `clean`.
- `up` should run `docker-compose up --build`.
- `build` should build backend and frontend images and create any necessary volume directories.
- `install` should install both backend and frontend npm dependencies.
- Commands should be simple wrappers with sensible defaults.

Notes:

- Keep makefile cross-platform friendly where practical; assume developer on Linux/macOS or WSL on Windows.
