"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import clsx from "clsx";
import { useGoalify } from "@/lib/goalify/store";
import { GlassCard } from "./ui/glass-card";

const MAX_QUOTE_LENGTH = 300;

/**
 * The real replacement for the fabricated "4.9 · 1,250+ reviews" stat that
 * used to be hardcoded in analyzing-screen.tsx. The primary entry point is
 * the one-time nudge on the post-workout CompletionScreen after three
 * sessions (see live-player.tsx) — but that's a single automatic moment,
 * not a standing way to leave or update a review whenever someone actually
 * wants to, so this also renders unconditionally in Settings (see
 * settings.tsx) with its own copy, no three-session gate. Either way,
 * submissions land in the `reviews` table as unapproved; an admin has to
 * explicitly publish one (see /admin's Reviews section) before it counts
 * toward anything public.
 */
export function ReviewPrompt({
  title = "Three sessions in — how's it going?",
  className = "gf-anim-rise gf-delay-6 mt-7",
}: {
  title?: string;
  className?: string;
}) {
  const { dismissReviewPrompt } = useGoalify();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [quote, setQuote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(false);

  async function submit() {
    if (rating === 0) return;
    setSubmitting(true);
    setError(false);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, quote: quote.trim() || undefined }),
      });
      if (!res.ok) throw new Error();
      setDone(true);
      dismissReviewPrompt();
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <GlassCard
        deep
        className={clsx(className, "p-5 text-center text-sm font-bold text-lime-deep")}
      >
        Thanks — that actually means a lot. 🙏
      </GlassCard>
    );
  }

  return (
    <GlassCard deep className={clsx(className, "p-5 text-left")}>
      <p className="text-sm font-black text-ink">{title}</p>
      <p className="mt-1 text-xs text-mist">
        A real rating from you, nothing invented — this is what other people
        considering GOALIFY will actually see.
      </p>

      <div className="mt-4 flex items-center justify-center gap-1.5">
        {Array.from({ length: 5 }).map((_, i) => {
          const value = i + 1;
          const filled = value <= (hovered || rating);
          return (
            <button
              key={value}
              type="button"
              aria-label={`${value} star${value === 1 ? "" : "s"}`}
              onClick={() => setRating(value)}
              onMouseEnter={() => setHovered(value)}
              onMouseLeave={() => setHovered(0)}
              className="gf-press p-1"
            >
              <Star
                className={clsx(
                  "size-8 transition-colors",
                  filled ? "fill-electric text-electric" : "text-ink/15",
                )}
              />
            </button>
          );
        })}
      </div>

      {rating > 0 && (
        <textarea
          value={quote}
          onChange={(event) => setQuote(event.target.value.slice(0, MAX_QUOTE_LENGTH))}
          placeholder="Anything you'd want to tell someone thinking about starting? (optional)"
          rows={2}
          className="gf-anim-rise mt-3 w-full resize-none rounded-2xl border border-ink/10 bg-ink/4 p-3 text-xs text-ink placeholder:text-haze focus:border-electric/40 focus:outline-none"
        />
      )}

      {error && (
        <p className="mt-2 text-[11px] font-semibold text-red-400">
          Couldn&apos;t submit that — try again in a moment.
        </p>
      )}

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          disabled={rating === 0 || submitting}
          onClick={submit}
          className="gf-press gf-glow-electric flex-1 rounded-full bg-electric px-4 py-2.5 text-xs font-black text-white uppercase tracking-wide disabled:opacity-40"
        >
          {submitting ? "Sending…" : "Submit"}
        </button>
        <button
          type="button"
          onClick={dismissReviewPrompt}
          className="text-xs font-bold text-mist hover:text-ink"
        >
          Maybe later
        </button>
      </div>
    </GlassCard>
  );
}
