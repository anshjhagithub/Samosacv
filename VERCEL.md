# Vercel deployment

## Environment variables

Set these in the Vercel project (Settings → Environment Variables):

- **MISTRAL_API_KEY** – Server-only. Never use `NEXT_PUBLIC_` for this.
- **NEXT_PUBLIC_SUPABASE_URL** – Supabase project URL.
- **NEXT_PUBLIC_SUPABASE_ANON_KEY** – Supabase anon key.
- **SUPABASE_SERVICE_ROLE_KEY** – For Cashfree webhook (updates profiles). Server-only.
- **CONFIRM_GENERATION_SECRET** (optional) – For generation limits / payments.
- **NEXT_PUBLIC_SITE_URL** (optional) – Canonical URL for SEO/Open Graph.
- **CASHFREE_APP_ID**, **CASHFREE_SECRET_KEY** – Cashfree PG (server-only).
- **CASHFREE_ENV** – `TEST` or `PROD`.
- **NEXT_PUBLIC_BASE_URL** – Base URL for payment return (e.g. `https://your-app.vercel.app`).
- **NEXT_PUBLIC_CASHFREE_ENV** – `TEST` or `PROD` (for frontend SDK mode).

## Favicon and OG image

- Add `public/favicon.ico` for the tab icon.
- Add `public/og.png` (1200×630) for Open Graph previews. If missing, metadata still works; social shares may show no image.

## Build

- `npm run build` runs successfully (Next.js 14).
- Supabase Edge Functions live in `supabase/functions` and are deployed separately via Supabase CLI; they are excluded from the Next.js TypeScript build.
