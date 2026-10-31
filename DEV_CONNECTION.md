# Local frontend/backend connection

The projects in this folder are connected through the Vite /api proxy. The frontend .env.local enables API mode. Model credentials remain in the backend .env.

Open two terminals:

Backend:
```sh
cd /Users/zhanel/Desktop/hakaton/la-tirage
npm run dev
```

Frontend:
```sh
cd /Users/zhanel/Desktop/hakaton/support-copilot
npm run dev
```

Stop any older frontend process on port 5177 first with Ctrl+C in its terminal. Open http://127.0.0.1:5177.

The backend npm command wraps the Python server in .venv. Backend npm install is not required. The previous venv folder is preserved; the working Python environment is .venv.

- /test-console sends POST /api/triage to Python /triage.
- /rules loads the actual backend rules_kb.json catalog.
- /data loads all four JSON files from backend /data/{filename}, with search and pagination.
- /api/health reports Python readiness.
- Queue and Insights workflows remain previews because the backend has no live ticket database, reply-delivery endpoint or operational analytics API. Historical examples are available in Data library, not mislabeled as live triaged tickets.

This is local development wiring. Production still needs the configured backend reverse proxy and administrator authentication before exposing the data beyond localhost.

Verified locally: frontend 19 tests and production build passed; backend 14 API/pipeline tests passed; proxied health returned ready=true; all four JSON endpoints returned their full expected record counts; proxied trivial-report triage returned report.offtopic/p3 with confidence 0.9; unknown data filenames returned HTTP 404. The triage check used the backend fast path and did not call Gemini.
