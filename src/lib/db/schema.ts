import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  primaryKey,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import type { AdapterAccountType } from "next-auth/adapters";

export const planEnum = pgEnum("plan", ["FREE", "PRO", "BUSINESS"]);
export const toneEnum = pgEnum("tone", [
  "FUNNY",
  "LUXURY",
  "PROFESSIONAL",
  "TRENDY",
]);
export const platformEnum = pgEnum("platform", ["TIKTOK", "INSTAGRAM", "BOTH"]);
export const planDayContentTypeEnum = pgEnum("plan_day_content_type", [
  "VIDEO",
  "IMAGE",
  "REEL",
]);
export const planDayGoalEnum = pgEnum("plan_day_goal", [
  "REACH",
  "SALES",
  "ENGAGEMENT",
]);

// --- Vertical slice: Business / Decision / Outcome ---
export const decisionStatusEnum = pgEnum("decision_status", [
  "DRAFT",
  "APPROVED",
  "SENT",
]);
export const moveTypeEnum = pgEnum("move_type", ["EXPLOIT", "EXPLORE"]);
export const confidenceLevelEnum = pgEnum("confidence_level", [
  "LOW",
  "MEDIUM",
  "HIGH",
]);
export const moveChannelEnum = pgEnum("move_channel", [
  "REEL",
  "STORY",
  "DM_OUTREACH",
  "CALL",
  "PRICE_CHANGE",
  "REPLY_TO_COMMENTS",
  "NONE",
  "OTHER",
]);
export const executionTimeEnum = pgEnum("execution_time", [
  "UNDER_10",
  "TEN_TO_30",
  "OVER_30",
]);
export const chatRoleEnum = pgEnum("chat_role", ["USER", "ASSISTANT"]);

