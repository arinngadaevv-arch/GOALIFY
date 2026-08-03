import type { Viewport } from "next";
import {
  Activity,
  Apple,
  ArrowRight,
  Camera,
  Dumbbell,
  Flame,
  ShieldCheck,
  Sparkles,
  Star,
  Timer,
  TrendingUp,
  UserRound,
} from "lucide-react";
import { Brand } from "@/components/goalify/brand";
import { GlassCard } from "@/components/goalify/ui/glass-card";
import { GlowLink } from "@/components/goalify/ui/glow-button";
import { VisualSlot } from "@/components/goalify/ui/visual-slot";
import { CoachBubble } from "@/components/goalify/coach/coach-bubble";
import { ParticleField } from "@/components/goalify/ui/particles";
import { CountUp } from "@/components/goalify/ui/count-up";
import { COACH_GREETINGS } from "@/lib/goalify/coach";
import { TrainerSlideshow } from "@/components/goalify/coach/trainer-slideshow";
import { TRAINERS, TrainerCard } from "@/components/goalify/coach/trainer-card";
import { CoachGuide } from "@/components/goalify/coach/coach-guide";
import { Pill } from "@/components/goalify/ui/stat";

const TRANSFORMATIONS = [
  { name: "Maya R.", weeks: 14, change: "-9.4 kg", goal: "Fat Burn" },
  { name: "Dan K.", weeks: 10, change: "+4.1 kg", goal: "Muscle Build" },
  { name: "Priya S.", weeks: 12, change: "-6.8 kg", goal: "Lean Sculpt" },
];

const FEATURES = [
  {
    Icon: Activity,
    title: "3D AI form coach",
    body: "A rendered coach demonstrates every rep from the angle that matters, with live cues so your technique never drifts.",
  },
  {
    Icon: ShieldCheck,
    title: "Joint-safe by design",
    body: "Tell us your knees complain and every jump, lunge and deep bend is rebuilt — without shortening the session.",
  },
  {
    Icon: Apple,
    title: "Nutrition without logging",
    body: "Precise calorie and protein targets plus pre/post workout rules. No weighing food, no endless diary entries.",
  },
  {
    Icon: TrendingUp,
    title: "Proof you're changing",
    body: "Weight projection, a 30-day completion grid, photo vault and trophies that make the invisible progress obvious.",
  },
];

const STEPS = [
  {
    number: "01",
    title: "Answer 8 fast questions",
    body: "Goals, obstacles, training level, and the time you actually have.",
  },
  {
    number: "02",
    title: "Get your blueprint",
    body: "A full program and daily fuel targets calculated from your own numbers.",
  },
  {
    number: "03",
    title: "Train from day one",
    body: "Press start. Your coach counts you in and holds you to it.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "The knee-safe swap is the reason I'm still training. Nothing else adapted — it just told me to push through.",
    name: "Maya R.",
    detail: "14-week streak",
  },
  {
    quote:
      "I stopped guessing what to eat. Two numbers a day and the weight actually moved.",
    name: "Dan K.",
    detail: "−9.4 kg",
  },
  {
    quote:
      "The launchpad before each session is stupidly effective. I never skip anymore.",
    name: "Priya S.",
    detail: "62 sessions",
  },
];

export const viewport: Viewport = {
  themeColor: "#0b0e14",
  colorScheme: "dark",
};

