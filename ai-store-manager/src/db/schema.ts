import {
  pgTable,
  text,
  timestamp,
  integer,
  numeric,
  jsonb,
  uuid,
  pgEnum,
} from "drizzle-orm/pg-core";

// Shopify grants each shop one access token per set of scopes.
// A "shop" is the tenant boundary for everything else in this schema.
export const shops = pgTable("shops", {
  id: uuid("id").primaryKey().defaultRandom(),
  domain: text("domain").notNull().unique(), // e.g. my-store.myshopify.com
  accessToken: text("access_token").notNull(),
  scope: text("scope").notNull(),
  shopName: text("shop_name"),
  email: text("email"),
  planName: text("plan_name"),
  currency: text("currency"),
  timezone: text("timezone"),
  installedAt: timestamp("installed_at", { withTimezone: true }).defaultNow().notNull(),
  uninstalledAt: timestamp("uninstalled_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const automationModeEnum = pgEnum("automation_mode", [
  "suggest_only",
  "approve",
  "auto",
]);

// One row per shop holding merchant-configurable AI behavior.
export const shopSettings = pgTable("shop_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  shopId: uuid("shop_id")
    .notNull()
    .references(() => shops.id, { onDelete: "cascade" })
    .unique(),
  automationMode: automationModeEnum("automation_mode").notNull().default("suggest_only"),
  autoApplyCategories: jsonb("auto_apply_categories").$type<string[]>().notNull().default([]),
  brandTone: text("brand_tone"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Signed, httpOnly session cookie maps to a row here; keeps the Shopify
// access token out of the browser entirely.
export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  shopId: uuid("shop_id")
    .notNull()
    .references(() => shops.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Cached copy of Shopify products so scans/scores don't need a live API call.
export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  shopId: uuid("shop_id")
    .notNull()
    .references(() => shops.id, { onDelete: "cascade" }),
  shopifyProductId: text("shopify_product_id").notNull(),
  title: text("title").notNull(),
  handle: text("handle"),
  status: text("status"),
  price: numeric("price", { precision: 12, scale: 2 }),
  imageCount: integer("image_count").notNull().default(0),
  variantCount: integer("variant_count").notNull().default(0),
  optimizationScore: integer("optimization_score"),
  lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const scanTargetEnum = pgEnum("scan_target", [
  "store",
  "homepage",
  "collection",
  "product",
  "checkout",
  "navigation",
  "page",
]);

// Result of a single AI Store Scanner pass over one target (store-wide or a page/product).
export const scans = pgTable("scans", {
  id: uuid("id").primaryKey().defaultRandom(),
  shopId: uuid("shop_id")
    .notNull()
    .references(() => shops.id, { onDelete: "cascade" }),
  target: scanTargetEnum("target").notNull(),
  targetRef: text("target_ref"), // product handle, page path, etc. Null for store-wide scans.
  storeHealthScore: integer("store_health_score"),
  conversionScore: integer("conversion_score"),
  seoScore: integer("seo_score"),
  designScore: integer("design_score"),
  trustScore: integer("trust_score"),
  performanceScore: integer("performance_score"),
  accessibilityScore: integer("accessibility_score"),
  rawFindings: jsonb("raw_findings"),
  startedAt: timestamp("started_at", { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

export const recommendationCategoryEnum = pgEnum("recommendation_category", [
  "conversion",
  "seo",
  "design",
  "accessibility",
  "copywriting",
  "trust",
  "pricing",
  "performance",
]);

export const recommendationStatusEnum = pgEnum("recommendation_status", [
  "pending",
  "approved",
  "applied",
  "dismissed",
  "failed",
]);

export const recommendationSeverityEnum = pgEnum("recommendation_severity", [
  "low",
  "medium",
  "high",
  "critical",
]);

export const recommendationDifficultyEnum = pgEnum("recommendation_difficulty", [
  "easy",
  "medium",
  "hard",
]);

// A single actionable improvement the AI found. This is the core unit of
// value shown on the dashboard: what's wrong, why it matters, expected impact.
export const recommendations = pgTable("recommendations", {
  id: uuid("id").primaryKey().defaultRandom(),
  shopId: uuid("shop_id")
    .notNull()
    .references(() => shops.id, { onDelete: "cascade" }),
  scanId: uuid("scan_id").references(() => scans.id, { onDelete: "set null" }),
  productId: uuid("product_id").references(() => products.id, { onDelete: "cascade" }),
  category: recommendationCategoryEnum("category").notNull(),
  severity: recommendationSeverityEnum("severity").notNull().default("medium"),
  title: text("title").notNull(),
  problem: text("problem").notNull(), // what is wrong (explanation)
  reason: text("reason").notNull(), // why it matters
  estimatedImpact: text("estimated_impact"), // expected business impact, human-readable
  estimatedRevenueCents: integer("estimated_revenue_cents"),
  aiRecommendation: text("ai_recommendation").notNull().default(""), // what the AI suggests doing
  difficulty: recommendationDifficultyEnum("difficulty").notNull().default("easy"),
  estimatedTimeSavedMinutes: integer("estimated_time_saved_minutes"),
  // One-click fix payload. kind: "automated" fixes execute via /api/recommendations/[id]/apply;
  // kind: "manual" fixes carry guidance the merchant follows in Shopify admin.
  proposedChange: jsonb("proposed_change").$type<{
    kind: "automated" | "manual";
    action: string;
    params?: Record<string, unknown>;
  }>(),
  status: recommendationStatusEnum("status").notNull().default("pending"),
  appliedAt: timestamp("applied_at", { withTimezone: true }),
  appliedResult: jsonb("applied_result"),
  error: text("error"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const taskStatusEnum = pgEnum("task_status", ["queued", "running", "done", "error"]);

// Background/scheduled work items (nightly scans, applying an approved
// recommendation, generating the daily report, etc.).
export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  shopId: uuid("shop_id")
    .notNull()
    .references(() => shops.id, { onDelete: "cascade" }),
  recommendationId: uuid("recommendation_id").references(() => recommendations.id, {
    onDelete: "cascade",
  }),
  type: text("type").notNull(),
  status: taskStatusEnum("status").notNull().default("queued"),
  payload: jsonb("payload"),
  result: jsonb("result"),
  error: text("error"),
  scheduledFor: timestamp("scheduled_for", { withTimezone: true }).defaultNow().notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Log of Shopify webhook deliveries, keyed by topic, for idempotency and debugging.
export const webhookEvents = pgTable("webhook_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  shopId: uuid("shop_id").references(() => shops.id, { onDelete: "cascade" }),
  topic: text("topic").notNull(),
  shopifyWebhookId: text("shopify_webhook_id").unique(),
  payload: jsonb("payload"),
  processedAt: timestamp("processed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const dailyReports = pgTable("daily_reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  shopId: uuid("shop_id")
    .notNull()
    .references(() => shops.id, { onDelete: "cascade" }),
  reportDate: text("report_date").notNull(), // YYYY-MM-DD, one report per shop per day
  completedImprovements: integer("completed_improvements").notNull().default(0),
  newOpportunities: integer("new_opportunities").notNull().default(0),
  criticalIssues: integer("critical_issues").notNull().default(0),
  estimatedRevenueOpportunityCents: integer("estimated_revenue_opportunity_cents"),
  summary: text("summary"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "trialing",
  "active",
  "past_due",
  "canceled",
]);

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  shopId: uuid("shop_id")
    .notNull()
    .references(() => shops.id, { onDelete: "cascade" })
    .unique(),
  shopifyChargeId: text("shopify_charge_id"),
  planName: text("plan_name").notNull().default("free"),
  status: subscriptionStatusEnum("status").notNull().default("trialing"),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
