import { and, eq, gte } from "drizzle-orm";
import { db } from "@/lib/db";
import { usageLogs, users } from "@/lib/db/schema";

export const PLAN_LIMITS = {
  FREE: { dailyGenerations: 3, label: "חינם" },
  PRO: { dailyGenerations: Infinity, label: "פרו" },
  BUSINESS: { dailyGenerations: Infinity, label: "עסקי" },
} as const;

export type Plan = keyof typeof PLAN_LIMITS;

function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export async function getTodayGenerationCount(userId: string): Promise<number> {
  const rows = await db
    .select({ id: usageLogs.id })
    .from(usageLogs)
    .where(
      and(
        eq(usageLogs.userId, userId),
        eq(usageLogs.action, "generate"),
        gte(usageLogs.createdAt, startOfToday())
      )
    );
  return rows.length;
}

export async function assertCanGenerate(userId: string, plan: Plan) {
  const limit = PLAN_LIMITS[plan].dailyGenerations;
  if (limit === Infinity) return;

  const used = await getTodayGenerationCount(userId);
  if (used >= limit) {
    throw new UsageLimitError(
      `הגעת למכסת ${limit} היצירות היומיות בתוכנית החינמית. שדרג לפרו כדי ליצור ללא הגבלה.`
    );
  }
}

export class UsageLimitError extends Error {}

export async function logGeneration(userId: string) {
  await db.insert(usageLogs).values({ userId, action: "generate" });
}

export async function getUserPlan(userId: string): Promise<Plan> {
  const [user] = await db
    .select({ plan: users.plan })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return (user?.plan as Plan) ?? "FREE";
}
