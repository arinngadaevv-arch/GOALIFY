"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  ArrowRight,
  Bell,
  Check,
  CreditCard,
  Crown,
  Droplets,
  Flame,
  Link2,
  Loader2,
  LogOut,
  Music2,
  Ruler,
  ShieldCheck,
  Sparkles,
  Vibrate,
  Zap,
} from "lucide-react";
import { useGoalify } from "@/lib/goalify/store";
import { goalLabel, levelLabel, planName } from "@/lib/goalify/plan";
import { AppShell } from "./app-shell";
import { GlassCard } from "./ui/glass-card";
import { GlowButton, GlowLink } from "./ui/glow-button";
import { Toggle } from "./ui/toggle";
import { ProfileAvatarPicker } from "./ui/profile-avatar";
import { Pill, SectionHeading } from "./ui/stat";
import { ParticleBurstLayer } from "./quiz/particle-burst";

export function SettingsScreen() {
  const router = useRouter();
  const { state, answers, updateSettings, setAvatar, reset } = useGoalify();
  const { settings } = state;
  const [googleLinked, setGoogleLinked] = useState<boolean | null>(null);
  const [linking, setLinking] = useState(false);

  // Reading `window.location.search` directly — rather than the
  // `useSearchParams()` hook — avoids forcing this otherwise-static page
  // into a Suspense boundary for what's only ever a one-time check (same
  // reasoning as QuizFlow's own `?auth=`/`?error=` handling).
  useEffect(() => {
    const linked = new URLSearchParams(window.location.search).get("linked") === "1";
    if (linked) window.history.replaceState(null, "", "/settings");

    // Checked on every mount, not just after a `?linked=1` return trip —
    // signIn("google") while already authenticated safely links Google to
    // *this* account (see handleLoginOrRegister in @auth/core) without
    // refreshing the session's own JWT claims, so this reads the real
    // accounts table directly rather than trusting anything cached in the
    // session.
    let cancelled = false;
    fetch("/api/user/accounts")
      .then((res) => (res.ok ? res.json() : null))
      .then((body) => {
        if (!cancelled && body) setGoogleLinked(Boolean(body.google));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLinkGoogle = () => {
    setLinking(true);
    void signIn("google", { callbackUrl: "/settings?linked=1" });
  };

  const handleReset = () => {
    const confirmed = window.confirm(
      "Reset GOALIFY? This clears your plan, streak and progress on this device.",
    );
    if (!confirmed) return;
    reset();
    router.push("/");
  };

  return (
    <AppShell dark title="Settings" subtitle="Account & preferences">
      <ParticleBurstLayer />

      {/* ------------------------------------------------------------ Profile */}
      <GlassCard deep className="gf-anim-rise flex items-center gap-4 p-6">
        <ProfileAvatarPicker avatar={state.avatar} onChange={setAvatar} size="lg" />
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
            checked={settings.soundEffects}
            onChange={(next) => updateSettings({ soundEffects: next })}
            label="Sound effects"
            description="Countdown beeps, exercise chimes and a finish-line celebration."
            icon={<Music2 className="size-4" />}
          />
          <Toggle
            checked={settings.haptics}
            onChange={(next) => updateSettings({ haptics: next })}
            label="Haptic feedback"
            description="A subtle buzz when you hit a milestone — daily step goal or a finished workout."
            icon={<Vibrate className="size-4" />}
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

      {/* ------------------------------------------------------ Connected accounts */}
      <section className="gf-anim-rise gf-delay-6 mt-8">
        <SectionHeading eyebrow="Sign-in" title="Connected accounts" />
        <GlassCard deep className="flex items-center gap-4 p-5">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-ink/5">
            <GoogleIcon className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-extrabold text-ink">Google</p>
            <p className="mt-0.5 text-xs text-ink-soft">
              {googleLinked
                ? "Signed in with Google is enabled for this account."
                : "Link Google to sign in without a password next time."}
            </p>
          </div>
          {googleLinked ? (
            <Pill tone="lime">
              <Check className="size-3" />
              Connected
            </Pill>
          ) : (
            <button
              type="button"
              onClick={handleLinkGoogle}
              disabled={linking || googleLinked === null}
              className="gf-press flex shrink-0 items-center gap-1.5 rounded-full border border-ink/10 px-3.5 py-2 text-xs font-bold text-ink-soft transition-colors hover:border-electric/40 hover:text-electric disabled:opacity-50"
            >
              {linking ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Link2 className="size-3.5" />
              )}
              Link
            </button>
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
    <div className="bg-ink/3 p-4">
      <p className="text-[10px] font-bold tracking-[0.12em] text-mist uppercase">
        {label}
      </p>
      <p className="gf-numeric mt-1 text-lg font-extrabold text-ink">{value}</p>
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.87c2.27-2.09 3.58-5.17 3.58-8.82Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.87-3c-1.07.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.11A11.99 11.99 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28V6.61H1.27A11.99 11.99 0 0 0 0 12c0 1.94.46 3.77 1.27 5.39l4-3.11Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.27 6.61l4 3.11C6.22 6.86 8.87 4.75 12 4.75Z"
      />
    </svg>
  );
}
