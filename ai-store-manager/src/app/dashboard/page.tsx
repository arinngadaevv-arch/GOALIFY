import { ScoreCard } from "@/components/dashboard/ScoreCard";
import { RevenueOpportunities } from "@/components/dashboard/RevenueOpportunities";
import { SimpleList } from "@/components/dashboard/SimpleList";
import { StatRow } from "@/components/dashboard/StatRow";
import {
  storeScores,
  todaysTasks,
  completedImprovements,
  pendingApprovals,
  latestStoreChanges,
} from "@/lib/mock-dashboard-data";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
        {storeScores.map((score) => (
          <ScoreCard key={score.key} label={score.label} value={score.value} />
        ))}
      </div>

      <RevenueOpportunities />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SimpleList
          title="Today's AI Tasks"
          items={todaysTasks.map((t) => ({ title: t.title, status: t.status }))}
        />
        <SimpleList
          title="Completed Improvements"
          items={completedImprovements.map((t) => ({ title: t.title, meta: t.when }))}
        />
        <SimpleList
          title="Pending Approvals"
          items={pendingApprovals.map((t) => ({ title: t.title, status: t.risk }))}
        />
      </div>

      <SimpleList
        title="Latest Store Changes"
        items={latestStoreChanges.map((c) => ({ title: c.title, meta: c.when }))}
      />

      <StatRow />
    </div>
  );
}
