// Placeholder data for the dashboard shell. Once scans/recommendations are
// wired to real Shopify data, replace these with queries against the db.

export const storeScores = [
  { key: "health", label: "Store Health", value: 78 },
  { key: "conversion", label: "Conversion", value: 64 },
  { key: "seo", label: "SEO", value: 71 },
  { key: "design", label: "Design", value: 82 },
  { key: "trust", label: "Trust", value: 88 },
  { key: "performance", label: "Performance", value: 59 },
  { key: "accessibility", label: "Accessibility", value: 68 },
] as const;

export const revenueOpportunities = {
  totalEstimateLabel: "$4,280/mo",
  items: [
    {
      title: "Add To Cart button sits below the fold on mobile",
      reason: "68% of mobile visitors never scroll far enough to see it.",
      impact: "+2.1% conversion",
      difficulty: "easy" as const,
    },
    {
      title: "12 products are missing size guides",
      reason: "Products without a size guide return 3x more often.",
      impact: "+$860/mo est.",
      difficulty: "medium" as const,
    },
    {
      title: "Homepage hero has no clear CTA",
      reason: "Visitors land, see no next step, and bounce within 4s.",
      impact: "+1.4% conversion",
      difficulty: "easy" as const,
    },
  ],
};

export const todaysTasks = [
  { title: "Scan homepage for accessibility issues", status: "running" as const },
  { title: "Rewrite descriptions for 4 low-conversion products", status: "queued" as const },
  { title: "Generate FAQ block for best-seller collection", status: "queued" as const },
];

export const completedImprovements = [
  { title: "Rewrote 6 product titles for SEO", when: "2h ago" },
  { title: "Added trust badges to checkout", when: "5h ago" },
  { title: "Fixed 3 broken internal links", when: "Yesterday" },
];

export const pendingApprovals = [
  { title: "Apply 20% bundle discount on Summer collection", risk: "review" as const },
  { title: "Replace hero image on homepage", risk: "review" as const },
];

export const latestStoreChanges = [
  { title: "Product \"Linen Shirt\" price changed", when: "10m ago" },
  { title: "New order #1042 received", when: "32m ago" },
  { title: "Collection \"New Arrivals\" updated", when: "1h ago" },
];

export const trafficOverview = { visitors: 8420, change: "+6.2%" };
export const salesOverview = { revenue: "$12,940", change: "+3.8%" };
export const productPerformance = { topProduct: "Linen Shirt", unitsSold: 214 };
