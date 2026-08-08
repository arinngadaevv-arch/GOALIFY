"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { ArrowRight, Check, ChevronLeft, TrendingUp } from "lucide-react";
import {
  QUIZ_STEPS,
  type ChoiceOption,
  type QuizStep,
} from "@/lib/goalify/quiz";
import { DEFAULT_ANSWERS } from "@/lib/goalify/plan";
import type { QuizAnswers } from "@/lib/goalify/types";
import { useGoalify } from "@/lib/goalify/store";
import { GlowButton } from "@/components/goalify/ui/glow-button";
import { useUiSounds } from "@/components/goalify/use-ui-sounds";
import { hasRealPhoto, OptionPhoto } from "./option-photo";
import { QuizIconBadge, type QuizIconKey } from "./quiz-icons";
import { AnalyzingScreen } from "./analyzing-screen";
import { BodyMapStep } from "./body-map";
import { HUD_STEP_META, HypeToast } from "./hype-toast";
import { CommitStep } from "./commit-step";
import { SocialProofScreen } from "./social-proof-screen";
import { VitalsStep } from "./vitals-step";
import { WelcomeCtaStep } from "./welcome-cta-step";
import { AuthPanel } from "./auth-panel";
import { fireBurst, ParticleBurstLayer } from "./particle-burst";
import { ConfettiBurstLayer } from "./confetti-burst";
import { ShockwaveLayer } from "./commit-transition";

/** Wraps a click handler so every tap also fires a micro-particle burst
 * from the exact point of contact. */
function withBurst(handler: () => void, gold = false) {
  return (event: React.MouseEvent) => {
    fireBurst(event.clientX, event.clientY, gold);
    handler();
  };
}

/** Fixed patches for the two rhetorical "yes-set" commitment cards. */
const COMMIT_PATCHES: Partial<Record<keyof QuizAnswers, Partial<QuizAnswers>>> = {
  joints: { joints: ["none"] },
  commitment: { commitment: "allin" },
};
const COMMIT_VALUES: Partial<Record<keyof QuizAnswers, unknown>> = {
  joints: "ready",
  commitment: "allin",
};

/** How long the selection's feedback (ring, tint, coach reaction) stays on
 * screen before auto-advancing — kept right at the edge of "instant" so a
 * tap reads as select-and-go, not a pause before a second action. */
const REACTION_MS = 400;

/** Slide direction for the step transition — positive for advancing,
 * negative for stepping back, so Back genuinely reverses the motion
 * instead of replaying the same forward animation. */
const stepVariants = {
  enter: (direction: number) => ({ opacity: 0, x: direction >= 0 ? 32 : -32 }),
  center: { opacity: 1, x: 0 },
  exit: (direction: number) => ({ opacity: 0, x: direction >= 0 ? -32 : 32 }),
};

/** The commitment step's own transition — a smooth zoom + fade instead of
 * the usual left/right slide, so the "yes" moment carries straight through
 * into the next question instead of getting undercut by a sideways slide.
 * Used both for the commit step itself (its exit, when the user commits,
 * matters more than its entrance) and for the step immediately after it
 * (its entrance zooms in to match). */
const zoomVariants = {
  enter: { opacity: 0, scale: 0.92 },
  center: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 1.06 },
};
const ZOOM_TRANSITION = { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const };
const SLIDE_TRANSITION = { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const };

