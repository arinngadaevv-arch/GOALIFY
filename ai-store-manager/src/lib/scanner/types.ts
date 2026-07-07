export type Severity = "low" | "medium" | "high" | "critical";

export type Category =
  | "conversion"
  | "seo"
  | "design"
  | "accessibility"
  | "copywriting"
  | "trust"
  | "pricing"
  | "performance";

export interface FixAction {
  kind: "automated" | "manual";
  action: string;
  params?: Record<string, unknown>;
}

// One issue the scanner found, in the exact shape the product spec demands:
// title, severity, explanation, why it matters, expected impact,
// AI recommendation, and a one-click fix action.
export interface Finding {
  category: Category;
  severity: Severity;
  title: string;
  explanation: string;
  whyItMatters: string;
  expectedImpact: string;
  aiRecommendation: string;
  fix: FixAction;
  // Link back to the product this finding is about, when applicable.
  shopifyProductId?: string;
  productTitle?: string;
}

export const SEVERITY_WEIGHT: Record<Severity, number> = {
  low: 2,
  medium: 5,
  high: 10,
  critical: 18,
};
