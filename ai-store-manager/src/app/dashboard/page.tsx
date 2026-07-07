import { Sparkles } from "lucide-react";
import { redirect } from "next/navigation";
import { ScoreCard } from "@/components/dashboard/ScoreCard";
import { ScanButton } from "@/components/dashboard/ScanButton";
import {
  RecommendationCard,
  type RecommendationView,
} from "@/components/dashboard/RecommendationCard";
import { Panel } from "@/components/dashboard/Panel";
import {
  formatRevenueCents,
  getAppliedRecommendations,
  getLatestScan,
  getPendingRecommendations,
  type RecommendationRow,
} from "@/lib/dashboard-data";
import { getSessionShop } from "@/lib/session";
import { formatDistanceToNow } from "date-fns";

function toView(rec: RecommendationRow): RecommendationView {
  return {
    id: rec.id,
    category: rec.category,
    severity: rec.severity,
    title: rec.title,
    problem: rec.problem,
    reason: rec.reason,
    estimatedImpact: rec.estimatedImpact,
    aiRecommendation: rec.aiRecommendation,
    automated: rec.proposedChange?.kind === "automated",
    status: rec.status,
    error: rec.error,
  };
}

export default async function DashboardPage() {
  const shop = await getSessionShop();
  if (!shop) redirect("/");

  const [scan, pending, applied] = await Promise.all([
    getLatestScan(shop.id),
    getPendingRecommendations(shop.id),
    getAppliedRecommendations(shop.id),
  ]);

  if (!scan) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 py-24 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft">
          <Sparkles size={26} className="text-accent" />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold">Let&apos;s take a look at your store</h2>
          <p className="max-w-md text-sm text-muted">
            I&apos;ll scan your products, collections, homepage, navigation, policies, SEO,
            accessibility and trust signals — then hand you a prioritized list of fixes.
          </p>
        </div>
        <ScanButton label="Run my first scan" />
      </div>
    );
  }

  const scores = [
    { label: "Store Health", value: scan.storeHealthScore },
    { label: "Conversion", value: scan.conversionScore },
    { label: "SEO", value: scan.seoScore },
    { label: "Design", value: scan.designScore },
    { label: "Trust", value: scan.trustScore },
    { label: "Performance", value: scan.performanceScore },
    { label: "Accessibility", value: scan.accessibilityScore },
  ];

  const recoverableCents = pending.reduce((sum, r) => sum + (r.estimatedRevenueCents ?? 0), 0);
  const criticalCount = pending.filter((r) => r.severity === "critical").length;
  const automatedCount = pending.filter((r) => r.proposedChange?.kind === "automated").length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">
            {pending.length === 0
              ? "Everything I found is handled — your store is in good shape."
              : `I found ${pending.length} thing${pending.length > 1 ? "s" : ""} worth fixing` +
                (criticalCount > 0 ? `, ${criticalCount} critical` : "") +
                "."}
          </h2>
          <p className="text-xs text-muted">
            Last scan {formatDistanceToNow(scan.startedAt, { addSuffix: true })}
            {automatedCount > 0 && ` · ${automatedCount} can be fixed in one click`}
          </p>
        </div>
        <ScanButton label="Re-scan store" />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
        {scores.map((s) => (
          <ScoreCard key={s.label} label={s.label} value={s.value ?? 0} />
        ))}
      </div>

      {pending.length > 0 && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">Recommendations</h2>
            {recoverableCents > 0 && (
              <span className="text-sm font-semibold text-good">
                ~{formatRevenueCents(recoverableCents)}/mo estimated opportunity
              </span>
            )}
          </div>
          <div className="flex flex-col gap-3">
            {pending.map((rec) => (
              <RecommendationCard key={rec.id} rec={toView(rec)} />
            ))}
          </div>
        </section>
      )}

      {applied.length > 0 && (
        <Panel title="Completed improvements">
          <ul className="flex flex-col gap-3">
            {applied.map((rec) => (
              <li key={rec.id} className="flex items-center gap-2 text-sm">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-good" />
                <span className="flex-1">{rec.title}</span>
                {rec.appliedAt && (
                  <span className="text-xs text-muted">
                    {formatDistanceToNow(rec.appliedAt, { addSuffix: true })}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  );
}
