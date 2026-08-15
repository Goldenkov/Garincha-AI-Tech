# AGENTS.md

## Cursor Cloud specific instructions

This is a single Next.js (App Router) + TypeScript + Tailwind CSS v4 web app (`business-reboot-ai`), a Russian-language marketing/lead-capture landing site with a gated "PRO" content area. Package manager is **npm** (`package-lock.json`).

Standard commands live in `package.json` and `README.md`: `npm run dev` (port 3000), `npm run build`, `npm run lint`, `npm run typecheck`.

Non-obvious notes:
- **PRO access gate**: `middleware.ts` gates `/journey`, `/launch-kit`, `/dashboard`; unauthenticated requests redirect to `/access`. To unlock in dev, submit the access code on the `/access` page (or POST it to `/api/verify-access`). `PRO_ACCESS_CODE` is optional in dev — it falls back to `change-me-before-production`; it is **required in production** (the verify route returns 503 if unset and `NODE_ENV=production`). Env vars are documented in `.env.example`; no `.env` file is needed to run/test in dev.
- **Form delivery**: lead, partner and feedback forms POST to `/api/leads`, `/api/partners` and `/api/feedback`. `lib/server/submissions.ts` delivers best-effort to optional Supabase and Telegram. Missing channels do not fail the request; the payload is logged instead.
- Public pages are statically rendered. Server routes: `/api/verify-access`, `/api/logout`, `/api/leads`, `/api/partners`, `/api/feedback`.