export function QuizFlow() {
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();
  const { state, setDraft, resetDraft, completeQuiz } = useGoalify();
  const [quizStarted, setQuizStarted] = useState(false);
  const [showResultsGate, setShowResultsGate] = useState(false);
  /** Set once, on mount, from the `?auth=`/`?error=` NextAuth lands Google
   * round trips back on `/quiz` with (see pages.error in auth.ts). Reading
   * `window.location.search` directly in an effect — rather than the
   * `useSearchParams()` hook — avoids forcing this otherwise-static page
   * into a Suspense boundary for what's only ever a one-time check. */
  const [authReturn, setAuthReturn] = useState<{
    auth: string | null;
    error: string | null;
  } | null>(null);
  const [[index, direction], setIndexState] = useState<[number, number]>([0, 0]);
  /** Set by the credentials "Log in" flow's `onAuthenticated` — deferring
   * the actual redirect to the effect below (which reacts to `session`
   * once it's actually settled) instead of reading `session` synchronously
   * right after `AuthPanel`'s own `await update()` resolves. React's
   * context propagation isn't guaranteed to have reached this sibling
   * component by then, so a synchronous read here could still see the
   * pre-login session and route on stale (or absent) plan/terms data. */
  const [awaitingSigninRoute, setAwaitingSigninRoute] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [showSocialProof, setShowSocialProof] = useState(false);
  const [pending, setPending] = useState<Partial<QuizAnswers> | null>(null);
  /** The celebration pill that pops the instant an answer lands. */
  const [hudToast, setHudToast] = useState<string | null>(null);
  const { glassChime, hypeSelect, sliderTick } = useUiSounds();

  const goBack = useCallback(() => {
    if (index === 0) return;
    glassChime();
    // Cancel any in-flight forward auto-advance — otherwise it fires
    // ~1s later on its own stale timer and yanks the user right back
    // forward the instant they'd just stepped back.
    setPending(null);
    setHudToast(null);
    setIndexState(([i]) => [i - 1, -1]);
  }, [index, glassChime]);

  const step = QUIZ_STEPS[index];
  const isLast = index === QUIZ_STEPS.length - 1;
  const progress = (index / QUIZ_STEPS.length) * 100;

  // The commit step's own transition zooms rather than slides — covers
  // both its entrance and, more importantly, its exit when the user taps
  // "yes" — and the step right after it enters with a matching zoom-in so
  // the whole handoff reads as one continuous motion.
  const prevStep = index > 0 ? QUIZ_STEPS[index - 1] : null;
  const useZoomTransition =
    step.kind === "commit" || (direction >= 0 && prevStep?.kind === "commit");

  // Every question starts at the top, even if the previous one was long
  // enough to scroll — otherwise stepping forward from partway down a
  // scrolled page lands mid-way through the new question instead of on
  // its headline. Instant, not smooth — a smooth scroll racing the step's
  // own slide/zoom transition left a window where the new step sat
  // mid-scroll (bottom of viewport, content cut off) at the same time it
  // was still animating in, which reads as a layout bug rather than a
  // scroll in progress.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [index]);

  const draft = state.draft;
  const currentValue = draft[step.id];

  const finish = useCallback(
    (patch: Partial<QuizAnswers>) => {
      const answers = { ...DEFAULT_ANSWERS, ...draft, ...patch } as QuizAnswers;
      completeQuiz(answers);
      setAnalyzing(true);
    },
    [draft, completeQuiz],
  );

  /**
   * Writes the answer immediately (so the option shows as selected) and
   * queues the advance so the selection's own feedback has a beat to land.
   */
  const pick = useCallback(
    (patch: Partial<QuizAnswers>) => {
      setDraft(patch);
      setPending(patch);
      hypeSelect();

      const meta = HUD_STEP_META[step.id];
      if (meta) setHudToast(meta.hype);
    },
    [setDraft, step.id, hypeSelect],
  );

  // The advance itself happens in a timer callback, never synchronously in the
  // effect body, so this stays clear of cascading-render lint rules.
  useEffect(() => {
    if (!pending) return;
    const timer = setTimeout(() => {
      if (isLast) {
        finish(pending);
      } else {
        setIndexState(([i]) => [i + 1, 1]);
        setHudToast(null);
      }
      setPending(null);
    }, REACTION_MS);
    return () => clearTimeout(timer);
  }, [pending, isLast, finish]);

  // Reads the return trip from a Google attempt exactly once, then scrubs
  // the URL — nothing downstream should ever see `?auth=`/`?error=` again
  // (a manual refresh, a shared link, back/forward navigation). The
  // setState is deferred to a timer, never called synchronously in the
  // effect body, for the same cascading-render reason as the timer effect
  // above.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const auth = params.get("auth");
    const error = params.get("error");
    if (!auth && !error) return;
    window.history.replaceState(null, "", "/quiz");
    const timer = setTimeout(() => setAuthReturn({ auth, error }), 0);
    return () => clearTimeout(timer);
  }, []);

  // Only fires once the session has actually settled to "authenticated" —
  // `authReturn` can be set well before the post-redirect session fetch
  // resolves, so this can't just run inline in the effect above.
  //
  // Google's callback URL is the same ("start") whether the welcome screen's
  // primary CTA or the quiet "Log in" link kicked things off — unlike the
  // credentials form, there's no way to know in advance whether a given
  // Google account is brand new or already a member (Google decides that
  // invisibly, based on email match, during its own round trip). Deciding
  // here instead, from the real session that comes back, means a returning
  // member who instinctively taps the big CTA still lands on their
  // dashboard rather than getting funneled back through onboarding. The
  // routing signal has to be `hasActivePlan` (has actually paid — the only
  // thing the Lemon Squeezy webhook ever sets), not `hasAcceptedTerms`: the
  // liability waiver is forced on every authenticated page load including
  // the paywall itself, so a brand-new signup who hasn't paid a cent yet
  // already has `hasAcceptedTerms: true` by the time they reach here.
  useEffect(() => {
    if (authStatus !== "authenticated" || !authReturn?.auth) return;
    const timer = setTimeout(() => {
      if (authReturn.auth === "results") {
        router.push("/plan");
      } else if (authReturn.auth === "start") {
        if (session?.user?.hasActivePlan) {
          router.push("/home");
        } else if (state.profile) {
          // Already has a completed plan locally, just never paid for it —
          // straight to the paywall, not back through the whole quiz.
          router.push("/plan");
        } else {
          setQuizStarted(true);
        }
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [authStatus, authReturn, session, state.profile, router]);

  // The credentials "Log in" form's counterpart to the Google effect above —
  // same reasoning, same fix: wait for `session` to actually reflect the
  // fresh sign-in (reactively, via this effect) rather than reading it
  // synchronously in the click handler right after `AuthPanel`'s own
  // `await update()` resolves.
  useEffect(() => {
    if (!awaitingSigninRoute || authStatus !== "authenticated") return;
    const timer = setTimeout(() => {
      router.push(session?.user?.hasActivePlan ? "/home" : "/plan");
      setAwaitingSigninRoute(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [awaitingSigninRoute, authStatus, session, router]);

  if (analyzing) {
    return (
      <AnalyzingScreen
        onDone={() => {
          // `analyzing` has to drop too — otherwise this branch keeps
          // winning over the `showSocialProof` check below, so the mounted
          // AnalyzingScreen never unmounts and its "done" effect (still
          // seeing a fresh `onDone` closure on every parent re-render)
          // keeps re-firing forever instead of handing off once.
          setAnalyzing(false);
          setShowSocialProof(true);
        }}
      />
    );
  }

  if (showSocialProof) {
    return (
      <SocialProofScreen
        onContinue={() => {
          // The quiz itself never required an account — this is the one
          // mandatory gate in the whole funnel, and it only shows up once
          // there's an actual plan worth saving. A signed-in returning
          // member (retaking the quiz) skips straight through.
          if (authStatus === "authenticated") {
            router.push("/plan");
          } else {
            setShowSocialProof(false);
            setShowResultsGate(true);
          }
        }}
      />
    );
  }

  if (showResultsGate) {
    return (
      <main className="gf-cyber-scope relative mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-5">
        <AuthPanel
          initialMode="signup"
          heading="Save Your Plan"
          subheading="Create a free account to unlock your personalised 6-month plan."
          onAuthenticated={() => router.push("/plan")}
          onBack={() => {
            setShowResultsGate(false);
            setShowSocialProof(true);
          }}
        />
      </main>
    );
  }

  if (!quizStarted) {
    return (
      <main className="gf-cyber-scope relative mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-5">
        <WelcomeCtaStep
          onStart={() => {
            // Every fresh attempt starts blank — otherwise a step like the
            // body-map can reopen with whatever was last selected on an
            // earlier, abandoned attempt still checked (see resetDraft).
            resetDraft();
            setQuizStarted(true);
          }}
          onLogin={() => setAwaitingSigninRoute(true)}
          initialErrorCode={authReturn?.error ?? null}
        />
      </main>
    );
  }

  return (
    <main className="gf-cyber-scope relative mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-5 pb-8">
      <ParticleBurstLayer />
      <ConfettiBurstLayer />
      <ShockwaveLayer />
      <header className="relative flex items-center gap-4 py-2">
        {/* Inline styles carry every property that makes this visible at
            all (size, colors, border) — deliberately not left to Tailwind
            utility classes alone, so no build-time purge/JIT gap or CSS
            specificity fight can ever cause this to silently fail to
            render. A real flex child now, not absolutely positioned: the
            previous fixed left/top offsets didn't reliably clear the
            header's actual content height, so the button could overlap
            the progress bar and the HUD line right below it.
            `visibility: hidden` (not `display: none`) on step one keeps
            its footprint reserved either way, so the progress bar doesn't
            shift horizontally the moment the button appears on step two. */}
        <button
          type="button"
          aria-label="Back"
          onClick={goBack}
          disabled={index === 0}
          tabIndex={index === 0 ? -1 : 0}
          style={{
            visibility: index === 0 ? "hidden" : "visible",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 44,
            height: 44,
            borderRadius: 9999,
            background: "#161B26",
            color: "#FFC700",
            border: "2px solid #FFC700",
            flexShrink: 0,
          }}
          className="gf-press"
        >
          <ChevronLeft size={22} strokeWidth={2.75} />
        </button>

        {/* Thin, minimalist single-line progress bar — native-app style. */}
        <div
          className="h-1 flex-1 overflow-hidden rounded-full bg-ink/10"
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Quiz progress"
        >
          <div
            className="gf-progress-fill h-full rounded-full bg-electric transition-[width] duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <span className="gf-numeric shrink-0 text-xs font-bold text-haze">
          {index + 1}/{QUIZ_STEPS.length}
        </span>
      </header>

      {/* --------------------------------------------- Live diagnostic readout */}
      <div className="relative flex items-center justify-between gap-2">
        <p className="gf-cyber-glow-text min-w-0 truncate text-[10px] font-black tracking-[0.16em] uppercase">
          {step.hudPhrase} · {Math.round(((index + 1) / QUIZ_STEPS.length) * 100)}%
        </p>
        {hudToast && <HypeToast text={hudToast} />}
      </div>

      {/* Headline + content animate together as one unit, sliding in from
          the right when advancing and from the left when stepping back —
          `custom={direction}` is how the variants below know which.
          `mode="popLayout"` matters as much as the variants themselves:
          without it, the exiting step and the entering step both sit in
          normal document flow for the ~300-500ms crossfade, so the new
          step's headline and content get pushed down by the old step's
          still-fading-out block above it — every zone/label on the body
          map (or any step) reads as shifted/misaligned for that whole
          window. popLayout takes the exiting element out of flow the
          instant the new one mounts, so there's never a stacked frame. */}
      <AnimatePresence custom={direction} initial={false} mode="popLayout">
        <motion.div
          key={step.id}
          custom={direction}
          variants={useZoomTransition ? zoomVariants : stepVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={useZoomTransition ? ZOOM_TRANSITION : SLIDE_TRANSITION}
          className="relative flex flex-1 flex-col"
        >
          {/* --------------------------------------------------- Big headline */}
          <div className="relative pt-1">
            <p className="text-[11px] font-black tracking-[0.16em] text-electric uppercase">
              {step.chapter}
            </p>
            <h1 className="gf-display relative mt-1 text-2xl leading-[1.08] font-black text-ink sm:text-5xl">
              {step.title}
            </h1>
          </div>

          <div className="relative flex-1 pt-2">
            <div>
              {step.kind === "choice" ? (
                <ChoiceStep
                  step={step}
                  value={currentValue}
                  onPick={pick}
                  onSetDraft={setDraft}
                  locked={pending !== null}
                  onTap={glassChime}
                />
              ) : step.kind === "bodyMap" ? (
                <BodyMapStep
                  step={step}
                  value={currentValue}
                  onSetDraft={setDraft}
                  onPick={pick}
                  locked={pending !== null}
                  onTap={glassChime}
                />
              ) : step.kind === "vitals" ? (
                <VitalsStep
                  key={step.id}
                  draft={draft}
                  locked={pending !== null}
                  onSubmit={pick}
                  onTick={sliderTick}
                />
              ) : (
                <CommitStep
                  key={step.id}
                  buttonLabel={step.buttonLabel}
                  bgPhoto={step.bgPhoto}
                  patch={COMMIT_PATCHES[step.id] ?? {}}
                  value={COMMIT_VALUES[step.id]}
                  locked={pending !== null}
                  onPick={pick}
                />
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </main>
  );
}

/* ------------------------------------------------------------------ choice */

function ChoiceStep({
  step,
  value,
  onPick,
  onSetDraft,
  locked,
  onTap,
}: {
  step: Extract<QuizStep, { kind: "choice" }>;
  value: unknown;
  onPick: (patch: Partial<QuizAnswers>, value: unknown) => void;
  onSetDraft: (patch: Partial<QuizAnswers>) => void;
  locked: boolean;
  onTap: () => void;
}) {
  const selected = useMemo(
    () => (Array.isArray(value) ? (value as string[]) : []),
    [value],
  );

  if (step.multi) {
    const toggle = (option: string) => {
      // "Nothing hurts" is exclusive — it can't coexist with a joint flag.
      let next: string[];
      if (option === "none") {
        next = selected.includes("none") ? [] : ["none"];
      } else {
        const withoutNone = selected.filter((v) => v !== "none");
        next = withoutNone.includes(option)
          ? withoutNone.filter((v) => v !== option)
          : [...withoutNone, option];
      }
      onSetDraft({ [step.id]: next } as Partial<QuizAnswers>);
    };

    return (
      <>
        <div className="grid grid-cols-2 gap-4">
          {step.options.map((option) => (
            <OptionCard
              key={option.value}
              icon={option.icon}
              label={option.label}
              description={option.description}
              socialProof={option.socialProof}
              selected={selected.includes(option.value)}
              disabled={locked}
              onClick={() => {
                onTap();
                toggle(option.value);
              }}
            />
          ))}
        </div>
        <GlowButton
          variant="cyber"
          size="lg"
          fullWidth
          className="mt-6"
          disabled={selected.length === 0 || locked}
          onClick={withBurst(() => {
            onPick({ [step.id]: selected } as Partial<QuizAnswers>, selected);
          }, true)}
        >
          Continue
          <ArrowRight className="size-5" />
        </GlowButton>
      </>
    );
  }

  const layout = step.layout ?? "list";
  const main = step.options.filter((o) => !o.aside);
  const asides = step.options.filter((o) => o.aside);
  // A photo only ever renders if EVERY option in the step has one — one
  // real photo next to three icon placeholders reads as broken, not
  // premium, so an incomplete set falls back to a clean icon treatment
  // across the whole step instead.
  const stepHasPhotos = main.every((o) => hasRealPhoto(o.image));

  const choose = (option: (typeof step.options)[number]) => {
    onPick({ [step.id]: option.value } as Partial<QuizAnswers>, option.value);
  };

  return (
    <div>
      <div
        className={clsx(
          "grid",
          layout === "wide" ? "gap-2" : "grid-cols-2 gap-3",
          layout === "portrait" && "mt-14",
        )}
      >
        {main.map((option) => (
          <PhotoOptionCard
            key={option.value}
            option={option}
            layout={layout}
            hasPhoto={stepHasPhotos}
            stepId={step.id}
            selected={String(value) === option.value}
            disabled={locked}
            onClick={() => choose(option)}
          />
        ))}
      </div>

      {asides.length > 0 && (
        <div className="mt-4 flex justify-center">
          {asides.map((option) => (
            <button
              key={option.value}
              type="button"
              disabled={locked}
              aria-pressed={String(value) === option.value}
              onClick={withBurst(() => choose(option))}
              className={clsx(
                "gf-card gf-press rounded-full px-7 py-3.5 text-sm font-semibold transition-all",
                String(value) === option.value
                  ? "gf-card-active text-electric"
                  : "text-ink-soft hover:text-ink",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * One answer card. The three photo layouts mirror the onboarding reference:
 * a portrait pair with the cut-out breaking above the card, full-width rows
 * with the photo bleeding off the right edge, and a plain image-above-label
 * tile. `list` keeps the compact icon row for the quick utility questions.
 */
/** Rising-intensity gradient wash per level, gold at the low end to a
 * hotter gold/crimson blaze at the top — the benchmark step's cards get
 * their own energy without needing a mismatched stock photo per rank. */
const LEVEL_CARD_BG: Record<string, string> = {
  beginner: "bg-gradient-to-br from-electric/14 via-transparent to-transparent",
  returning: "bg-gradient-to-br from-electric/24 via-electric/6 to-transparent",
  consistent: "bg-gradient-to-br from-lime-neon/22 via-electric/12 to-transparent",
  advanced: "bg-gradient-to-br from-lime-neon/38 via-electric/18 to-transparent",
};

function PhotoOptionCard({
  option,
  layout,
  hasPhoto,
  stepId,
  selected,
  disabled,
  onClick,
}: {
  option: ChoiceOption;
  layout: "portrait" | "wide" | "tile" | "list";
  /** Precomputed by the caller — true only when every option in the step
   * has a real photo, so a card never shows a photo in isolation. */
  hasPhoto: boolean;
  stepId: string;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  const checkBadge = selected && (
    <span className="absolute top-3 right-3 z-20 grid size-7 place-items-center rounded-full bg-electric text-white shadow-lg ring-2 ring-white/80">
      <Check className="size-4" strokeWidth={3.5} />
    </span>
  );

  // The benchmark ("level") step gets its own high-energy treatment —
  // a rising-intensity gradient wash, animated sweep border, hover glow,
  // and a badge-styled callout instead of the plain icon-card fallback.
  if (stepId === "level" && !hasPhoto) {
    return (
      <button
        type="button"
        onClick={withBurst(onClick)}
        disabled={disabled}
        aria-pressed={selected}
        className={clsx(
          "gf-card gf-cyber-border gf-press relative flex flex-col items-center gap-2.5 rounded-3xl p-5 text-center transition-all duration-300 ease-out",
          "hover:scale-[1.04] hover:shadow-[0_0_28px_-6px_rgba(232,179,44,0.75)]",
          LEVEL_CARD_BG[option.value],
          selected ? "gf-card-active scale-[1.03]" : "",
        )}
      >
        {checkBadge}
        <QuizIconBadge icon={option.icon} size="lg" active={selected} />
        <span className="gf-display relative text-base leading-tight font-extrabold text-ink">
          {option.label}
        </span>
        {option.description && (
          <span className="relative text-xs leading-snug text-ink-soft">
            {option.description}
          </span>
        )}
        {option.socialProof && (
          <span className="gf-glow-electric relative mt-1 rounded-full bg-electric/12 px-2.5 py-1 text-[10px] font-black tracking-[0.06em] text-electric uppercase">
            {option.socialProof}
          </span>
        )}
      </button>
    );
  }

  if (layout === "list") {
    return (
      <OptionCard
        icon={option.icon}
        label={option.label}
        description={option.description}
        socialProof={option.socialProof}
        selected={selected}
        disabled={disabled}
        onClick={onClick}
      />
    );
  }

  const base = clsx(
    "gf-card gf-card-hover gf-press relative text-left transition-all duration-300 ease-out",
    selected && "gf-card-active scale-[1.03]",
    disabled && !selected && "opacity-50",
  );

  if (layout === "wide") {
    if (hasPhoto) {
      // A compact row, not a full-bleed hero card — with 4-5 options per
      // step, a card tall enough to show off a background photo pushed the
      // lower options off the bottom of a real phone screen entirely. The
      // photo shrinks to a fixed thumbnail so every row stays short enough
      // that at least 3-4 options are on screen at once, no scrolling.
      // No subtitle copy either — title + stat badge only, so the whole
      // row scans and taps in one glance instead of reading like a list.
      return (
        <button
          type="button"
          onClick={withBurst(onClick)}
          disabled={disabled}
          aria-pressed={selected}
          style={{ borderColor: selected ? undefined : "rgba(232,179,44,0.42)", borderWidth: 1.5 }}
          className={clsx(base, "group flex items-center gap-2.5 overflow-hidden p-2 pr-3")}
        >
          <OptionPhoto
            src={option.image}
            alt={option.label}
            label={option.label}
            icon={option.icon}
            className="size-12 shrink-0 rounded-xl"
            imageClassName="transition-transform duration-300 ease-out group-active:scale-110"
          />
          <span className="min-w-0 flex-1">
            <span className="gf-display block truncate text-lg leading-tight font-extrabold text-ink">
              {option.label}
            </span>
            {option.socialProof && <SocialProofLine text={option.socialProof} badge compactBadge solid />}
          </span>
          {checkBadge}
        </button>
      );
    }
    return (
      <button
        type="button"
        onClick={withBurst(onClick)}
        disabled={disabled}
        aria-pressed={selected}
        className={clsx(base, "flex items-center gap-4 p-5")}
      >
        {checkBadge}
        <QuizIconBadge icon={option.icon} size="lg" active={selected} />
        <span className="min-w-0 flex-1">
          <span className="gf-display block text-xl font-extrabold text-ink">
            {option.label}
          </span>
          {option.description && (
            <span className="mt-1 block text-xs leading-snug text-ink-soft">
              {option.description}
            </span>
          )}
          {option.socialProof && <SocialProofLine text={option.socialProof} />}
        </span>
      </button>
    );
  }

  if (layout === "portrait") {
    if (!hasPhoto) {
      return (
        <button
          type="button"
          onClick={withBurst(onClick)}
          disabled={disabled}
          aria-pressed={selected}
          className={clsx(base, "flex flex-col items-center gap-3 px-4 py-8")}
        >
          {checkBadge}
          <QuizIconBadge icon={option.icon} size="md" active={selected} />
          <span className="gf-display text-lg font-extrabold text-ink">
            {option.label}
          </span>
        </button>
      );
    }
    return (
      <button
        type="button"
        onClick={withBurst(onClick)}
        disabled={disabled}
        aria-pressed={selected}
        className={clsx(base, "flex flex-col items-center px-3 pt-0 pb-5")}
      >
        {checkBadge}
        {/* The cut-out breaks above the card, exactly like the reference. */}
        <OptionPhoto
          src={option.image}
          alt={option.label}
          label={option.label}
          icon={option.icon}
          className="-mt-14 h-64 w-full"
        />
        <span className="gf-display mt-2 text-xl font-extrabold text-ink">
          {option.label}
        </span>
      </button>
    );
  }

  // tile
  if (hasPhoto) {
    return (
      <button
        type="button"
        onClick={withBurst(onClick)}
        disabled={disabled}
        aria-pressed={selected}
        // The border color is inline (not a Tailwind utility class)
        // specifically so it always wins over `.gf-cyber-scope .gf-card`'s
        // own border-color rule, no specificity fight — a faint gold hairline
        // at rest (never the flat "dull white frame" look), brightening to
        // the full selected ring once picked.
        style={{ borderColor: selected ? undefined : "rgba(232,179,44,0.38)", borderWidth: 1.5 }}
        className={clsx(
          base,
          "group relative flex aspect-[10/11] flex-col justify-end overflow-hidden p-3",
          // The static selected ring (.gf-card-active, applied via `base`)
          // is instant — this layers a blooming neon frame on top so the
          // pick reads as a satisfying "lock-in," not just a flat outline
          // snapping on.
          selected && "gf-tile-frame-pulse",
        )}
      >
        <div className="absolute inset-0">
          <OptionPhoto
            src={option.image}
            alt={option.label}
            label={option.label}
            icon={option.icon}
            className="h-full w-full"
            // A living, premium feel on hover/touch — the photo itself
            // breathes forward while the card frame stays put, clipped by
            // OptionPhoto's own overflow-hidden bed.
            imageClassName="scale-100 transition-transform duration-500 ease-out group-hover:scale-110 group-active:scale-110"
          />
        </div>
        {/* Deeper wash than a plain bottom fade — text needs to pop at max
            contrast regardless of how bright the photo underneath is. */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-black/5"
          aria-hidden
        />
        <div
          className={clsx(
            "absolute inset-0 bg-gradient-to-t from-electric/50 via-electric/15 to-transparent",
            selected
              ? "gf-tile-select-pulse opacity-100"
              : "opacity-0 transition-opacity duration-300 ease-out",
          )}
          aria-hidden
        />
        {checkBadge}
        {/* Title + stat badge only — no subtitle. Nobody reads card copy at
            a glance, so the pitch has to land in two beats: what it is,
            then the proof everyone else already picked it. */}
        <span className="gf-display relative text-lg leading-tight font-extrabold text-white">
          {option.label}
        </span>
        {option.socialProof && <SocialProofLine text={option.socialProof} badge solid />}
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={withBurst(onClick)}
      disabled={disabled}
      aria-pressed={selected}
      className={clsx(base, "flex flex-col items-center gap-2.5 p-5 text-center")}
    >
      {checkBadge}
      <QuizIconBadge icon={option.icon} size="lg" active={selected} />
      <span className="gf-display text-base leading-tight font-extrabold text-ink">
        {option.label}
      </span>
      {option.description && (
        <span className="mt-0.5 text-xs leading-snug text-ink-soft">{option.description}</span>
      )}
      {option.socialProof && <SocialProofLine text={option.socialProof} />}
    </button>
  );
}

/** A quiet, native-app-style stat caption — no pill, no badge background.
 * `compact` trims the margin/size further for the dense option-row layout,
 * where it sits directly under a truncated description line instead of
 * over a full-bleed photo. */
function SocialProofLine({
  text,
  light = false,
  compact = false,
  badge = false,
  compactBadge = false,
  solid = false,
}: {
  text: string;
  light?: boolean;
  compact?: boolean;
  /** Renders as a highlighted gold pill instead of plain text — for the
   * big photo tiles, where peer-validation stats need to visually scream
   * rather than read as a quiet caption. */
  badge?: boolean;
  /** Tighter badge padding/margin for dense rows (only applies with badge). */
  compactBadge?: boolean;
  /** Solid gold fill + black text instead of a translucent outline pill —
   * the loudest possible treatment, reserved for the hero photo tiles so
   * the stat reads as its own standout tag, not just another caption. */
  solid?: boolean;
}) {
  if (badge) {
    return (
      <span
        className={clsx(
          "relative inline-flex items-start gap-1 self-start rounded-lg leading-snug font-black tracking-[0.01em] uppercase backdrop-blur-sm",
          solid
            ? "bg-electric text-black shadow-[0_8px_22px_-4px_rgba(232,179,44,0.95)]"
            : "gf-glow-electric border border-electric/70 bg-electric/25 text-white",
          compactBadge ? "mt-0.5 px-1.5 py-0.5 text-[8px]" : "mt-2 px-2 py-1 text-[9.5px]",
        )}
      >
        <TrendingUp
          className={clsx("mt-px size-2.5 shrink-0", solid ? "text-black" : "text-electric")}
          strokeWidth={3.5}
        />
        <span>{text}</span>
      </span>
    );
  }
  return (
    <span
      className={clsx(
        "relative flex items-center gap-1 font-bold",
        compact ? "mt-0.5 text-[10px]" : "mt-2 text-[11px]",
        light ? "text-white/90" : "text-electric",
      )}
    >
      <TrendingUp className={clsx("shrink-0", compact ? "size-2.5" : "size-3")} strokeWidth={3} />
      <span className="truncate">{text}</span>
    </span>
  );
}

function OptionCard({
  icon,
  label,
  description,
  socialProof,
  selected,
  disabled = false,
  onClick,
}: {
  icon: QuizIconKey;
  label: string;
  description?: string;
  socialProof?: string;
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={withBurst(onClick)}
      disabled={disabled}
      aria-pressed={selected}
      className={clsx(
        "gf-glass gf-card-hover gf-press relative flex flex-col items-center rounded-3xl p-4 text-center transition-all duration-300 ease-out",
        selected ? "gf-card-active scale-[1.03]" : "disabled:opacity-45",
      )}
    >
      {selected && (
        <span className="absolute top-3 right-3 z-20 grid size-6 place-items-center rounded-full bg-electric text-white shadow-md">
          <Check className="size-3.5" strokeWidth={3.5} />
        </span>
      )}
      <QuizIconBadge icon={icon} size="md" active={selected} />
      <span className="mt-3 block text-sm leading-tight font-extrabold tracking-tight text-ink">
        {label}
      </span>
      {description && (
        <span className="mt-1.5 block text-xs leading-snug text-ink-soft">
          {description}
        </span>
      )}
      {socialProof && <SocialProofLine text={socialProof} />}
    </button>
  );
}

