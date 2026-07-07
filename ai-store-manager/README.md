# AI Store Manager

An AI employee for Shopify merchants: it connects to a store via OAuth,
continuously scans it, and turns findings into concrete, one-click
improvements instead of just another analytics report.

This is a standalone project living inside the GOALIFY repo at
`ai-store-manager/`. It does not share code, dependencies, or a database
with the sibling TrendSpark AI app at the repo root — treat it as its own
deployable app.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- Postgres + Drizzle ORM
- Shopify OAuth + Admin API
- Dark-mode-first UI

## What's implemented so far

- **Shopify OAuth**: `/api/auth/install` (redirect to Shopify) and
  `/api/auth/callback` (HMAC + state verification, token exchange, shop
  upsert, session cookie). See `src/lib/shopify/`.
- **Webhook endpoint**: `/api/webhooks/shopify` verifies the HMAC signature
  and handles `app/uninstalled`. Register additional topics as features land.
- **Database schema** (`src/db/schema.ts`): shops, shop settings/automation
  mode, sessions, cached products, scans (per-category scores), recommendations
  (the core "what's wrong / why / impact / fix" unit), background tasks,
  webhook event log, daily reports, subscriptions.
- **Dashboard shell** (`/dashboard`): store scores, revenue opportunities,
  today's AI tasks, completed improvements, pending approvals, latest store
  changes, traffic/sales/product stats. Currently backed by placeholder data
  in `src/lib/mock-dashboard-data.ts` — swap for real queries as scanning and
  recommendation generation land.

Everything else in the product spec (store scanner, product analysis,
copywriter, SEO/accessibility AI, pricing intelligence, automation modes) is
intentionally not built yet — this is the architecture to build it on top of.

## Local setup

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL and Shopify app credentials
npm run db:push        # apply the schema to your Postgres database
npm run dev
```

Open http://localhost:3000. Note that Shopify OAuth requires a publicly
reachable `SHOPIFY_APP_URL` (e.g. an ngrok tunnel) and a corresponding app
configured in the Shopify Partner Dashboard with a matching redirect URL of
`<SHOPIFY_APP_URL>/api/auth/callback`.

## Before committing

```bash
npm run lint
npm run build
```
