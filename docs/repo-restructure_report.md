# Repository Restructure Report

## Objective and Scope

Reorganize the repo so the live React app lives under `frontend/`, create a usable `backend/` scaffold, and update root docs and ignore rules to match the new layout.

## Root Causes Found

- The active Vite frontend was sitting at the repo root instead of `frontend/`.
- `frontend/` was empty, so running frontend commands there failed immediately.
- The repo had stale Next.js app-router files at the root that did not match the Vite app.
- There was no root README or `.gitignore` for the split frontend/backend layout.

## Changes Made by File

- [frontend/package.json](../frontend/package.json) - renamed the package and added UI helper dependencies used by shared components.
- [frontend/tsconfig.json](../frontend/tsconfig.json) - added the `@/*` path alias for source imports.
- [frontend/vite.config.ts](../frontend/vite.config.ts) - added the `@` alias for Vite resolution.
- [frontend/tailwind.config.ts](../frontend/tailwind.config.ts) - expanded content paths for the relocated frontend files.
- [frontend/components.json](../frontend/components.json) - updated shadcn paths for the Vite layout.
- [backend/main.py](../backend/main.py) - added a minimal FastAPI app with `/` and `/health` routes.
- [backend/requirements.txt](../backend/requirements.txt) - added backend runtime and test dependencies.
- [backend/tests/test_main.py](../backend/tests/test_main.py) - added a smoke test for the backend health endpoint.
- [backend/app/*](../backend/app) and [backend/ml/*](../backend/ml) - added package markers so the backend tree is tracked.
- [README.md](../README.md) - documented the monorepo layout and local run commands.
- [.gitignore](../.gitignore) - ignored frontend build output, frontend/backend dependency folders, and Python cache files.

## Verification Performed

- Ran `npm run build` from `frontend/` successfully.
- The build completed without import or path resolution errors.
- Vite reported only a chunk-size warning for the bundled frontend.

## Known Limitations or Follow-ups

- The backend scaffold has not been executed in this environment yet because Python dependencies were not installed here.
- The frontend bundle is still large; code splitting could reduce the warning if that becomes a priority.