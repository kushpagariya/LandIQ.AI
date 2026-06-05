# LandIQ AI

Monorepo layout:

- `frontend/` - Vite + React UI
- `backend/` - FastAPI scaffold
- `docs/` - project context and notes

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Build:

```bash
cd frontend
npm run build
```

## Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

macOS / Linux:

```bash
source .venv/bin/activate
```

PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

Health check:

```bash
GET /health
```

## Notes

- The frontend is mock-data first.
- Root-level app-router files were removed in favor of the Vite frontend under `frontend/`.
- Generated build artifacts and Python caches are ignored at the repo root.