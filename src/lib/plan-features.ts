import type { Plan } from "@/lib/usage";

/**
 * What each plan unlocks in the decision product (distinct from the legacy
 * content-generation limits in usage.ts). Kept in one place so gates and the
 * pricing page never drift apart.
 */
export type PlanFeatures = {
  /** How many businesses/brands the user may manage. */
  maxBusinesses: number;
  /** Access to the "what actually works for you" insights (Track Record patterns). */
  insights: boolean;
};

const FEATURES: Record<Plan, PlanFeatures> = {
  FREE: { maxBusinesses: 1, insights: false },
  PRO: { maxBusinesses: 5, insights: true },
  BUSINESS: { maxBusinesses: Infinity, insights: true },
};

export function getPlanFeatures(plan: Plan): PlanFeatures {
  return FEATURES[plan] ?? FEATURES.FREE;
}
