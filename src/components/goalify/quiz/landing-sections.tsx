import {
  Apple,
  ArrowRight,
  ClipboardList,
  Dumbbell,
  LineChart,
  ShieldCheck,
  Sparkles,
  Video,
} from "lucide-react";
import { GlowButton } from "@/components/goalify/ui/glow-button";
import { centsToDollars, PRICING_TIERS } from "@/lib/goalify/pricing";

/**
 * Real, in-page destinations for the desktop hero's baked-in nav row
 * ("How It Works" / "Features" / "Plans" / "FAQ") — that row is flat pixels
 * inside the hero <Image> (see welcome-cta-step.tsx), not real text, so
 * clicking those words used to do nothing at all. The invisible buttons
 * overlaid on top of them there scroll to the matching `id` below.
 * FAQ itself isn't duplicated here — SeoContent already owns that content,
 * this only needs to exist for "How It Works"/"Features"/"Plans", which
 * had no real section to land on before now.
 */
const HOW_IT_WORKS_STEPS = [
  {
    icon: ClipboardList,
    title: "Take the 2-minute quiz",
    description:
      "Your goal, schedule, fitness level, and any joint issues — no account needed to start.",
  },
  {
    icon: Sparkles,
    title: "Get your plan instantly",
    description:
      "A bodyweight workout plan and daily nutrition targets, built around your actual answers.",
  },
  {
    icon: Video,
    title: "Train with guidance",
    description:
      "Every session runs in a guided player with rep/time coaching and AI form tips as you go.",
  },
  {
    icon: LineChart,
    title: "Track and adapt",
    description:
      "Log meals, snap progress photos, and the plan adjusts as your results come in.",
  },
] as const;

const FEATURES = [
  {
    icon: Dumbbell,
    title: "Zero equipment",
    description: "Every workout is 100% bodyweight — no gym, no dumbbells required.",
  },
  {
    icon: Sparkles,
    title: "AI-personalized plans",
    description: "Built from your quiz answers, not a generic PDF everyone gets.",
  },
  {
    icon: Video,
    title: "Guided workout player",
    description: "Rep and time coaching baked into every session, exercise by exercise.",
  },
  {
    icon: Apple,
    title: "Nutrition guidance",
    description: "Daily calorie and habit targets that adapt as your weight changes.",
  },
  {
    icon: LineChart,
    title: "Progress tracking",
    description: "Photos, completion history, and milestones in one place.",
  },
  {
    icon: ShieldCheck,
    title: "Joint-friendly options",
    description: "Automatic swaps for high-impact moves based on what you flag in the quiz.",
  },
] as const;

export function LandingSections({ onStart }: { onStart: () => void }) {
  return (
    <div className="relative mx-auto max-w-lg text-white/80 lg:max-w-3xl lg:px-12">
      <section id="how-it-works" className="scroll-mt-20 pt-14">
        <p className="text-center text-[11px] font-black tracking-[0.16em] text-[#FFC700] uppercase">
          How it works
        </p>
        <h2 className="gf-display mt-2 text-center text-2xl leading-tight font-black text-white sm:text-3xl">
          From quiz to workout in minutes
        </h2>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {HOW_IT_WORKS_STEPS.map((step, index) => (
            <div
              key={step.title}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
            >
              <div className="flex items-center gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#FFC700]/15 text-[#FFC700]">
                  <step.icon className="size-4.5" strokeWidth={2.25} />
                </span>
                <span className="text-[11px] font-black tracking-[0.1em] text-white/40 uppercase">
                  Step {index + 1}
                </span>
              </div>
              <h3 className="mt-3 text-base font-bold text-white">{step.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-white/65">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="scroll-mt-20 pt-14">
        <p className="text-center text-[11px] font-black tracking-[0.16em] text-[#FFC700] uppercase">
          Features
        </p>
        <h2 className="gf-display mt-2 text-center text-2xl leading-tight font-black text-white sm:text-3xl">
          Everything built into every plan
        </h2>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#FFC700]/15 text-[#FFC700]">
                <feature.icon className="size-4.5" strokeWidth={2.25} />
              </span>
              <h3 className="mt-3 text-base font-bold text-white">{feature.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-white/65">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="plans" className="scroll-mt-20 pt-14 pb-4">
        <p className="text-center text-[11px] font-black tracking-[0.16em] text-[#FFC700] uppercase">
          Plans
        </p>
        <h2 className="gf-display mt-2 text-center text-2xl leading-tight font-black text-white sm:text-3xl">
          One plan, priced how you want to commit
        </h2>
        <p className="mx-auto mt-3 max-w-md text-center text-sm leading-relaxed text-white/65">
          Every plan unlocks the exact same personalized workouts and nutrition
          guidance — the only difference is how long you commit up front. Your
          exact plan and pricing are shown after the quiz, once it&apos;s built
          around you.
        </p>

        <div className="mx-auto mt-8 grid max-w-3xl gap-4 sm:grid-cols-3">
          {PRICING_TIERS.map((tier) => (
            <div
              key={tier.id}
              className={
                tier.popular
                  ? "rounded-2xl border-2 border-[#FFC700]/70 bg-[#FFC700]/[0.06] p-5 text-center"
                  : "rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center"
              }
            >
              {tier.badge && (
                <p className="mb-2 text-[10px] font-black tracking-[0.1em] text-[#FFC700] uppercase">
                  {tier.badge}
                </p>
              )}
              <p className="text-sm font-bold text-white">{tier.label}</p>
              <p className="gf-numeric mt-1 text-2xl font-black text-white">
                ${centsToDollars(tier.priceCents).toFixed(2)}
              </p>
              <p className="mt-0.5 text-xs font-semibold text-white/50">
                {tier.billedLabel}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <GlowButton variant="cyber" size="lg" onClick={onStart}>
            See your personalized plan
            <ArrowRight className="size-5" />
          </GlowButton>
        </div>
      </section>
    </div>
  );
}
