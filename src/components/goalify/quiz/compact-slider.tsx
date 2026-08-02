"use client";

import { useState } from "react";

/**
 * A dense, single-row slider for screens that need several numeric inputs
 * at once (see vitals-step.tsx) — native `<input type="range">` under the
 * hood so drag, keyboard and touch all come for free, styled to match the
 * quiz's neon accent via .gf-slider-neon in goalify.css.
 *
 * The value readout doubles as a direct-entry field: tapping it swaps in a
 * real numeric `<input>` so users who know their exact number don't have
 * to fight a slider for it. Committing (blur/Enter) clamps and steps the
 * typed value the same way a drag would, then hands it back to the slider.
 */
export function CompactSlider({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
  onCommit,
  disabled = false,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (next: number) => void;
  onCommit: () => void;
  disabled?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const startEditing = () => {
    if (disabled) return;
    setDraft(String(value));
    setEditing(true);
  };

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed !== "") {
      const parsed = Number(trimmed);
      if (!Number.isNaN(parsed)) {
        const stepped = Math.round(parsed / step) * step;
        const clamped = Math.min(max, Math.max(min, stepped));
        if (clamped !== value) {
          onChange(clamped);
          onCommit();
        }
      }
    }
    setEditing(false);
  };

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-black tracking-[0.1em] text-mist uppercase">
          {label}
        </span>
        {editing ? (
          <input
            type="number"
            inputMode="numeric"
            autoFocus
            value={draft}
            min={min}
            max={max}
            step={step}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={commit}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.currentTarget.blur();
              if (event.key === "Escape") {
                setEditing(false);
              }
            }}
            aria-label={`${label} (exact value)`}
            className="gf-numeric w-20 rounded-lg border border-electric/50 bg-black/30 px-2 py-0.5 text-right text-2xl font-black text-electric outline-none"
          />
        ) : (
          <button
            type="button"
            onClick={startEditing}
            disabled={disabled}
            aria-label={`Edit ${label.toLowerCase()} directly`}
            className="gf-numeric gf-cyber-glow-text gf-press text-2xl font-black underline decoration-electric/40 decoration-dotted underline-offset-4 disabled:pointer-events-none"
          >
            {value}
            <span className="ml-1 text-sm font-bold text-mist">{unit}</span>
          </button>
        )}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(event) => {
          onChange(Number(event.target.value));
          onCommit();
        }}
        aria-label={label}
        className="gf-slider-neon mt-1 w-full"
      />
    </div>
  );
}
