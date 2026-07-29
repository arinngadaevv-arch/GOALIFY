"use client";

import clsx from "clsx";
import { Droplets, Minus, RotateCcw } from "lucide-react";
import { useGoalify } from "@/lib/goalify/store";
import { GlassCard } from "./ui/glass-card";

/**
 * The 3D water tracker: a glossy bottle whose fill level animates as glasses
 * are added. Tapping a marker jumps straight to that amount.
 */
export function WaterTracker() {
  const { waterGlasses, targets, setWater } = useGoalify();
  const glasses = waterGlasses;
  const goal = targets.waterGlasses;
  const percent = Math.min(100, (glasses / goal) * 100);
  const litres = ((glasses * 250) / 1000).toFixed(2);

  return (
    <GlassCard deep className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="gf-display text-lg font-extrabold text-ink">
            Water tracker
          </h2>
          <p className="mt-1 text-xs text-mist">
            Target {(targets.waterMl / 1000).toFixed(1)} L · {goal} glasses
          </p>
        </div>
        <button
          type="button"
          onClick={() => setWater(0)}
          aria-label="Reset water"
          className="gf-glass gf-press grid size-9 place-items-center rounded-full text-mist hover:text-electric"
        >
          <RotateCcw className="size-4" />
        </button>
      </div>

      <div className="mt-6 flex items-center gap-7">
        {/* ------------------------------------------------------ The bottle */}
        <div className="relative h-52 w-28 shrink-0">
          {/* Cap */}
          <div className="absolute inset-x-9 top-0 h-5 rounded-t-lg bg-linear-to-b from-electric to-[#0040c8] shadow-md" />

          {/* Body */}
          <div
            className={clsx(
              "absolute inset-x-0 top-4 bottom-0 overflow-hidden rounded-t-3xl rounded-b-[2rem]",
              "border border-white/90 bg-linear-to-br from-white/80 to-white/40",
              "shadow-[inset_0_2px_8px_rgba(255,255,255,0.9),0_18px_36px_-18px_rgba(0,82,255,0.5)]",
              "backdrop-blur-md",
            )}
          >
            {/* Fill */}
            <div
              className="absolute inset-x-0 bottom-0 transition-[height] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{ height: `${percent}%` }}
            >
              <div className="absolute inset-0 bg-linear-to-t from-electric via-[#2f7bff] to-[#7fb0ff]" />
              {/* Surface wave */}
              <div
                className="gf-anim-wave absolute -top-2 h-4 w-[150%] rounded-[50%] bg-white/45"
                aria-hidden
              />
              {/* Bubbles */}
              <span className="gf-anim-float absolute bottom-4 left-5 size-2 rounded-full bg-white/60" />
              <span
                className="gf-anim-float absolute bottom-10 left-12 size-1.5 rounded-full bg-white/50"
                style={{ animationDelay: "1.2s" }}
              />
            </div>

            {/* Specular highlight for the 3D read */}
            <div className="absolute top-3 left-3 h-24 w-3 rounded-full bg-white/70 blur-[2px]" />

            {/* Level markers */}
            <div className="absolute inset-y-4 right-2 flex flex-col-reverse justify-between">
              {Array.from({ length: goal }).map((_, level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setWater(level + 1)}
                  aria-label={`Set to ${level + 1} glasses`}
                  className={clsx(
                    "h-0.5 w-3 rounded-full transition-colors",
                    level < glasses ? "bg-white/80" : "bg-electric/25",
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------- Readout */}
        <div className="min-w-0 flex-1">
          <p className="gf-numeric text-5xl font-black text-ink">
            {litres}
            <span className="ml-1 text-lg font-bold text-mist">L</span>
          </p>
          <p className="mt-1 text-sm font-semibold text-mist">
            {glasses} of {goal} glasses
          </p>

          <div className="mt-5 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setWater(glasses - 1)}
              disabled={glasses === 0}
              aria-label="Remove a glass"
              className="gf-glass gf-press grid size-11 place-items-center rounded-full text-ink-soft disabled:opacity-30"
            >
              <Minus className="size-5" strokeWidth={3} />
            </button>
            <button
              type="button"
              onClick={() => setWater(glasses + 1)}
              aria-label="Add a glass"
              className="gf-press gf-glow-electric flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-electric text-sm font-black text-white"
            >
              <Droplets className="size-4" />
              ADD GLASS
            </button>
          </div>

          {percent >= 100 && (
            <p className="mt-4 rounded-2xl bg-lime-neon/15 px-3 py-2 text-xs font-bold text-lime-deep">
              Hydration goal hit. Nice.
            </p>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
