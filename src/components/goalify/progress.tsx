"use client";

import { useMemo, useRef, useState } from "react";
import clsx from "clsx";
import {
  Camera,
  Flame,
  Image as ImageIcon,
  Lock,
  Plus,
  Sparkles,
  TrendingDown,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { useGoalify, todayKey } from "@/lib/goalify/store";
import { projectWeight, weeksToTarget } from "@/lib/goalify/plan";
import { BADGES } from "@/lib/goalify/badges";
import { AppShell } from "./app-shell";
import { GlassCard } from "./ui/glass-card";
import { VisualSlot } from "./ui/visual-slot";
import { IconBadge } from "./ui/icon-badge";
import { Pill, SectionHeading } from "./ui/stat";
import { ParticleBurstLayer } from "./quiz/particle-burst";

/** Literal hex, not the shared electric/lime CSS tokens — this chart's SVG
 * fill/stroke attributes can't read CSS custom properties, so they need
 * their own re-tint for the obsidian/gold cyber scope this screen now
 * always renders in (same reasoning as dashboard.tsx's RING_GOLD/RING_CRIMSON). */
const CHART_GOLD = "#e3c15f";
const CHART_DEEP = "#a9841c";

export function Progress() {
  const { state, answers, streak, addPhoto, setVaultPhoto } = useGoalify();
  const completed = state.completedDays.length;
  const projection = useMemo(() => projectWeight(answers), [answers]);
  const weeks = weeksToTarget(answers);
  const losing = answers.targetWeightKg < answers.weightKg;

  const last30 = useMemo(() => buildGrid(state.completedDays), [state.completedDays]);
  const doneInGrid = last30.filter((day) => day.done).length;
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);
  const selectedDay = last30.find((day) => day.key === selectedDayKey) ?? null;

  return (
    <AppShell dark title="Progress & Evolution" subtitle="The proof it's working">
      <ParticleBurstLayer />

      {/* ---------------------------------------------------------- Hero
          One layered surface: the trendline plus its stat context (today,
          target, sessions, streak) all live in one card now, with an inset
          panel giving the quick stats their own depth instead of a
          separate headline box floating above. */}
      <div className="relative">
        <div
          className="pointer-events-none absolute -inset-4 -z-10 rounded-[2.5rem] bg-electric/16 opacity-70 blur-3xl"
          aria-hidden
        />
        <section className="gf-reveal">
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
                <p className="gf-numeric text-3xl font-black text-electric">
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

            <div className="mt-5 grid grid-cols-3 divide-x divide-ink/8 rounded-3xl bg-black/20 p-4">
              <div className="px-2 text-center first:pl-0 last:pr-0">
                <p className="gf-numeric text-xl font-black text-ink">{completed}</p>
                <p className="mt-0.5 text-[10px] font-bold tracking-[0.08em] text-mist uppercase">
                  Sessions
                </p>
              </div>
              <div className="px-2 text-center first:pl-0 last:pr-0">
                <p className="gf-numeric text-xl font-black text-electric">{streak}</p>
                <p className="mt-0.5 text-[10px] font-bold tracking-[0.08em] text-mist uppercase">
                  Day streak
                </p>
              </div>
              <div className="px-2 text-center first:pl-0 last:pr-0">
                <p className="gf-numeric text-xl font-black text-ink">{doneInGrid}/30</p>
                <p className="mt-0.5 text-[10px] font-bold tracking-[0.08em] text-mist uppercase">
                  Last 30 days
                </p>
              </div>
            </div>

            <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs font-semibold text-electric">
              <Flame className="size-3.5" strokeWidth={2.6} />
              {completed === 0
                ? "Finish your first session and this whole page comes alive."
                : "Keep the grid green — that's the only metric that compounds."}
            </p>
          </GlassCard>
        </section>
      </div>

      {/* See dashboard.tsx's matching comment — CSS-multicol, no reordering. */}
      <div className="lg:columns-2 lg:gap-6">
      {/* ------------------------------------------------------ Completion grid */}
      <section className="gf-reveal mt-8 lg:break-inside-avoid">
        <SectionHeading eyebrow="Consistency" title="30-day grid" />
        <GlassCard deep className="p-6">
          <div className="grid grid-cols-10 gap-1.5">
            {last30.map((day, index) => (
              <button
                key={day.key}
                type="button"
                onClick={() =>
                  setSelectedDayKey((current) => (current === day.key ? null : day.key))
                }
                title={`${day.key}${day.done ? " · completed" : ""}`}
                aria-pressed={selectedDayKey === day.key}
                style={{ animationDelay: `${index * 14}ms` }}
                className={clsx(
                  "gf-anim-pop relative aspect-square rounded-md transition-all duration-300 hover:z-10 hover:scale-125",
                  day.done
                    ? "bg-lime-neon shadow-[0_0_10px_var(--color-lime-neon)]"
                    : day.isToday
                      ? "border-2 border-electric bg-electric/10"
                      : "bg-ink/6",
                  selectedDayKey === day.key && "ring-2 ring-electric ring-offset-1",
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

          {selectedDay && (
            <div className="gf-anim-pop mt-4 flex items-center justify-between rounded-2xl bg-ink/4 px-4 py-3">
              <div>
                <p className="text-xs font-extrabold text-ink">
                  {formatDayLabel(selectedDay.key)}
                </p>
                <p className="mt-0.5 text-[11px] text-mist">
                  {selectedDay.done
                    ? "Workout completed ✓"
                    : selectedDay.isToday
                      ? "Today — not logged yet"
                      : "No session logged"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDayKey(null)}
                className="text-[11px] font-bold text-electric"
              >
                Close
              </button>
            </div>
          )}
        </GlassCard>
      </section>

      {/* -------------------------------------------------------- Photo vault */}
      <section className="gf-reveal mt-8 lg:break-inside-avoid">
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
          <PhotoTile
            label="Before"
            caption="Day 1"
            icon={Camera}
            photoUrl={state.beforePhotoUrl}
            onPhotoSelected={(dataUrl) => setVaultPhoto("before", dataUrl)}
          />
          <PhotoTile
            label="After"
            caption={completed > 0 ? `Day ${completed}` : "Not yet"}
            icon={Sparkles}
            locked={completed < 7}
            photoUrl={state.afterPhotoUrl}
            onPhotoSelected={(dataUrl) => setVaultPhoto("after", dataUrl)}
          />
        </div>

        {state.photos.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-3">
            {state.photos.map((photo) => (
              <div key={photo.id}>
                <VisualSlot
                  label={photo.label}
                  icon={ImageIcon}
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
      <section className="gf-reveal mt-8 lg:break-inside-avoid">
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
                      earned ? "gf-anim-float" : "bg-ink/4",
                    )}
                  >
                    {earned ? (
                      <IconBadge icon={badge.icon} size="lg" active />
                    ) : (
                      <badge.icon className="size-8 text-haze opacity-30" strokeWidth={2.2} />
                    )}
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

      </div>
    </AppShell>
  );
}

function PhotoTile({
  label,
  caption,
  icon,
  locked = false,
  photoUrl,
  onPhotoSelected,
}: {
  label: string;
  caption: string;
  icon: LucideIcon;
  locked?: boolean;
  photoUrl?: string | null;
  onPhotoSelected?: (dataUrl: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !onPhotoSelected) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") onPhotoSelected(reader.result);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={locked}
        className="gf-press block w-full text-left disabled:cursor-not-allowed"
      >
        {photoUrl ? (
          // A user-picked local file read as a data URL — next/image's
          // optimizer/loader is for remote or static assets, not a one-off
          // in-memory blob, so a plain <img> is the correct tool here.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            alt={`${label} progress photo`}
            className="aspect-3/4 w-full rounded-glass object-cover"
          />
        ) : (
          <VisualSlot
            label={label}
            hint={locked ? "Unlocks at 7 sessions" : "Tap to add a photo"}
            icon={locked ? Lock : icon}
            className="aspect-3/4 w-full"
          />
        )}
      </button>
      {/* Invisible — triggered via the button above so the whole tile,
          not just a native file-input button, is the tap target. */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
      <div className="pointer-events-none absolute inset-x-3 bottom-3 flex items-center justify-between">
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

function formatDayLabel(key: string): string {
  return new Date(`${key}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
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
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

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

  function handlePointer(event: React.PointerEvent<SVGSVGElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const relativeX = ((event.clientX - rect.left) / rect.width) * width;
    let nearest = 0;
    let nearestDist = Infinity;
    coords.forEach((coord, index) => {
      const dist = Math.abs(coord.x - relativeX);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = index;
      }
    });
    setHoverIndex(nearest);
  }

  const hovered = hoverIndex !== null ? points[hoverIndex] : null;
  const hoveredCoord = hoverIndex !== null ? coords[hoverIndex] : null;

  return (
    <div className="relative mt-5">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full touch-none cursor-crosshair"
        role="img"
        aria-label={`Weight trending from ${points[0].weight} to ${points[points.length - 1].weight} kilograms over ${points.length - 1} weeks`}
        onPointerMove={handlePointer}
        onPointerDown={handlePointer}
        onPointerLeave={() => setHoverIndex(null)}
      >
        <defs>
          <linearGradient id="gf-trend" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART_DEEP} stopOpacity="0.32" />
            <stop offset="100%" stopColor={CHART_DEEP} stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0.25, 0.5, 0.75].map((fraction) => (
          <line
            key={fraction}
            x1={padding}
            x2={width - padding}
            y1={padding + fraction * (height - padding * 2)}
            y2={padding + fraction * (height - padding * 2)}
            stroke="rgba(232,179,44,0.1)"
            strokeWidth="1"
          />
        ))}

        <path d={area} fill="url(#gf-trend)" />
        <path
          d={line}
          fill="none"
          stroke={CHART_GOLD}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx={coords[0].x}
          cy={coords[0].y}
          r="5"
          fill={CHART_GOLD}
          stroke="#0b0e14"
          strokeWidth="3"
        />
        <circle
          cx={coords[coords.length - 1].x}
          cy={coords[coords.length - 1].y}
          r="6"
          fill={CHART_DEEP}
          stroke="#0b0e14"
          strokeWidth="3"
        />

        {hoveredCoord && (
          <g aria-hidden>
            <line
              x1={hoveredCoord.x}
              x2={hoveredCoord.x}
              y1={padding}
              y2={height - padding}
              stroke="rgba(232,179,44,0.3)"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <circle
              cx={hoveredCoord.x}
              cy={hoveredCoord.y}
              r="6.5"
              fill={CHART_GOLD}
              stroke="#0b0e14"
              strokeWidth="2.5"
            />
          </g>
        )}
      </svg>

      {hovered && hoveredCoord && (
        <div
          aria-hidden
          className="gf-glass gf-anim-pop pointer-events-none absolute -translate-x-1/2 -translate-y-[calc(100%+10px)] rounded-xl px-3 py-1.5 text-center whitespace-nowrap shadow-lg"
          style={{
            left: `${(hoveredCoord.x / width) * 100}%`,
            top: `${(hoveredCoord.y / height) * 100}%`,
          }}
        >
          <span className="block text-[10px] font-semibold text-mist">
            {hovered.week === 0 ? "Today" : `Week ${hovered.week}`}
          </span>
          <span className="gf-numeric text-xs font-black text-ink">
            {hovered.weight} kg
          </span>
        </div>
      )}
    </div>
  );
}
