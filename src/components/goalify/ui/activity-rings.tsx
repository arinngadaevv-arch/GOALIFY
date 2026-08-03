"use client";

import clsx from "clsx";
import type { LucideIcon } from "lucide-react";
import { ProgressRing } from "./progress-ring";

export type ActivityMetric = {
  key: string;
  label: string;
  value: number;
  goal: number;
  unit: string;
  color: string;
  icon: LucideIcon;
};

/**
 * Apple Fitness-style concentric rings — three metrics, outer to inner in
 * the order passed in. Each ring's own legend row sits alongside it so the
 * raw numbers are always readable, not just implied by fill percentage.
 */
export function ActivityRings({
  metrics,
  size = 148,
}: {
  metrics: ActivityMetric[];
  size?: number;
}) {
  const percents = metrics.map((m) => Math.min(100, Math.round((m.value / m.goal) * 100)));
  const overallPercent = Math.round(
    percents.reduce((sum, p) => sum + p, 0) / Math.max(1, percents.length),
  );

  return (
    <div className="flex items-center gap-6">
      <ProgressRing
        size={size}
        thickness={12}
        gap={6}
        rings={metrics.map((m, i) => ({
          value: percents[i],
          color: m.color,
          label: m.label,
        }))}
      >
        <div>
          <p className="gf-numeric text-2xl font-black text-ink">{overallPercent}%</p>
          <p className="text-[10px] font-bold tracking-[0.1em] text-mist uppercase">
            Today
          </p>
        </div>
      </ProgressRing>

      <div className="min-w-0 flex-1 space-y-3.5">
        {metrics.map((metric, i) => (
          <RingLegendRow
            key={metric.key}
            metric={metric}
            percent={percents[i]}
          />
        ))}
      </div>
    </div>
  );
}

function RingLegendRow({
  metric,
  percent,
}: {
  metric: ActivityMetric;
  percent: number;
}) {
  const complete = percent >= 100;
  const Icon = metric.icon;

  return (
    <div>
      <div className="flex items-center gap-2">
        <span
          className="grid size-5 shrink-0 place-items-center rounded-full"
          style={{ background: `${metric.color}1a` }}
        >
          <Icon className="size-3" style={{ color: metric.color }} strokeWidth={2.6} />
        </span>
        <span className="text-xs font-bold uppercase tracking-[0.08em] text-mist">
          {metric.label}
        </span>
        <span
          className={clsx(
            "gf-numeric ml-auto text-sm font-extrabold",
            complete ? "text-lime-deep" : "text-ink",
          )}
        >
          {Math.round(metric.value).toLocaleString()}
          <span className="ml-0.5 text-[10px] font-bold text-mist">
            /{metric.goal.toLocaleString()} {metric.unit}
          </span>
        </span>
      </div>
      <div className="mt-1.5 ml-7 h-1.5 overflow-hidden rounded-full bg-ink/6">
        <div
          className="gf-progress-fill h-full rounded-full transition-[width] duration-700"
          style={{
            width: `${percent}%`,
            background: metric.color,
            boxShadow: complete ? `0 0 8px ${metric.color}99` : undefined,
          }}
        />
      </div>
    </div>
  );
}
