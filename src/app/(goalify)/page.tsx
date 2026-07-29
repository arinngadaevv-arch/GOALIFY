import {
  Activity,
  Apple,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Star,
  Timer,
  TrendingUp,
} from "lucide-react";
import { Brand } from "@/components/goalify/brand";
import { GlassCard } from "@/components/goalify/ui/glass-card";
import { GlowLink } from "@/components/goalify/ui/glow-button";
import { CoachAvatar, VisualSlot } from "@/components/goalify/ui/visual-slot";
import { Pill, Stat } from "@/components/goalify/ui/stat";

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
    title: "Answer 11 questions",
    body: "Goals, training history, joints, and the time you actually have.",
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

export default function LandingPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-5 pb-24">
      <nav className="flex items-center justify-between py-6">
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
      <section className="grid items-center gap-10 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:py-16">
        <div className="gf-anim-rise">
          <Pill tone="lime">
            <Sparkles className="size-3" /> No equipment required
          </Pill>

          <h1 className="gf-display mt-5 text-5xl font-black text-ink sm:text-6xl lg:text-7xl">
            Your body,
            <br />
            <span className="gf-text-hype">engineered.</span>
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink-soft">
            GOALIFY builds a training and nutrition system around your goal,
            your starting point and your joints — then coaches you through
            every single rep in 3D.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <GlowLink href="/quiz" size="xl" pulse>
              Build my plan
              <ArrowRight className="size-5" />
            </GlowLink>
            <span className="text-sm font-semibold text-mist">
              Takes 90 seconds · Free
            </span>
          </div>

          <div className="mt-10 flex items-center gap-5">
            <div className="flex -space-x-3">
              {["🏃", "🧘", "🤸", "🏋️"].map((emoji) => (
                <VisualSlot
                  key={emoji}
                  label="Member"
                  emoji={emoji}
                  rounded="rounded-full"
                  showChrome={false}
                  className="size-11 ring-2 ring-white"
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
          <CoachAvatar
            hint="Hero coach render drops in here"
            className="aspect-4/5 w-full"
          />

          <GlassCard
            deep
            className="gf-anim-float absolute -bottom-5 -left-3 w-52 p-4 sm:-left-6"
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
            className="gf-anim-float gf-delay-3 absolute -top-3 -right-2 w-44 p-4"
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-electric">
              Form score
            </p>
            <p className="gf-numeric mt-1 text-3xl font-black text-ink">96%</p>
          </GlassCard>
        </div>
      </section>

      {/* --------------------------------------------------------------- Stats */}
      <GlassCard deep className="grid grid-cols-2 gap-6 p-7 sm:grid-cols-4">
        <Stat value="128k+" label="Plans built" tone="electric" />
        <Stat value="4.9" label="Average rating" tone="ink" />
        <Stat value="87%" label="Still training at week 8" tone="lime" />
        <Stat value="11" label="Questions to start" tone="ink" />
      </GlassCard>

      {/* ----------------------------------------------------------- How it works */}
      <section className="py-20">
        <div className="mx-auto max-w-2xl text-center">
          <Pill>How it works</Pill>
          <h2 className="gf-display mt-4 text-4xl font-black text-ink sm:text-5xl">
            Three steps to day one
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

      {/* ------------------------------------------------------------ Features */}
      <section className="pb-20">
        <div className="mx-auto max-w-2xl text-center">
          <Pill tone="lime">Inside the app</Pill>
          <h2 className="gf-display mt-4 text-4xl font-black text-ink sm:text-5xl">
            Built to remove every excuse
          </h2>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {FEATURES.map(({ Icon, title, body }) => (
            <GlassCard key={title} deep interactive className="p-7">
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
          {TESTIMONIALS.map(({ quote, name, detail }) => (
            <GlassCard key={name} className="p-6">
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
                  emoji="👤"
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
        className="overflow-hidden px-7 py-14 text-center"
      >
        <h2 className="gf-display mx-auto max-w-xl text-4xl font-black text-ink sm:text-5xl">
          Stop planning. <span className="gf-text-hype">Start day one.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-md text-base text-ink-soft">
          Your free analysis takes 90 seconds and ends with a plan you can run
          today.
        </p>
        <GlowLink href="/quiz" size="xl" pulse className="mt-8">
          Build my plan
          <ArrowRight className="size-5" />
        </GlowLink>
      </GlassCard>

      <footer className="mt-16 flex flex-col items-center gap-4 border-t border-ink/8 pt-8 text-center sm:flex-row sm:justify-between sm:text-left">
        <Brand />
        <p className="text-xs text-mist">
          GOALIFY is a fitness education product, not medical advice. Consult a
          physician before starting any program.
        </p>
      </footer>
    </main>
  );
}
