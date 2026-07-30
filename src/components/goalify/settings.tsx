"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Bell,
  CreditCard,
  Crown,
  Droplets,
  Flame,
  LogOut,
  Music2,
  Ruler,
  ShieldCheck,
  Sparkles,
  UserRound,
  Volume2,
  Zap,
} from "lucide-react";
import { useGoalify } from "@/lib/goalify/store";
import { goalLabel, levelLabel, planName } from "@/lib/goalify/plan";
import { AppShell } from "./app-shell";
import { GlassCard } from "./ui/glass-card";
import { GlowButton, GlowLink } from "./ui/glow-button";
import { Toggle } from "./ui/toggle";
import { VisualSlot } from "./ui/visual-slot";
import { Pill, SectionHeading } from "./ui/stat";

export function SettingsScreen() {
  const router = useRouter();
  const { state, answers, updateSettings, reset } = useGoalify();
  const { settings } = state;

  const handleReset = () => {
    const confirmed = window.confirm(
      "Reset GOALIFY? This clears your plan, streak and progress on this device.",
    );
    if (!confirmed) return;
    reset();
    router.push("/");
  };

  return (
    <AppShell title="Settings" subtitle="Account & preferences">
      {/* ------------------------------------------------------------ Profile */}
      <GlassCard deep className="gf-anim-rise flex items-center gap-4 p-6">
        <VisualSlot
          label="Avatar"
          icon={UserRound}
          rounded="rounded-3xl"
          showChrome={false}
          className="size-20 shrink-0 border-electric/30"
        />
        <div className="min-w-0 flex-1">
          <p className="gf-display truncate text-xl font-extrabold text-ink">
            {state.profile?.name ?? "Athlete"}
          </p>
          <p className="mt-0.5 truncate text-xs font-semibold text-electric">
            {planName(answers)}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Pill tone="neutral">{goalLabel(answers.goal)}</Pill>
            <Pill tone="neutral">{levelLabel(answers.level)}</Pill>
          </div>
        </div>
      </GlassCard>

      {/* ------------------------------------------------------- Body details */}
      <section className="gf-anim-rise gf-delay-2 mt-8">
        <SectionHeading
          eyebrow="Your numbers"
          title="Profile details"
          action={
            <Link
              href="/quiz"
              className="flex items-center gap-1 text-xs font-bold text-electric"
            >
              Retake quiz <ArrowRight className="size-3.5" />
            </Link>
          }
        />
        <GlassCard deep className="grid grid-cols-2 gap-px overflow-hidden bg-ink/6">
          <DetailCell label="Age" value={`${answers.age} yrs`} />
          <DetailCell label="Height" value={`${answers.heightCm} cm`} />
          <DetailCell label="Current weight" value={`${answers.weightKg} kg`} />
          <DetailCell label="Target weight" value={`${answers.targetWeightKg} kg`} />
          <DetailCell label="Training days" value={`${answers.daysPerWeek} / week`} />
          <DetailCell label="Session length" value={`${answers.sessionLength} min`} />
        </GlassCard>
      </section>

      {/* ---------------------------------------------------------- Training */}
      <section className="gf-anim-rise gf-delay-3 mt-8">
        <SectionHeading eyebrow="Safety first" title="Training preferences" />
        <GlassCard
          tone={settings.kneeSafe ? "lime" : "plain"}
          deep
          className="px-5 py-1 transition-colors"
        >
          <Toggle
            checked={settings.kneeSafe}
            onChange={(next) => updateSettings({ kneeSafe: next })}
            label="Knee-Safe Workouts"
            description="Swaps every jump, lunge and deep knee bend for a joint-friendly alternative — same session length."
            icon={<ShieldCheck className="size-4" />}
            tone="lime"
          />
        </GlassCard>

        <GlassCard deep className="mt-3 divide-y divide-ink/6 px-5 py-1">
          <Toggle
            checked={settings.voiceCues}
            onChange={(next) => updateSettings({ voiceCues: next })}
            label="Voice cues"
            description="Your coach calls out form corrections during the session."
            icon={<Volume2 className="size-4" />}
          />
          <Toggle
            checked={settings.soundEffects}
            onChange={(next) => updateSettings({ soundEffects: next })}
            label="Sound effects"
            description="Countdown beeps, exercise chimes and a finish-line celebration."
            icon={<Music2 className="size-4" />}
          />
          <Toggle
            checked={settings.units === "metric"}
            onChange={(next) =>
              updateSettings({ units: next ? "metric" : "imperial" })
            }
            label="Metric units"
            description="Kilograms and centimetres. Turn off for lb and ft/in."
            icon={<Ruler className="size-4" />}
          />
        </GlassCard>
      </section>

      {/* ----------------------------------------------------- Notifications */}
      <section className="gf-anim-rise gf-delay-4 mt-8">
        <SectionHeading
          eyebrow="Three a day, max"
          title="Notifications"
          action={
            <Link
              href="/notifications"
              className="flex items-center gap-1 text-xs font-bold text-electric"
            >
              Preview <ArrowRight className="size-3.5" />
            </Link>
          }
        />
        <GlassCard deep className="divide-y divide-ink/6 px-5 py-1">
          <Toggle
            checked={settings.pushMotivation}
            onChange={(next) => updateSettings({ pushMotivation: next })}
            label="08:00 · Morning motivation"
            icon={<Flame className="size-4" />}
          />
          <Toggle
            checked={settings.pushWater}
            onChange={(next) => updateSettings({ pushWater: next })}
            label="13:00 · Water check"
            icon={<Droplets className="size-4" />}
          />
          <Toggle
            checked={settings.pushWorkout}
            onChange={(next) => updateSettings({ pushWorkout: next })}
            label="18:30 · Workout alert"
            icon={<Zap className="size-4" />}
          />
        </GlassCard>
      </section>

      {/* ------------------------------------------------------- Subscription */}
      <section className="gf-anim-rise gf-delay-5 mt-8">
        <SectionHeading eyebrow="Billing" title="Subscription" />
        <GlassCard tone="electric" deep className="p-6">
          <div className="flex items-center gap-3">
            <span className="gf-glow-electric grid size-11 shrink-0 place-items-center rounded-2xl bg-electric">
              <Crown className="size-5 text-lime-neon" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-extrabold text-ink">
                {state.purchased ? "GOALIFY Premium" : "No active plan"}
              </p>
              <p className="mt-0.5 text-xs text-ink-soft">
                {state.purchased
                  ? "3-month plan · renews automatically"
                  : "Unlock your personalised program"}
              </p>
            </div>
            {state.purchased && (
              <Pill tone="lime">
                <Sparkles className="size-3" />
                Active
              </Pill>
            )}
          </div>

          {state.purchased ? (
            <div className="mt-5 grid gap-2">
              <GlowButton variant="glass" size="sm" fullWidth>
                <CreditCard className="size-4" />
                Manage payment method
              </GlowButton>
              <button
                type="button"
                className="py-1 text-xs font-semibold text-mist underline underline-offset-4"
              >
                Cancel subscription
              </button>
            </div>
          ) : (
            <GlowLink href="/plan" size="md" fullWidth className="mt-5">
              See my plan
              <ArrowRight className="size-4" />
            </GlowLink>
          )}
        </GlassCard>
      </section>

      {/* -------------------------------------------------------------- Reset */}
      <section className="gf-anim-rise gf-delay-6 mt-8">
        <SectionHeading eyebrow="Danger zone" title="Device data" />
        <GlassCard className="p-5">
          <p className="text-xs leading-relaxed text-mist">
            Everything GOALIFY knows about you is stored on this device only.
            Resetting clears your plan, streak and progress permanently.
          </p>
          <button
            type="button"
            onClick={handleReset}
            className="gf-press mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-ink/10 py-3 text-sm font-bold text-ink-soft transition-colors hover:border-ink/25 hover:text-ink"
          >
            <LogOut className="size-4" />
            Reset all data
          </button>
        </GlassCard>
      </section>

      <p className="mt-8 flex items-center justify-center gap-1.5 text-center text-xs text-haze">
        <Bell className="size-3.5" />
        GOALIFY v1.0 · Not medical advice
      </p>
    </AppShell>
  );
}

function DetailCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/70 p-4">
      <p className="text-[10px] font-bold tracking-[0.12em] text-mist uppercase">
        {label}
      </p>
      <p className="gf-numeric mt-1 text-lg font-extrabold text-ink">{value}</p>
    </div>
  );
}