export const outcomeResultEnum = pgEnum("outcome_result", [
  "MORE_VIEWS",
  "MORE_MESSAGES",
  "MORE_COMMENTS",
  "NOTHING",
  "OTHER",
]);

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  plan: planEnum("plan").notNull().default("FREE"),
  teamName: text("team_name"),
  stripeCustomerId: text("stripe_customer_id").unique(),
  stripeSubscriptionId: text("stripe_subscription_id").unique(),
  stripePriceId: text("stripe_price_id"),
  stripeCurrentPeriodEnd: timestamp("stripe_current_period_end"),
  subscriptionStatus: text("subscription_status"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
  // Gates the analyst approval queue. Manual flag - no self-serve admin signup.
  isAdmin: boolean("is_admin").notNull().default(false),
  // Mandatory Terms of Service + health liability waiver, gated in the app
  // shell before any workout/plan content is reachable (see terms-gate.tsx).
  hasAcceptedTerms: boolean("has_accepted_terms").notNull().default(false),
  // Touched (throttled) in the NextAuth `session` callback - a real,
  // request-driven "last seen" signal for the admin dashboard's active-user
  // count, not a fabricated one.
  lastActiveAt: timestamp("last_active_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  ]
);

export const sessions = pgTable("session", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_token",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })]
);

export const passwordResetTokens = pgTable("password_reset_token", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  // sha256 hash of the raw token (the raw token is only ever in the email link)
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const teamMembers = pgTable("team_member", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  ownerId: text("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  role: text("role").notNull().default("member"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const projects = pgTable("project", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  businessType: text("business_type").notNull(),
  description: text("description").notNull(),
  targetAudience: text("target_audience").notNull(),
  tone: toneEnum("tone").notNull(),
  platform: platformEnum("platform").notNull(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const generatedContent = pgTable("generated_content", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id")
    .notNull()
    .unique()
    .references(() => projects.id, { onDelete: "cascade" }),
  ideas: jsonb("ideas").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const weeklyPlans = pgTable("weekly_plan", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id")
    .notNull()
    .unique()
    .references(() => projects.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const planDays = pgTable("plan_day", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  weeklyPlanId: text("weekly_plan_id")
    .notNull()
    .references(() => weeklyPlans.id, { onDelete: "cascade" }),
  dayIndex: integer("day_index").notNull(),
  idea: text("idea").notNull(),
  contentType: planDayContentTypeEnum("content_type").notNull(),
  goal: planDayGoalEnum("goal").notNull(),
});

/**
 * A real, append-only record of the moment a user clicks "claim my plan" on
 * the paywall - tier + the price listed to them at that moment. GOALIFY has
 * no live payment processor wired up, so this is honestly a checkout claim,
 * not a settled payment; the admin dashboard labels it that way rather than
 * implying collected revenue.
 */
export const checkoutEvents = pgTable("checkout_event", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tier: text("tier").notNull(),
  tierLabel: text("tier_label").notNull(),
  priceCents: integer("price_cents").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const usageLogs = pgTable("usage_log", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  action: text("action").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// --- Vertical slice ---

/** Aggregate root. One business owner today; may support multiple businesses per user later. */
export const businesses = pgTable("business", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  niche: text("niche").notNull().default("cosmetology"),
  // Free-text operational assets gathered once at setup (e.g. "how do you reach past
  // customers?"). Kept as a simple text blob for v1 - not a structured CRM.
  reachNotes: text("reach_notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/**
 * The atomic, append-only event. Once status is SENT, the app layer must never
 * mutate diagnosis/move/confidence/evidence/alternatives/falsification fields -
 * only a new Decision may supersede it. approvedAt/sentAt are set exactly once,
 * moving status forward, never backward.
 */
export const decisions = pgTable("decision", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  businessId: text("business_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  status: decisionStatusEnum("status").notNull().default("DRAFT"),

  // Signals (Step 1) - raw self-reported inputs this diagnosis was based on.
  signals: jsonb("signals").notNull(),

  // Diagnosis (Step 2)
  diagnosis: text("diagnosis").notNull(),

  // Confidence (Step "Confidence") - qualitative until real hit-rate history exists.
  confidence: confidenceLevelEnum("confidence").notNull(),
  confidenceReasoning: text("confidence_reasoning").notNull(),

  // Evidence - the specific signals that drove the diagnosis (subset/quote of `signals`).
  evidence: jsonb("evidence").notNull(),

  // Alternatives Considered - array of {hypothesis, whyRejected}, or [] if genuinely none.
  alternativesConsidered: jsonb("alternatives_considered").notNull(),

  // Decision (the move)
  moveType: moveTypeEnum("move_type").notNull(),
  moveChannel: moveChannelEnum("move_channel").notNull(),
  moveDescription: text("move_description").notNull(),
  // Ready-to-use asset for the move (the actual DM text / reel hook + caption /
  // call script) so the owner can execute in one copy, not just be told what to
  // do. Nullable: quiet days and some channels have no asset.
  executionAsset: text("execution_asset"),
  estimatedMinutes: integer("estimated_minutes"),

  // Falsification criteria - written before the outcome is known.
  falsificationCriteria: text("falsification_criteria").notNull(),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  approvedAt: timestamp("approved_at"),
  approvedByUserId: text("approved_by_user_id").references(() => users.id),
  sentAt: timestamp("sent_at"),
});

/**
 * Append-only fact linked to a Decision. Filled in two passes (immediate close,
 * then the 48h follow-up) but each pass only ever sets previously-null fields -
 * never overwrites an answer already given.
 */
export const outcomes = pgTable("outcome", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  decisionId: text("decision_id")
    .notNull()
    .unique()
    .references(() => decisions.id, { onDelete: "cascade" }),

  didExecute: boolean("did_execute"),
  executionTime: executionTimeEnum("execution_time"),
  immediateAnsweredAt: timestamp("immediate_answered_at"),

  result: outcomeResultEnum("result"),
  resultNote: text("result_note"),
  followupAnsweredAt: timestamp("followup_answered_at"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/**
 * Live chat between the business owner and the AI assistant, grounded only in
 * her own real signals/decisions/outcomes - the assistant explains existing
 * data, it never improvises new business advice (see lib/chat/generate.ts).
 */
export const chatMessages = pgTable("chat_message", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  businessId: text("business_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  role: chatRoleEnum("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const businessesRelations = relations(businesses, ({ one, many }) => ({
  user: one(users, { fields: [businesses.userId], references: [users.id] }),
  decisions: many(decisions),
  chatMessages: many(chatMessages),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  business: one(businesses, {
    fields: [chatMessages.businessId],
    references: [businesses.id],
  }),
}));

export const decisionsRelations = relations(decisions, ({ one }) => ({
  business: one(businesses, {
    fields: [decisions.businessId],
    references: [businesses.id],
  }),
  approvedBy: one(users, {
    fields: [decisions.approvedByUserId],
    references: [users.id],
  }),
  outcome: one(outcomes, {
    fields: [decisions.id],
    references: [outcomes.decisionId],
  }),
}));

export const outcomesRelations = relations(outcomes, ({ one }) => ({
  decision: one(decisions, {
    fields: [outcomes.decisionId],
    references: [decisions.id],
  }),
}));

export const checkoutEventsRelations = relations(checkoutEvents, ({ one }) => ({
  user: one(users, { fields: [checkoutEvents.userId], references: [users.id] }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  projects: many(projects),
  usageLogs: many(usageLogs),
  teamMembers: many(teamMembers),
  checkoutEvents: many(checkoutEvents),
}));

export const projectsRelations = relations(projects, ({ one }) => ({
  user: one(users, { fields: [projects.userId], references: [users.id] }),
  generatedContent: one(generatedContent, {
    fields: [projects.id],
    references: [generatedContent.projectId],
  }),
  weeklyPlan: one(weeklyPlans, {
    fields: [projects.id],
    references: [weeklyPlans.projectId],
  }),
}));

export const weeklyPlansRelations = relations(weeklyPlans, ({ one, many }) => ({
  project: one(projects, {
    fields: [weeklyPlans.projectId],
    references: [projects.id],
  }),
  days: many(planDays),
}));

export const planDaysRelations = relations(planDays, ({ one }) => ({
  weeklyPlan: one(weeklyPlans, {
    fields: [planDays.weeklyPlanId],
    references: [weeklyPlans.id],
  }),
}));
