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

## Future integrations

- Replace the 3D-like placeholder in `components/ProductBoxVisual.tsx` with a future `SplineScene` component.
- Connect lead and partner forms in `lib/form-submit.ts`; the current contract is ready for an API route, Supabase, n8n webhook, Telegram bot or CRM.
- Add analytics and payment scripts in `app/layout.tsx` or route-level components when production services are selected.
