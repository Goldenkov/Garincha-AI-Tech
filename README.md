# Бизнес Перезагрузка с AI — MVP интерфейса

Next.js App Router MVP for a premium AI business toolkit interface and lead capture.

## Development

```bash
npm install
npm run dev
```

Useful checks:

```bash
npm run typecheck
npm run lint
npm run build
```

## Where to edit

- Main product, section, FAQ, legal and partner texts: `lib/content.ts`
- Main landing composition: `app/page.tsx`
- Partner page: `app/partners/page.tsx`
- Legal pages: `app/privacy/page.tsx`, `app/terms/page.tsx`
- English placeholders: `app/en/page.tsx`, `app/en/partners/page.tsx`

## Form delivery

Lead, partner and feedback forms POST to `/api/leads`, `/api/partners` and `/api/feedback`. Delivery is best-effort:

- optional Supabase insert via `SUPABASE_SERVICE_ROLE_KEY`
- optional Telegram notification via `TELEGRAM_BOT_TOKEN` and `TELEGRAM_LEADS_CHAT_ID`

If neither channel is configured, the API still accepts a valid submission and writes it to server logs.

## Future integrations

- Replace the 3D-like placeholder in `components/ProductBoxVisual.tsx` with a future `SplineScene` component.
- Add analytics and payment scripts in `app/layout.tsx` or route-level components when production services are selected.
