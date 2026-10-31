# Support Copilot Admin Console

React JavaScript + Tailwind CSS frontend, restyled to the supplied minimal redesign reference across all five pages. This is a local frontend deliverable; it has not been published or deployed. No GitHub repository is required.

## Run

Use Node.js 22.12 or newer.

```sh
npm ci
npm run dev
```

Open the Local URL printed by Vite. Demo mode is the default and works without the Python backend or credentials.

```sh
npm test
npm run build
npm run preview
```

`dist/` is the production output. `npm run preview` is a local production-build preview, not a production server.

## Pages and routes

| URL | Page file | Behavior |
| --- | --- | --- |
| `/` | `src/App.jsx` | Redirects to `/queue` |
| `/queue` | `src/pages/QueuePage.jsx` | Priority-ordered queue with URL-backed filters |
| `/queue?filter=human` | same | Human review filter; also supports complaints, reports, duplicates |
| `/review` | `src/pages/ReviewPage.jsx` | Default sample complaint |
| `/review/:ticketId` | same | Individual ticket conversation, facts, editable reply, local actions |
| `/test-console` | `src/pages/TestConsolePage.jsx` | Demo triage or real backend request |
| `/rules` | `src/pages/RulesPage.jsx` | Search and browse sample catalog |
| `/rules?rule=…` | same | Citation deep link, canonical ID URL-encoded |
| `/insights` | `src/pages/InsightsPage.jsx` | Unmeasured metrics and local merge/template workflows |
| Any unknown route | `src/pages/NotFoundPage.jsx` | Friendly not-found screen |

Routes and link builders are centralized in `src/lib/routes.js`. Filenames and imports use consistent case for Linux hosting.

## Connect the existing backend

Copy `.env.example` to `.env.local` and set:

```dotenv
VITE_DATA_MODE=api
VITE_API_BASE_URL=/api
API_PROXY_TARGET=http://127.0.0.1:8000
```

Restart Vite after changing environment variables. Run the existing Python backend separately using its own startup command. In development, Vite forwards `/api/triage` to `http://127.0.0.1:8000/triage`; no backend CORS change is required for this same-origin proxy.

The test console sends `kind`, `server_lang`, `images_count`, and `messages` with attachment counts, matching the inspected FastAPI `TicketIn` contract. Responses are checked before rendering. Non-JSON proxy responses, HTTP errors, backend fallbacks, cancellation, and client timeouts are handled. A fallback may arrive with HTTP 200 and confidence 0; the console identifies it as needing human review.

**Only the Test console calls the backend today.** The inspected service exposes `/triage` and `/health`, but has no endpoints for ticket lists, sending replies, feedback, rule catalogs, merging groups, template decisions, or analytics. The other pages therefore remain explicitly labeled local previews even in API mode. Drafts and actions persist in this browser's local storage; they do not send a reply or update the Python backend. They are not a substitute for authenticated storage.

Never put `GEMINI_API_KEY` or other secrets in frontend environment variables. Vite embeds `VITE_` variables in public browser assets. The existing Gemini key stays in the Python service.

The PDF contains no clickable external links. The application uses explicit internal routes and the backend endpoint verified in the supplied backend source. Backend taxonomy codes are used where the PDF's illustrative category labels differ. Replies do not claim that unseen screenshots prove a violation. The preview rule summaries are illustrative and are not the authoritative rulebook. No supplied training, validation, generated case data, prediction files, or credentials are included.

## Deployment

The frontend is ready to build as a static SPA. Deployment must serve `index.html` for application routes so browser refresh and direct links work. Assets must retain their original URLs and content types.

### Netlify / Cloudflare Pages

Build command: `npm run build`. Output directory: `dist`. `public/_redirects` is copied into the output and provides SPA route fallbacks. For API mode, add a platform-specific `/api/*` proxy **before** SPA fallback rules, or use a separate API origin with backend CORS configured. The supplied static-host defaults are for demo mode.

### Vercel

`vercel.json` sets the output folder and rewrites the known application routes. Static assets are served normally. Add a `/api/:path*` rewrite to your actual backend before the application rewrites when enabling API mode. No production backend URL was provided, so none is invented in this project.

### Docker / Nginx

The Dockerfile builds with `npm ci` and serves `dist/` using Nginx. The default `nginx.conf` serves the standalone demo with SPA fallbacks, immutable hashed-asset caching, and an uncached index; unconfigured API requests return JSON with HTTP 503. For real API mode, replace or mount this configuration with `nginx.api.conf`, which adds the same-origin `/api/` reverse proxy. Change `backend:8000` to the actual backend service address, or name the backend service `backend` on the same Docker network. Nginx must be able to resolve that upstream before starting. Build args `VITE_DATA_MODE` and `VITE_API_BASE_URL` control the frontend build.

```sh
docker build --build-arg VITE_DATA_MODE=api -t support-copilot-admin .
```

Vite environment values are set at build time; changing runtime container variables does not alter already-built browser assets. This project assumes domain-root hosting. For a subdirectory deployment, configure both Vite's `base` and BrowserRouter's `basename`, and adjust hosting rewrites before building.

Before exposing real administrative data, supply backend authentication and authorization, replace the sample catalog and ticket fixtures with authenticated endpoints, and connect send/feedback/analytics operations. No login screen or security boundary is simulated by this UI.

## Verification

`npm test` runs 19 checks and covers direct entry to all routes, queue-to-review navigation, queue filters, draft persistence, send confirmation, rule search and deep links, demo triage, merge/template actions, and API request/error handling. The app uses a dark sidebar, soft blue accents, summary cards, and responsive ticket cards. The app is responsive, keyboard navigable, and includes visible focus states, form labels, reduced-motion handling, a skip link, and live announcements.

Reference setup documentation: [Tailwind CSS with Vite](https://tailwindcss.com/docs/installation/using-vite), [Vite static deployment](https://vite.dev/guide/static-deploy).
