import {
  trafficOverview,
  salesOverview,
  productPerformance,
} from "@/lib/mock-dashboard-data";

const STATS = [
  {
    label: "Traffic",
    value: trafficOverview.visitors.toLocaleString(),
    change: trafficOverview.change,
  },
  { label: "Sales", value: salesOverview.revenue, change: salesOverview.change },
  {
    label: "Top Product",
    value: productPerformance.topProduct,
    change: `${productPerformance.unitsSold} sold`,
  },
];

export function StatRow() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {STATS.map((stat) => (
        <div key={stat.label} className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs text-muted">{stat.label}</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-semibold">{stat.value}</span>
            <span className="text-xs text-good">{stat.change}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
