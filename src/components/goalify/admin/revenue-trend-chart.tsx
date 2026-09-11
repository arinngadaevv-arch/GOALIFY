"use client";

import { useMemo, useState } from "react";
import { GlassCard } from "@/components/goalify/ui/glass-card";

/** Same gold used for VisitorTrendChart's bars — one established "trend
 * chart" color for this whole dashboard. */
const BAR_COLOR = "#e8b32c";

export type RevenueTrendBucket = { bucket: string; cents: number };

/** Zero-fills the last 30 daily buckets — see revenueTrendQuery in
 * admin/page.tsx, which only returns a row for a day with at least a
 * dollar of revenue, so a `GROUP BY` naturally omits quiet days. Always
 * exactly 30 days ending today; no range picker, unlike VisitorTrendChart,
 * since this is a much lower-cardinality signal. */
function buildSeries(rows: RevenueTrendBucket[]) {
  const byKey = new Map(rows.map((row) => [row.bucket, row.cents]));
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const series = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setUTCDate(date.getUTCDate() - i);
    series.push({
      date,
      label: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      }),
      cents: byKey.get(date.toISOString()) ?? 0,
    });
  }
  return series;
}

function formatMoney(cents: number) {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function RevenueTrendChart({ trend }: { trend: RevenueTrendBucket[] }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const series = useMemo(() => buildSeries(trend), [trend]);

  const max = Math.max(1, ...series.map((point) => point.cents));
  const width = 720;
  const height = 180;
  const barGap = 2;
  const barWidth = Math.min(24, width / series.length - barGap);
  const totalBarsWidth = series.length * (barWidth + barGap) - barGap;
  const startX = (width - totalBarsWidth) / 2;
  const labelEvery = Math.max(1, Math.ceil(series.length / 8));
  const hovered = hoverIndex !== null ? series[hoverIndex] : null;
  const total = series.reduce((sum, point) => sum + point.cents, 0);

  return (
    <GlassCard deep className="mt-3 p-4">
      <p className="text-[11px] font-semibold text-mist">
        Last 30 days:{" "}
        <span className="font-bold text-ink">{formatMoney(total)}</span>
      </p>

      <div className="relative mt-3">
        <svg
          viewBox={`0 0 ${width} ${height + 24}`}
          className="w-full"
          role="img"
          aria-label="Settled revenue by day, last 30 days"
        >
          {[0.25, 0.5, 0.75].map((fraction) => (
            <line
              key={fraction}
              x1={0}
              x2={width}
              y1={height - fraction * height}
              y2={height - fraction * height}
              stroke="rgba(232,179,44,0.08)"
              strokeWidth={1}
            />
          ))}

          {series.map((point, index) => {
            const barHeight = Math.max(2, (point.cents / max) * (height - 4));
            const x = startX + index * (barWidth + barGap);
            const y = height - barHeight;
            const isHovered = hoverIndex === index;
            return (
              <g key={point.date.toISOString()}>
                <rect
                  x={x - barGap / 2}
                  y={0}
                  width={barWidth + barGap}
                  height={height}
                  fill="transparent"
                  tabIndex={0}
                  role="button"
                  aria-label={`${point.label}: ${formatMoney(point.cents)}`}
                  onPointerEnter={() => setHoverIndex(index)}
                  onPointerLeave={() =>
                    setHoverIndex((current) =>
                      current === index ? null : current,
                    )
                  }
                  onFocus={() => setHoverIndex(index)}
                  onBlur={() =>
                    setHoverIndex((current) =>
                      current === index ? null : current,
                    )
                  }
                />
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx={4}
                  fill={BAR_COLOR}
                  opacity={isHovered ? 1 : 0.85}
                  className="pointer-events-none transition-opacity duration-150"
                />
                {index % labelEvery === 0 && (
                  <text
                    x={x + barWidth / 2}
                    y={height + 16}
                    textAnchor="middle"
                    className="fill-mist pointer-events-none"
                    fontSize={9}
                    fontWeight={600}
                  >
                    {point.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {hovered && (
          <div
            aria-hidden
            className="gf-glass pointer-events-none absolute top-0 -translate-x-1/2 rounded-xl px-3 py-1.5 text-center whitespace-nowrap shadow-lg"
            style={{
              left: `${((startX + hoverIndex! * (barWidth + barGap) + barWidth / 2) / width) * 100}%`,
            }}
          >
            <span className="block text-[10px] font-semibold text-mist">
              {hovered.label}
            </span>
            <span className="gf-numeric text-xs font-black text-ink">
              {formatMoney(hovered.cents)}
            </span>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