export default function LandingPage() {
  return (
    <main className="gf-cyber-scope relative mx-auto w-full max-w-6xl px-5 pb-24">
      <ParticleField />

      <nav className="relative flex items-center justify-between py-6">
        <Brand />
        <div className="flex items-center gap-2">
          <GlowLink href="/quiz" variant="ghost" size="sm" className="max-sm:hidden">
            How it works
          </GlowLink>
          <GlowLink href="/quiz" size="sm">
            Start free analysis
          </GlowLink>
        </div>
      </nav>

      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative grid items-center gap-10 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:py-16">
        <div className="gf-anim-rise">
          <Pill tone="lime">
            <Sparkles className="size-3" /> No equipment required
          </Pill>

          <h1 className="gf-display mt-5 text-5xl font-black text-ink sm:text-6xl lg:text-7xl">
            NO GYM. NO EXCUSES.
            <br />
            <span className="gf-text-hype">BUILD YOUR ULTIMATE PHYSIQUE AT HOME.</span>
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink-soft">
            Transform your body using pure bodyweight mastery. Get a
            high-octane 30-day home blueprint engineered for fast muscle
            growth and maximum fat loss.
          </p>

          {/* The coach speaks before the user has done anything. */}
          <CoachBubble
            message={COACH_GREETINGS[0]}
            avatarPhotoSrc="/quiz/goal-athletic.png"
            className="mt-7 max-w-lg"
          />

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <GlowLink href="/quiz" size="xl" pulse className="gf-anim-hype">
              START MY HOME TRANSFORMATION ⚡
              <ArrowRight className="size-5" />
            </GlowLink>
            <span className="text-sm font-semibold text-mist">
              90 seconds · Free · No card
            </span>
          </div>

          <div className="mt-10 flex items-center gap-5">
            <div className="flex -space-x-3">
              {[Activity, Flame, Dumbbell, UserRound].map((MemberIcon, index) => (
                <VisualSlot
                  key={index}
                  label="Member"
                  icon={MemberIcon}
                  rounded="rounded-full"
                  showChrome={false}
                  className="size-11 ring-2 ring-[#0b0e14]"
                />
              ))}
            </div>
            <div>
              <div className="flex gap-0.5 text-lime-deep">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="size-4 fill-current" />
                ))}
              </div>
              <p className="mt-1 text-sm font-semibold text-ink-soft">
                <span className="font-extrabold text-ink">128,400+</span> plans
                built
              </p>
            </div>
          </div>
        </div>

        <div className="gf-anim-materialize relative">
          <TrainerSlideshow />

          <GlassCard
            deep
            className="gf-anim-float absolute -bottom-2 -left-3 w-48 p-4 sm:-left-6"
          >
            <div className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-xl bg-lime-neon/20">
                <Timer className="size-4 text-lime-deep" />
              </span>
              <div>
                <p className="gf-numeric text-lg font-extrabold text-ink">
                  24 min
                </p>
                <p className="text-[11px] font-semibold text-mist">
                  Today&apos;s session
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard
            tone="electric"
            deep
            className="gf-anim-float gf-delay-3 absolute -top-3 -right-2 w-40 p-4"
          >
            <p className="text-[11px] font-bold tracking-[0.14em] text-electric uppercase">
              Form score
            </p>
            <p className="gf-numeric mt-1 text-3xl font-black text-ink">96%</p>
          </GlassCard>
        </div>
      </section>

      {/* ---------------------------------------------- Transformation preview */}
      <section className="pb-16">
        <div className="mx-auto max-w-2xl text-center">
          <Pill tone="lime">
            <Sparkles className="size-3" /> Real member outcomes
          </Pill>
          <h2 className="gf-display mt-4 text-4xl font-black text-ink sm:text-5xl">
            See it before you feel it
          </h2>
          <p className="mx-auto mt-3 max-w-md text-base text-ink-soft">
            Your own before/after vault unlocks from day one. This is what
            &ldquo;it worked&rdquo; actually looks like.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {TRANSFORMATIONS.map(({ name, weeks, change, goal }, index) => (
            <GlassCard
              key={name}
              deep
              interactive
              className={`gf-anim-rise gf-delay-${index + 1} overflow-hidden p-0`}
            >
              <div className="grid grid-cols-2 gap-px bg-ink/6">
                <div className="relative">
                  <VisualSlot
                    label="Before"
                    icon={Camera}
                    showChrome={false}
                    rounded="rounded-none"
                    className="aspect-3/4 w-full"
                  />
                  <span className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-black tracking-[0.1em] text-black/75 uppercase">
                    Before
                  </span>
                </div>
                <div className="relative">
                  <VisualSlot
                    label="After"
                    icon={Sparkles}
                    showChrome={false}
                    rounded="rounded-none"
                    className="aspect-3/4 w-full"
                  />
                  <span className="absolute bottom-2 right-2 rounded-full bg-lime-neon px-2 py-0.5 text-[10px] font-black tracking-[0.1em] text-ink uppercase">
                    After
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between p-5">
                <div>
                  <p className="text-sm font-extrabold text-ink">{name}</p>
                  <p className="text-xs font-semibold text-electric">
                    {goal} · {weeks} weeks
                  </p>
                </div>
                <span className="gf-numeric rounded-full bg-lime-neon/18 px-3 py-1.5 text-sm font-black text-lime-deep">
                  {change}
                </span>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------------------- Stats */}
      <GlassCard
        deep
        className="gf-anim-rise relative grid grid-cols-2 gap-6 p-7 sm:grid-cols-4"
      >
        <TickerStat to={128400} suffix="+" label="Plans built" tone="electric" />
        <TickerStat to={4.9} decimals={1} label="Average rating" tone="ink" />
        <TickerStat to={87} suffix="%" label="Still training at week 8" tone="lime" />
        <TickerStat to={8} label="Questions to start" tone="ink" />
      </GlassCard>

      {/* ----------------------------------------------------------- How it works */}
      <section className="py-20">
        <div className="mx-auto max-w-2xl text-center">
          <Pill>How it works</Pill>
          <h2 className="gf-display mt-4 text-4xl font-black text-ink sm:text-5xl">
            90 seconds from now, you&apos;re training
          </h2>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {STEPS.map(({ number, title, body }, index) => (
            <GlassCard
              key={number}
              deep
              className={`gf-anim-rise gf-delay-${index + 1} p-7`}
            >
              <span className="gf-numeric gf-text-electric text-4xl font-black">
                {number}
              </span>
              <h3 className="gf-display mt-4 text-xl font-extrabold text-ink">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-mist">{body}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------- Coaching team */}
      <section className="pb-20">
        <div className="mx-auto max-w-2xl text-center">
          <Pill tone="lime">Your corner</Pill>
          <h2 className="gf-display mt-4 text-4xl font-black text-ink sm:text-5xl">
            Meet the team in your pocket
          </h2>
          <p className="mx-auto mt-3 max-w-md text-base text-ink-soft">
            Whatever your body needs on the day, one of them is already
            warmed up and waiting.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TRAINERS.map((trainer, index) => (
            <TrainerCard
              key={trainer.id}
              trainer={trainer}
              className={`gf-anim-swoop gf-delay-${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------ Features */}
      <section className="pb-20">
        <div className="mx-auto max-w-2xl text-center">
          <Pill tone="lime">Inside the app</Pill>
          <h2 className="gf-display mt-4 text-4xl font-black text-ink sm:text-5xl">
            Every excuse. Engineered out.
          </h2>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {FEATURES.map(({ Icon, title, body }, index) => (
            <GlassCard
              key={title}
              deep
              interactive
              className={`gf-anim-rise gf-delay-${index + 1} p-7`}
            >
              <span className="gf-glow-electric grid size-12 place-items-center rounded-2xl bg-electric">
                <Icon className="size-6 text-white" strokeWidth={2.2} />
              </span>
              <h3 className="gf-display mt-5 text-xl font-extrabold text-ink">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-mist">{body}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* -------------------------------------------------------- Testimonials */}
      <section className="pb-20">
        <div className="grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map(({ quote, name, detail }, index) => (
            <GlassCard
              key={name}
              interactive
              className={`gf-anim-rise gf-delay-${index + 1} p-6`}
            >
              <div className="flex gap-0.5 text-lime-deep">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="size-3.5 fill-current" />
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-ink-soft">
                &ldquo;{quote}&rdquo;
              </p>
              <div className="mt-5 flex items-center gap-3">
                <VisualSlot
                  label="Member"
                  icon={UserRound}
                  rounded="rounded-full"
                  showChrome={false}
                  className="size-9"
                />
                <div>
                  <p className="text-sm font-bold text-ink">{name}</p>
                  <p className="text-xs font-semibold text-electric">{detail}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* ----------------------------------------------------------- Final CTA */}
      <GlassCard
        tone="electric"
        deep
        className="gf-anim-rise overflow-hidden px-7 py-14 text-center"
      >
        <h2 className="gf-display mx-auto max-w-xl text-4xl font-black text-ink sm:text-5xl">
          You&apos;ve read enough.{" "}
          <span className="gf-text-hype">Go earn it.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-md text-base text-ink-soft">
          90 seconds of honest answers. A plan you can run today. And a coach
          who won&apos;t let you disappear in week three.
        </p>
        <GlowLink href="/quiz" size="xl" pulse className="mt-8">
          START MY HOME TRANSFORMATION ⚡
          <ArrowRight className="size-5" />
        </GlowLink>
      </GlassCard>

      <footer className="relative mt-16 flex flex-col items-center gap-4 border-t border-ink/8 pt-8 text-center sm:flex-row sm:justify-between sm:text-left">
        <Brand />
        <p className="text-xs text-mist">
          GOALIFY is a fitness education product, not medical advice. Consult a
          physician before starting any program.
        </p>
      </footer>

      <CoachGuide photoSrc="/quiz/coach-portrait.png" />
    </main>
  );
}

/** A headline stat that ticks up into place on first paint. */
function TickerStat({
  to,
  label,
  decimals = 0,
  suffix = "",
  tone = "ink",
}: {
  to: number;
  label: string;
  decimals?: number;
  suffix?: string;
  tone?: "ink" | "electric" | "lime";
}) {
  const toneClass =
    tone === "electric"
      ? "text-electric"
      : tone === "lime"
        ? "text-lime-deep"
        : "text-ink";

  return (
    <div className="text-center">
      <p className={`gf-numeric text-2xl font-extrabold ${toneClass}`}>
        <CountUp to={to} decimals={decimals} suffix={suffix} />
      </p>
      <p className="mt-1 text-[11px] font-semibold tracking-[0.12em] text-mist uppercase">
        {label}
      </p>
    </div>
  );
}
