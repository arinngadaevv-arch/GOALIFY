"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { TRAINERS, TrainerCard } from "./trainer-card";

const ROTATE_MS = 3600;

/**
 * Auto-advancing roster of coaches for the landing hero. Rotation pauses on
 * hover so a reader is never fighting the carousel, and every slide is
 * reachable by its dot control.
 */
export function TrainerSlideshow({ className }: { className?: string }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(
      () => setIndex((i) => (i + 1) % TRAINERS.length),
      ROTATE_MS,
    );
    return () => clearInterval(timer);
  }, [paused]);

  const trainer = TRAINERS[index];

  return (
    <div
      className={clsx("relative", className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <TrainerCard key={trainer.id} trainer={trainer} className="gf-anim-swoop" />

      <div className="mt-4 flex items-center justify-center gap-2">
        {TRAINERS.map((option, dot) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setIndex(dot)}
            aria-label={`Show coach ${option.name}`}
            aria-current={dot === index}
            className={clsx(
              "h-1.5 rounded-full transition-all duration-300",
              dot === index
                ? "w-7 bg-electric shadow-[0_0_10px_rgba(232,179,44,0.7)]"
                : "w-1.5 bg-ink/15 hover:bg-ink/30",
            )}
          />
        ))}
      </div>
    </div>
  );
}
