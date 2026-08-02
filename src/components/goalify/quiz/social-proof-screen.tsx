"use client";

import { useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { GlowButton } from "@/components/goalify/ui/glow-button";
import { ParticleField } from "@/components/goalify/ui/particles";
import { useUiSounds } from "@/components/goalify/use-ui-sounds";

/**
 * PLACEHOLDER MARKETING COPY — fictional success stories, same convention as
 * buyer-ticker.tsx's rotating "just joined" strip. David M.'s before/after
 * pair is a real cropped photo asset (public/quiz/social-proof-before-1.png
 * / -after-1.png); Marcus T. reuses an existing in-app athletic photo with
 * no fabricated "before" pairing, since no second real transformation photo
 * exists. Wire to verified, consented real testimonials before this ever
 * reaches real users — presenting invented reviews as genuine is deceptive.
 */
type ProofStory = {
  name: string;
  handle: string;
  quote: string;
  before?: string;
  after: string;
};

const STORIES: ProofStory[] = [
  {
    name: "David M.",
    handle: "@DavidM, lost 28 kg",
    quote:
      "This plan changed my life. I lost 28 kg in 4 months and built real muscle. It's simple, effective and actually works!",
    before: "/quiz/social-proof-before-1.png",
    after: "/quiz/social-proof-after-1.png",
  },
  {
    name: "Marcus T.",
    handle: "@MarcusT, lost 19 kg",
    quote:
      "I finally stuck with a program past week two. Down 19 kg and I actually look forward to training now.",
    after: "/quiz/goal-build.png",
  },
];

const SWIPE_THRESHOLD = 60;

const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction > 0 ? -80 : 80, opacity: 0 }),
};

function PhotoBadge({ label, tone }: { label: string; tone: "before" | "after" }) {
  return (
    <span
      className={clsx(
        "absolute top-2 z-10 rounded-full px-2.5 py-1 text-[9px] font-black tracking-[0.1em] uppercase",
        tone === "before"
          ? "left-2 bg-black/70 text-white/80"
          : "right-2 gf-glow-electric bg-electric text-[#1a1100]",
      )}
    >
      {label}
    </span>
  );
}

/** High-credibility social proof carousel — shown between the analyzing
 * screen and the paywall, right when trust matters most before the offer. */
export function SocialProofScreen({ onContinue }: { onContinue: () => void }) {
  const [[index, direction], setSlide] = useState<[number, number]>([0, 0]);
  const { sliderTick } = useUiSounds();

  const go = (nextIndex: number, dir: number) => {
    const wrapped = ((nextIndex % STORIES.length) + STORIES.length) % STORIES.length;
    if (wrapped === index) return;
    setSlide([wrapped, dir]);
    sliderTick();
  };

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    if (info.offset.x < -SWIPE_THRESHOLD) go(index + 1, 1);
    else if (info.offset.x > SWIPE_THRESHOLD) go(index - 1, -1);
  };

  const story = STORIES[index];

  return (
    <main className="gf-cyber-scope relative mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 pb-12 text-center">
      <ParticleField />

      <div className="relative">
        <h1 className="gf-display relative text-3xl leading-[1.15] font-black text-ink">
          Over <span className="gf-text-electric">200,000</span> happy users
          are here, looking forward to having you!
        </h1>
      </div>

      <div className="relative mt-8">
        <div className="relative overflow-hidden rounded-3xl border border-[#FFC700]/35 bg-gradient-to-b from-[#161B26] to-[#0B0E14] p-5 shadow-[0_0_0_1px_rgba(255,199,0,0.08),0_30px_70px_-30px_rgba(0,0,0,0.9),0_0_50px_-16px_rgba(255,199,0,0.35)]">
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.div
              key={index}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.65}
              onDragEnd={handleDragEnd}
              className="cursor-grab active:cursor-grabbing"
            >
              {story.before ? (
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative aspect-3/4 overflow-hidden rounded-2xl">
                    <Image
                      src={story.before}
                      alt={`${story.name} before`}
                      fill
                      draggable={false}
                      className="pointer-events-none object-cover"
                    />
                    <PhotoBadge label="Before" tone="before" />
                  </div>
                  <div className="relative aspect-3/4 overflow-hidden rounded-2xl">
                    <Image
                      src={story.after}
                      alt={`${story.name} after`}
                      fill
                      draggable={false}
                      className="pointer-events-none object-cover"
                    />
                    <PhotoBadge label="After" tone="after" />
                  </div>
                </div>
              ) : (
                <div className="relative aspect-16/10 overflow-hidden rounded-2xl">
                  <Image
                    src={story.after}
                    alt={`${story.name} after`}
                    fill
                    draggable={false}
                    className="pointer-events-none object-cover object-top"
                  />
                  <PhotoBadge label="After" tone="after" />
                </div>
              )}

              <div className="mt-4 flex justify-center gap-1 text-electric">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="gf-glow-electric size-4 fill-current" />
                ))}
              </div>

              <p className="gf-display relative mt-3 text-sm leading-relaxed font-bold text-ink">
                &ldquo;{story.quote}&rdquo;
              </p>
              <p className="mt-2 text-xs font-semibold text-mist">{story.handle}</p>
            </motion.div>
          </AnimatePresence>

          {STORIES.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous story"
                onClick={() => go(index - 1, -1)}
                className="gf-glass gf-press absolute top-1/2 left-2 z-20 grid size-8 -translate-y-1/2 place-items-center rounded-full text-ink"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                aria-label="Next story"
                onClick={() => go(index + 1, 1)}
                className="gf-glass gf-press absolute top-1/2 right-2 z-20 grid size-8 -translate-y-1/2 place-items-center rounded-full text-ink"
              >
                <ChevronRight className="size-4" />
              </button>
            </>
          )}
        </div>

        {STORIES.length > 1 && (
          <div className="relative mt-5 flex justify-center gap-2">
            {STORIES.map((entry, i) => (
              <button
                key={entry.handle}
                type="button"
                aria-label={`Show ${entry.name}'s story`}
                aria-current={i === index}
                onClick={() => go(i, i > index ? 1 : -1)}
                className={clsx(
                  "h-2 rounded-full transition-all duration-300",
                  i === index ? "w-6 bg-electric" : "w-2 bg-ink/15",
                )}
              />
            ))}
          </div>
        )}
      </div>

      <GlowButton
        variant="cyber"
        size="xl"
        fullWidth
        pulse
        className="relative mt-10 text-lg tracking-tight"
        onClick={onContinue}
      >
        Continue <ArrowRight className="size-5" />
      </GlowButton>
    </main>
  );
}
