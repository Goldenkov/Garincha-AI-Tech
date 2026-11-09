# AGENTS.md

## Cursor Cloud specific instructions

This is a single Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 web app (`business-reboot-ai`): a Russian-language product that takes a user from an idea to a confirmed business hypothesis and a first demand check, with per-user projects stored in Supabase. Package manager is **npm** (`package-lock.json`).

Standard commands live in `package.json` and `README.md`: `npm run dev` (port 3000), `npm run build`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:integration`, `npm run test:e2e`. Design rules: `DESIGN.md`. Operations, migrations and rollback: `docs/OPERATIONS.md`.

Non-obvious notes:
- **Local Supabase is needed for sign-in, projects and steps.** Public pages, the catalog and the anonymous draft work without it. Start it with the Supabase CLI (`supabase start`, needs Docker). In this VM Docker needs `sudo`, so run `sudo env PATH=$PATH supabase start`. If containers cannot reach each other, run `sudo iptables-legacy -P FORWARD ACCEPT`. Put `SUPABASE_URL=http://127.0.0.1:54321`, `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` from `supabase status` into `.env.local` (git-ignored).
- **Login codes** arrive in Mailpit at http://127.0.0.1:54324 (API: `/api/v1/search?query=to:<email>`). E2E tests read codes from there.
- **Production URL rule**: when `NODE_ENV=production`, an `http://` `SUPABASE_URL` is treated as "not configured". So `next start` against the local stack shows private pages as unavailable. Use `npm run dev` for full flows.
- **Request interceptor** is `proxy.ts` (Next 16 replaced `middleware.ts`). It refreshes the session and redirects `/projects`, `/startup/*` and `/account` to `/login?next=…`.
- **Form delivery**: `/api/leads`, `/api/partners`, `/api/feedback` succeed only if the database (service role) or Telegram confirmed receipt. Otherwise they return 503. Nothing is logged with payloads.
- **PRO** uses individual codes. Issue them with `node --env-file=.env.local scripts/access-codes.mjs issue --days 30`. The shared `PRO_ACCESS_CODE` and `/access` are gone (`/access` redirects to `/account`).
- `npm run test:integration` skips unless `SUPABASE_URL` is a localhost URL. After adding a migration, apply it with `sudo env PATH=$PATH supabase migration up`.
- **Client IP** for rate limits comes only from `X-Forwarded-For` written by trusted proxies (`TRUSTED_PROXY_HOPS`, default 0 = ignore the header, one shared bucket). Locally all requests share a bucket anyway.
- `docker compose` is not installed in this VM; to test the production image use `sudo docker build -t business-reboot-ai .` and `sudo docker run` with the compose environment.
- `next dev` rewrites `next-env.d.ts` (`.next/dev/types`); do not commit that change.
