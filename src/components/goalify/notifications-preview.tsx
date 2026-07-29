"use client";

import clsx from "clsx";
import { BatteryFull, Bell, Droplets, Flame, Signal, Wifi, Zap } from "lucide-react";
import { useGoalify } from "@/lib/goalify/store";
import { AppShell } from "./app-shell";
import { GlassCard } from "./ui/glass-card";
import { Toggle } from "./ui/toggle";
import { Pill, SectionHeading } from "./ui/stat";

type Slot = {
  key: "pushMotivation" | "pushWater" | "pushWorkout";
  time: string;
  label: string;
  title: string;
  body: string;
  Icon: React.ComponentType<{ className?: string }>;
  description: string;
};

const SLOTS: Slot[] = [
  {
    key: "pushMotivation",
    time: "08:00",
    label: "Morning motivation",
    title: "Today is a training day 🔥",
    body: "Full Body Ignition is loaded and waiting. 24 minutes. That's it.",
    Icon: Flame,
    description: "A push to set the tone before the day gets loud.",
  },
  {
    key: "pushWater",
    time: "13:00",
    label: "Water check",
    title: "Halfway on water? 💧",
    body: "You're 3 of 9 glasses in. Grab one now and you're back on pace.",
    Icon: Droplets,
    description: "A midday nudge so hydration never gets away from you.",
  },
  {
    key: "pushWorkout",
    time: "18:30",
    label: "Workout alert",
    title: "Your session starts now ⚡",
    body: "You vs. you. Press start — your coach is already warmed up.",
    Icon: Zap,
    description: "The one that turns intention into a finished workout.",
  },
];

export function NotificationsPreview() {
  const { state, updateSettings } = useGoalify();
  const active = SLOTS.filter((slot) => state.settings[slot.key]);

  return (
    <AppShell title="Daily Reminders" subtitle="Lock-screen preview">
      <GlassCard tone="electric" className="gf-anim-rise flex items-center gap-3 p-4">
        <Bell className="size-4 shrink-0 text-electric" />
        <p className="text-xs leading-relaxed text-ink-soft">
          This is exactly how GOALIFY appears on your phone. Toggle any of the
          three off and it disappears from the preview.
        </p>
      </GlassCard>

      {/* --------------------------------------------------- Phone lock screen */}
      <div className="gf-anim-materialize mt-7 flex justify-center">
        <div
          className={clsx(
            "relative w-full max-w-[19rem] overflow-hidden rounded-[2.75rem] p-3",
            "border-[6px] border-ink/85 bg-ink",
            "shadow-[0_40px_80px_-30px_rgba(8,22,66,0.6),inset_0_0_0_1px_rgba(255,255,255,0.12)]",
          )}
        >
          {/* Wallpaper */}
          <div className="relative overflow-hidden rounded-[2rem] bg-linear-to-br from-[#0a1030] via-[#06246b] to-[#0052ff]">
            <div
              className="absolute -top-10 -right-8 size-44 rounded-full bg-lime-neon/25 blur-3xl"
              aria-hidden
            />
            <div
              className="absolute -bottom-12 -left-10 size-48 rounded-full bg-electric/50 blur-3xl"
              aria-hidden
            />

            {/* Status bar */}
            <div className="relative flex items-center justify-between px-5 pt-3 text-[10px] font-bold text-white/90">
              <span>GOALIFY</span>
              <div className="flex items-center gap-1">
                <Signal className="size-3" />
                <Wifi className="size-3" />
                <BatteryFull className="size-3.5" />
              </div>
            </div>

            {/* Clock */}
            <div className="relative px-5 pt-5 pb-6 text-center text-white">
              <p className="gf-numeric text-6xl leading-none font-black tracking-tight">
                18:30
              </p>
              <p className="mt-1.5 text-xs font-semibold text-white/70">
                Monday, 3 March
              </p>
            </div>

            {/* Notification stack */}
            <div className="relative space-y-2 px-3 pb-6">
              {active.length === 0 && (
                <p className="rounded-2xl bg-white/10 px-4 py-6 text-center text-xs font-semibold text-white/60">
                  No reminders enabled
                </p>
              )}
              {active.map((slot, index) => (
                <div
                  key={slot.key}
                  className={clsx(
                    "gf-anim-rise rounded-2xl border border-white/25 bg-white/18 p-3 backdrop-blur-xl",
                    `gf-delay-${index + 1}`,
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="grid size-5 place-items-center rounded-md bg-electric">
                      <Zap className="size-3 text-lime-neon" />
                    </span>
                    <span className="text-[10px] font-bold tracking-wide text-white/85 uppercase">
                      Goalify
                    </span>
                    <span className="ml-auto text-[10px] font-semibold text-white/60">
                      {slot.time}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[13px] leading-tight font-extrabold text-white">
                    {slot.title}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-snug text-white/80">
                    {slot.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------ Toggles */}
      <section className="mt-8">
        <SectionHeading
          eyebrow="Three a day, no more"
          title="Reminder schedule"
          action={<Pill tone="lime">{active.length} on</Pill>}
        />
        <GlassCard deep className="divide-y divide-ink/6 px-5 py-1">
          {SLOTS.map((slot) => (
            <Toggle
              key={slot.key}
              checked={state.settings[slot.key]}
              onChange={(next) => updateSettings({ [slot.key]: next })}
              label={`${slot.time} · ${slot.label}`}
              description={slot.description}
              icon={<slot.Icon className="size-4" />}
            />
          ))}
        </GlassCard>
        <p className="mt-4 px-1 text-xs leading-relaxed text-haze">
          GOALIFY never sends more than three notifications a day. No streak
          guilt-trips, no random re-engagement spam.
        </p>
      </section>
    </AppShell>
  );
}
