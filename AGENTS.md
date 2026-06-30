# AGENTS.md

## Cursor Cloud specific instructions

This is a single Next.js (App Router) + TypeScript + Tailwind CSS v4 web app (`business-reboot-ai`), a Russian-language marketing/lead-capture landing site with a gated "PRO" content area. Package manager is **npm** (`package-lock.json`). There is no database or external service — lead/partner forms are mocked client-side in `lib/form-submit.ts`.

Standard commands live in `package.json` and `README.md`: `npm run dev` (port 3000), `npm run build`, `npm run lint`, `npm run typecheck`.

Non-obvious notes:
- **PRO access gate**: `middleware.ts` gates `/journey`, `/launch-kit`, `/dashboard`; unauthenticated requests redirect to `/access`. To unlock in dev, submit the access code on the `/access` page (or POST it to `/api/verify-access`). `PRO_ACCESS_CODE` is optional in dev — it falls back to `change-me-before-production`; it is **required in production** (the verify route returns 503 if unset and `NODE_ENV=production`). Env vars are documented in `.env.example`; no `.env` file is needed to run/test in dev.
- All other pages are statically rendered; only `/api/verify-access` and `/api/logout` are server-rendered.
