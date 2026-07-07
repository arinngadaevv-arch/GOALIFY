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
  (severity + explanation + why-it-matters + impact + AI recommendation +
  fix payload), background tasks, webhook event log, daily reports,
  subscriptions. Initial migration lives in `drizzle/`.
- **AI Store Scanner** (`src/lib/scanner/`): a real rule-based engine with
  ~30 checks across products (titles, descriptions, images, ALT text, SEO
  metadata, variants, pricing), collections, navigation menus, legal policies,
  trust pages, homepage (title/meta/H1/og:image/ALT coverage/page weight/
  script count), duplicate detection, and branding consistency. Each scan
  computes per-category scores (conversion, SEO, design, accessibility,
  trust, performance, …) plus an overall Store Health score, caches per-product
  optimization scores, and persists everything. Data fetching degrades
  gracefully when a scope is missing — those checks simply contribute nothing.
- **Recommendation engine**: every finding becomes a recommendation row with
  severity (Low/Medium/High/Critical), what's wrong, why it matters, expected
  business impact, an AI recommendation, and a one-click fix payload. A fresh
  scan supersedes pending recommendations; applied/dismissed ones are kept as
  history.
- **One-click fix engine** (`src/lib/fixes.ts` + `/api/recommendations/[id]/apply`):
  automated fixes generate content with Claude (`@anthropic-ai/sdk`, structured
  JSON output) and write it back through Shopify Admin GraphQL mutations —
  rewrite title, rewrite description, generate SEO metadata, generate image
  ALT text, generate collection descriptions. Manual fixes carry step-by-step
  guidance instead. Failures are recorded on the recommendation row.
- **Dashboard on real data** (`/dashboard`): first-run empty state with a
  "Run my first scan" CTA; after a scan, real category scores, a severity-ranked
  recommendation list with expandable detail (what's wrong / why it matters /
  AI recommendation) and Apply/Dismiss actions, estimated recoverable revenue,
  and completed-improvement history. Plus `/dashboard/scanner` (scan history),
  `/dashboard/products` (per-product optimization scores), and
  `/dashboard/settings` (working automation-mode setting).

Still to come from the product spec: behavioral/conversion analytics, the
full copywriter surface, pricing experiments, daily reports, Auto Mode
execution, and webhook-driven re-scans.

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
