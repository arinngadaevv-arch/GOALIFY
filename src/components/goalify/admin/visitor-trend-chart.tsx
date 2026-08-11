"use client";

import { useMemo, useState } from "react";
import { GlassCard } from "@/components/goalify/ui/glass-card";

/** Same gold used for the weight trendline on progress.tsx (CHART_GOLD) —
 * this app already has one established "trend chart" color, so this reuses
 * it instead of introducing a second one. Single series, so no legend is
 * needed (the section heading above already says what's plotted). */
const BAR_COLOR = "#e8b32c";

export type TrendBucket = { bucket: string; visitors: number };
export type VisitorTrend = {
  hourly: TrendBucket[];
  daily: TrendBucket[];
  weekly: TrendBucket[];
  monthly: TrendBucket[];
};

type Unit = "hour" | "day" | "week" | "month";

const RANGES: { key: string; label: string; unit: Unit; count: number }[] = [
  { key: "day", label: "Day", unit: "hour", count: 24 },
  { key: "week", label: "Week", unit: "day", count: 7 },
  { key: "month", label: "Month", unit: "day", count: 30 },
  { key: "3months", label: "3 Months", unit: "week", count: 13 },
  { key: "year", label: "Year", unit: "month", count: 12 },
];

/** Mirrors Postgres's `date_trunc` for a `timestamp without time zone`
 * column — the stored value is a naive wall-clock reading with no zone
 * conversion, so truncating has to happen in UTC here too (using the
 * local Date setters would silently shift every bucket by the browser's
 * offset). ISO 8601 week (Monday start), matching Postgres's default. */
function truncTo(date: Date, unit: Unit): Date {
  const d = new Date(date);
  d.setUTCMilliseconds(0);
  d.setUTCSeconds(0);
  d.setUTCMinutes(0);
  if (unit === "hour") return d;
  d.setUTCHours(0);
  if (unit === "day") return d;
  if (unit === "week") {
    const day = d.getUTCDay();
    const sinceMonday = day === 0 ? 6 : day - 1;
    d.setUTCDate(d.getUTCDate() - sinceMonday);
    return d;
  }
  d.setUTCDate(1);
  return d;
}

function stepBack(date: Date, unit: Unit, steps: number): Date {
  const d = new Date(date);
  if (unit === "hour") d.setUTCHours(d.getUTCHours() - steps);
  else if (unit === "day") d.setUTCDate(d.getUTCDate() - steps);
  else if (unit === "week") d.setUTCDate(d.getUTCDate() - steps * 7);
  else d.setUTCMonth(d.getUTCMonth() - steps);
  return d;
}

function formatLabel(date: Date, unit: Unit): string {
  if (unit === "hour") {
    return date.toLocaleTimeString("en-US", { hour: "numeric", hour12: true, timeZone: "UTC" });
  }
  if (unit === "month") {
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

/** Fills the gaps a `GROUP BY` leaves for buckets with zero visitors, and
 * clips/pads to exactly `count` buckets ending at "now" — the query already
 * fetches a wide-enough window (see visitTrendQuery in admin/page.tsx). */
function buildSeries(rows: TrendBucket[], unit: Unit, count: number) {
  const byKey = new Map(rows.map((row) => [row.bucket, row.visitors]));
  const nowBucket = truncTo(new Date(), unit);
  const series = [];
  for (let i = count - 1; i >= 0; i--) {
    const date = stepBack(nowBucket, unit, i);
    series.push({
      date,
      label: formatLabel(date, unit),
      visitors: byKey.get(date.toISOString()) ?? 0,
    });
  }
  return series;
}

export function VisitorTrendChart({ trend }: { trend: VisitorTrend }) {
  const [rangeKey, setRangeKey] = useState("month");
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const range = RANGES.find((r) => r.key === rangeKey) ?? RANGES[2];

  const sourceRows =
    range.unit === "hour"
      ? trend.hourly
      : range.unit === "day"
        ? trend.daily
        : range.unit === "week"
          ? trend.weekly
          : trend.monthly;

  const series = useMemo(
    () => buildSeries(sourceRows, range.unit, range.count),
    [sourceRows, range.unit, range.count],
  );

  const max = Math.max(1, ...series.map((point) => point.visitors));
  const width = 720;
  const height = 180;
  const barGap = 2;
  const barWidth = Math.min(24, width / series.length - barGap);
  const totalBarsWidth = series.length * (barWidth + barGap) - barGap;
  const startX = (width - totalBarsWidth) / 2;

  // Never more than ~8 x-axis labels regardless of bucket count — a label
  // under every one of 30 daily bars is unreadable noise (see
  // marks-and-anatomy.md: "label selectively").
  const labelEvery = Math.max(1, Math.ceil(series.length / 8));

  const hovered = hoverIndex !== null ? series[hoverIndex] : null;

  return (
    <GlassCard deep className="mt-3 p-4">
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Time range">
        {RANGES.map((r) => (
          <button
            key={r.key}
            type="button"
            onClick={() => {
              setRangeKey(r.key);
              setHoverIndex(null);
            }}
            aria-pressed={r.key === rangeKey}
            className={
              r.key === rangeKey
                ? "rounded-full bg-electric px-3 py-1.5 text-[11px] font-bold text-[#1a1100]"
                : "rounded-full border border-ink/10 px-3 py-1.5 text-[11px] font-bold text-mist transition-colors hover:border-electric/30 hover:text-ink"
            }
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="relative mt-4">
        <svg
          viewBox={`0 0 ${width} ${height + 24}`}
          className="w-full"
          role="img"
          aria-label={`Landing page visitors by ${range.unit}, ${range.label.toLowerCase()} view`}
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
            const barHeight = Math.max(2, (point.visitors / max) * (height - 4));
            const x = startX + index * (barWidth + barGap);
            const y = height - barHeight;
            const isHovered = hoverIndex === index;
            return (
              <g key={point.date.toISOString()}>
                {/* Full-height, near-invisible hit target — wider than the
                    bar itself so a short/zero bar is still easy to hover
                    (see interaction.md: hit target bigger than the mark). */}
                <rect
                  x={x - barGap / 2}
                  y={0}
                  width={barWidth + barGap}
                  height={height}
                  fill="transparent"
                  tabIndex={0}
                  role="button"
                  aria-label={`${point.label}: ${point.visitors} visitor${point.visitors === 1 ? "" : "s"}`}
                  onPointerEnter={() => setHoverIndex(index)}
                  onPointerLeave={() => setHoverIndex((current) => (current === index ? null : current))}
                  onFocus={() => setHoverIndex(index)}
                  onBlur={() => setHoverIndex((current) => (current === index ? null : current))}
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
            <span className="block text-[10px] font-semibold text-mist">{hovered.label}</span>
            <span className="gf-numeric text-xs font-black text-ink">
              {hovered.visitors.toLocaleString("en-US")} visitor{hovered.visitors === 1 ? "" : "s"}
            </span>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
