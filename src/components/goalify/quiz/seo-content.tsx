import { ChevronDown } from "lucide-react";

/**
 * Real, crawlable body text for the marketing front door — targets what
 * people actually search for around home workouts, plus FAQPage structured
 * data so answers can surface directly in Google results. Sits behind a
 * single collapsed disclosure (native <details>, not JS-gated) so it
 * doesn't compete visually with the hero above it: search engines still
 * read the full content regardless of the collapsed state, but a visitor
 * sees just one quiet "Frequently asked questions" line unless they tap it.
 *
 * Copy stays honest to what the product actually does — no claims beyond
 * what the rest of the app already makes (bodyweight-only, ~24 min
 * sessions, joint-friendly substitutions from the intake quiz).
 */
const FAQS = [
  {
    question: "Do I need any equipment for a home workout?",
    answer:
      "No. Every GOALIFY plan is 100% bodyweight — no dumbbells, no resistance bands, no gym membership. All you need is a few square feet of floor space.",
  },
  {
    question: "Can you actually lose weight with bodyweight exercises alone?",
    answer:
      "Yes. Bodyweight training builds real strength and burns fat when the reps, tempo, and progression are structured correctly — which is exactly what an adaptive home workout plan handles for you automatically.",
  },
  {
    question: "How long should a home workout be for beginners?",
    answer:
      "Most GOALIFY sessions run about 24 minutes — long enough to see real results, short enough that skipping a day never feels like the easy option.",
  },
  {
    question: "Is training at home safe for overweight or out-of-shape beginners?",
    answer:
      "Yes, when the plan accounts for it. GOALIFY adjusts intensity and swaps in joint-friendly alternatives for high-impact moves based on your starting fitness level and any joint issues you flag in the intake quiz.",
  },
  {
    question: "How many days a week should I work out at home?",
    answer:
      "3–5 days a week is the sweet spot for most beginners — enough to build real momentum without burning out. Rest days are scheduled into your plan automatically.",
  },
  {
    question: "What's the best home workout if I feel too self-conscious for a gym?",
    answer:
      "One nobody else sees. Training at home removes the audience entirely, so you can learn proper form and build the habit at your own pace — no equipment, no membership, no one watching.",
  },
] as const;

export function SeoContent() {
  return (
    <section className="relative mx-auto mt-6 mb-10 max-w-lg text-white/80 lg:max-w-3xl lg:px-12">
      <script
        type="application/ld+json"
        // Static, hand-written content — no user input ever flows into
        // this object, so no escaping/sanitization concerns.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQS.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer,
              },
            })),
          }),
        }}
      />

      <details className="group">
        <summary className="flex cursor-pointer list-none items-center justify-center gap-1.5 text-center text-xs font-bold text-white/50 marker:content-none hover:text-white/80">
          Frequently asked questions
          <ChevronDown className="size-3.5 transition-transform group-open:rotate-180" />
        </summary>

        <div className="mt-6 space-y-8">
          <div>
            <h2 className="gf-display text-2xl leading-tight font-black text-white">
              A home workout plan built for guys who skip the gym
            </h2>
            <p className="mt-3 text-sm leading-relaxed">
              Most home workout routines are generic — the same PDF everyone
              downloads. GOALIFY builds yours from a two-minute quiz: your
              current weight, fitness level, any joint pain, and your goal.
              No equipment, no gym, no judgment — just a bodyweight workout
              plan that actually fits where you&apos;re starting from.
            </p>
            <p className="mt-3 text-sm leading-relaxed">
              Whether you&apos;re looking for a beginner home workout, a
              no-equipment fat-loss routine, or just a plan you&apos;ll
              actually stick with — this is built to be the one you
              don&apos;t quit on.
            </p>
          </div>

          <div className="space-y-4 lg:columns-2 lg:gap-8 lg:space-y-0 [&>*]:lg:mb-4 [&>*]:lg:break-inside-avoid">
            {FAQS.map((faq) => (
              <div key={faq.question}>
                <p className="text-sm font-bold text-white">{faq.question}</p>
                <p className="mt-1 text-sm leading-relaxed text-white/70">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </details>
    </section>
  );
}
