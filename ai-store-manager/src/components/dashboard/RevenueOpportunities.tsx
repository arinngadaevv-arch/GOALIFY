import { Panel } from "./Panel";
import { revenueOpportunities } from "@/lib/mock-dashboard-data";

const DIFFICULTY_LABEL: Record<string, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

export function RevenueOpportunities() {
  return (
    <Panel
      title="Revenue Opportunities"
      action={
        <span className="text-sm font-semibold text-good">
          {revenueOpportunities.totalEstimateLabel} recoverable
        </span>
      }
    >
      <ul className="flex flex-col divide-y divide-border">
        {revenueOpportunities.items.map((item) => (
          <li key={item.title} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
            <div>
              <p className="text-sm font-medium">{item.title}</p>
              <p className="mt-1 text-xs text-muted">{item.reason}</p>
              <div className="mt-2 flex items-center gap-2 text-xs">
                <span className="rounded-full bg-accent-soft px-2 py-0.5 text-accent">
                  {item.impact}
                </span>
                <span className="text-muted">{DIFFICULTY_LABEL[item.difficulty]}</span>
              </div>
            </div>
            <button className="shrink-0 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-surface-2">
              Apply
            </button>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
