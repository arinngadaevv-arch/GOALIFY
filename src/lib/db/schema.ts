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

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  projects: many(projects),
  usageLogs: many(usageLogs),
  teamMembers: many(teamMembers),
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
