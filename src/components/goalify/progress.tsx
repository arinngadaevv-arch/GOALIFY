"use client";

import { useMemo } from "react";
import clsx from "clsx";
import { Camera, Flame, Lock, Plus, TrendingDown, Trophy } from "lucide-react";
import { useGoalify, todayKey } from "@/lib/goalify/store";
import { projectWeight, weeksToTarget } from "@/lib/goalify/plan";
import { AppShell } from "./app-shell";
import { GlassCard } from "./ui/glass-card";
import { VisualSlot } from "./ui/visual-slot";
import { Pill, SectionHeading, Stat } from "./ui/stat";

const BADGES = [
  { id: "first", name: "First Rep", emoji: "🥇", requirement: 1 },
  { id: "three", name: "Hat-Trick", emoji: "🔥", requirement: 3 },
  { id: "week", name: "Week One", emoji: "⭐", requirement: 7 },
  { id: "fortnight", name: "Fortnight", emoji: "💎", requirement: 14 },
  { id: "month", name: "Month Strong", emoji: "🏆", requirement: 30 },
  { id: "legend", name: "Legend", emoji: "👑", requirement: 60 },
];

export function Progress() {
  const { state, answers, streak, addPhoto } = useGoalify();
  const completed = state.completedDays.length;
  const projection = useMemo(() => projectWeight(answers), [answers]);
  const weeks = weeksToTarget(answers);
  const losing = answers.targetWeightKg < answers.weightKg;

  const last30 = useMemo(() => buildGrid(state.completedDays), [state.completedDays]);
  const doneInGrid = last30.filter((day) => day.done).length;

  return (
    <AppShell title="Progress & Evolution" subtitle="The proof it's working">
      {/* ------------------------------------------------------ Headline stats */}
      <GlassCard deep className="gf-anim-rise grid grid-cols-3 gap-4 p-6">
        <Stat value={completed} label="Sessions" tone="electric" />
        <Stat value={streak} label="Day streak" tone="lime" />
        <Stat value={`${doneInGrid}/30`} label="Last 30 days" tone="ink" />
      </GlassCard>

      {/* -------------------------------------------------------- Trendline */}
      <section className="mt-8">
        <SectionHeading
          eyebrow="Projection"
          title="Weight trendline"
          action={
            <Pill tone={losing ? "lime" : "electric"}>
              <TrendingDown
                className={clsx("size-3", !losing && "rotate-180")}
                strokeWidth={3}
              />
              {weeks > 0 ? `${weeks} wks` : "At target"}
            </Pill>
          }
        />
        <GlassCard deep className="p-6">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="gf-numeric text-3xl font-black text-ink">
                {answers.weightKg}
                <span className="text-base font-bold text-mist"> kg</span>
              </p>
              <p className="text-[11px] font-bold tracking-[0.12em] text-mist uppercase">
                Today
              </p>
            </div>
            <div className="text-right">
              <p className="gf-numeric text-3xl font-black text-lime-deep">
                {answers.targetWeightKg}
                <span className="text-base font-bold text-mist"> kg</span>
              </p>
              <p className="text-[11px] font-bold tracking-[0.12em] text-mist uppercase">
                Target
              </p>
            </div>
          </div>
          <TrendChart points={projection} />
          <p className="mt-3 text-center text-xs text-haze">
            Projected at a safe 0.75% of bodyweight per week
          </p>
        </GlassCard>
      </section>

      {/* ------------------------------------------------------ Completion grid */}
      <section className="mt-8">
        <SectionHeading eyebrow="Consistency" title="30-day grid" />
        <GlassCard deep className="p-6">
          <div className="grid grid-cols-10 gap-1.5">
            {last30.map((day) => (
              <div
                key={day.key}
                title={`${day.key}${day.done ? " · completed" : ""}`}
                className={clsx(
                  "aspect-square rounded-md transition-all duration-300",
                  day.done
                    ? "bg-lime-neon shadow-[0_0_10px_rgba(57,255,20,0.55)]"
                    : day.isToday
                      ? "border-2 border-electric bg-electric/10"
                      : "bg-ink/6",
                )}
              />
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between text-[11px] font-semibold text-mist">
            <span>30 days ago</span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm bg-lime-neon" />
              Completed
            </span>
            <span>Today</span>
          </div>
        </GlassCard>
      </section>

      {/* -------------------------------------------------------- Photo vault */}
      <section className="mt-8">
        <SectionHeading
          eyebrow="Private to you"
          title="Before / After vault"
          action={
            <button
              type="button"
              onClick={() =>
                addPhoto({ label: `Week ${state.photos.length + 1}`, takenOn: todayKey() })
              }
              className="gf-glass gf-press flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold text-electric"
            >
              <Plus className="size-3.5" strokeWidth={3} />
              Add slot
            </button>
          }
        />
        <div className="grid grid-cols-2 gap-3">
          <PhotoTile label="Before" caption="Day 1" emoji="📷" />
          <PhotoTile
            label="After"
            caption={completed > 0 ? `Day ${completed}` : "Not yet"}
            emoji="✨"
            locked={completed < 7}
          />
        </div>

        {state.photos.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-3">
            {state.photos.map((photo) => (
              <div key={photo.id}>
                <VisualSlot
                  label={photo.label}
                  emoji="🖼️"
                  showChrome={false}
                  rounded="rounded-2xl"
                  className="aspect-3/4 w-full"
                />
                <p className="mt-1.5 text-center text-[11px] font-bold text-mist">
                  {photo.label}
                </p>
              </div>
            ))}
          </div>
        )}

        <GlassCard className="mt-3 flex items-center gap-3 p-4">
          <Camera className="size-4 shrink-0 text-electric" />
          <p className="text-xs leading-relaxed text-mist">
            Photos never leave your device. Same light, same pose, same time of
            day — that&apos;s what makes the comparison honest.
          </p>
        </GlassCard>
      </section>

      {/* ------------------------------------------------------- Trophy shelf */}
      <section className="mt-8">
        <SectionHeading
          eyebrow="Trophy shelf"
          title="Your badges"
          action={
            <Pill tone="lime">
              <Trophy className="size-3" />
              {BADGES.filter((b) => completed >= b.requirement).length}/
              {BADGES.length}
            </Pill>
          }
        />
        <GlassCard deep className="p-6">
          <div className="grid grid-cols-3 gap-4">
            {BADGES.map((badge) => {
              const earned = completed >= badge.requirement;
              return (
                <div key={badge.id} className="text-center">
                  <div
                    className={clsx(
                      "relative mx-auto grid size-20 place-items-center rounded-3xl transition-all duration-500",
                      earned
                        ? "gf-glow-lime bg-linear-to-br from-lime-neon/30 to-electric/20"
                        : "bg-ink/4",
                    )}
                  >
                    {earned && (
                      <span
                        className="absolute inset-0 rounded-3xl border border-lime-neon/40"
                        aria-hidden
                      />
                    )}
                    <span
                      className={clsx(
                        "text-3xl transition-all",
                        earned ? "gf-anim-float" : "opacity-25 grayscale",
                      )}
                      aria-hidden
                    >
                      {badge.emoji}
                    </span>
                    {!earned && (
                      <Lock className="absolute right-2 bottom-2 size-3.5 text-haze" />
                    )}
                  </div>
                  <p
                    className={clsx(
                      "mt-2 text-[11px] font-extrabold",
                      earned ? "text-ink" : "text-haze",
                    )}
                  >
                    {badge.name}
                  </p>
                  <p className="text-[10px] font-semibold text-mist">
                    {badge.requirement} sessions
                  </p>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </section>

      <GlassCard tone="electric" className="mt-8 flex items-center gap-4 p-5">
        <Flame className="size-5 shrink-0 text-electric" strokeWidth={2.6} />
        <p className="text-xs leading-relaxed text-ink-soft">
          {completed === 0
            ? "Finish your first session and this whole page comes alive."
            : `${completed} session${completed === 1 ? "" : "s"} logged. Keep the grid green — that's the only metric that compounds.`}
        </p>
      </GlassCard>
    </AppShell>
  );
}

function PhotoTile({
  label,
  caption,
  emoji,
  locked = false,
}: {
  label: string;
  caption: string;
  emoji: string;
  locked?: boolean;
}) {
  return (
    <div className="relative">
      <VisualSlot
        label={label}
        hint={locked ? "Unlocks at 7 sessions" : "Tap to add a photo"}
        emoji={locked ? "🔒" : emoji}
        className="aspect-3/4 w-full"
      />
      <div className="absolute inset-x-3 bottom-3 flex items-center justify-between">
        <span className="gf-glass rounded-full px-2.5 py-1 text-[10px] font-black tracking-[0.1em] text-ink uppercase">
          {label}
        </span>
        <span className="gf-glass rounded-full px-2.5 py-1 text-[10px] font-bold text-mist">
          {caption}
        </span>
      </div>
    </div>
  );
}

function buildGrid(completedDays: string[]) {
  const done = new Set(completedDays);
  const today = todayKey();
  return Array.from({ length: 30 }).map((_, offset) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - offset));
    const key = todayKey(date);
    return { key, done: done.has(key), isToday: key === today };
  });
}

function TrendChart({ points }: { points: { week: number; weight: number }[] }) {
  const width = 520;
  const height = 160;
  const padding = 12;

  const weights = points.map((p) => p.weight);
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const span = max - min || 1;

  const coords = points.map((point, index) => ({
    x: padding + (index / (points.length - 1)) * (width - padding * 2),
    y: padding + ((max - point.weight) / span) * (height - padding * 2),
  }));

  const line = coords
    .map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`)
    .join(" ");
  const area = `${line} L${coords[coords.length - 1].x.toFixed(1)},${height} L${coords[0].x.toFixed(1)},${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mt-5 w-full"
      role="img"
      aria-label={`Weight trending from ${points[0].weight} to ${points[points.length - 1].weight} kilograms over ${points.length - 1} weeks`}
    >
      <defs>
        <linearGradient id="gf-trend" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#39FF14" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#39FF14" stopOpacity="0" />
        </linearGradient>
      </defs>

      {[0.25, 0.5, 0.75].map((fraction) => (
        <line
          key={fraction}
          x1={padding}
          x2={width - padding}
          y1={padding + fraction * (height - padding * 2)}
          y2={padding + fraction * (height - padding * 2)}
          stroke="rgba(10,25,70,0.07)"
          strokeWidth="1"
        />
      ))}

      <path d={area} fill="url(#gf-trend)" />
      <path
        d={line}
        fill="none"
        stroke="#0052FF"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={coords[0].x}
        cy={coords[0].y}
        r="5"
        fill="#0052FF"
        stroke="#fff"
        strokeWidth="3"
      />
      <circle
        cx={coords[coords.length - 1].x}
        cy={coords[coords.length - 1].y}
        r="6"
        fill="#39FF14"
        stroke="#fff"
        strokeWidth="3"
      />
    </svg>
  );
}
