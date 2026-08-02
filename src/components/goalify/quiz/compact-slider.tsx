"use client";

/**
 * A dense, single-row slider for screens that need several numeric inputs
 * at once (see vitals-step.tsx) — native `<input type="range">` under the
 * hood so drag, keyboard and touch all come for free, styled to match the
 * quiz's neon accent via .gf-slider-neon in goalify.css.
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
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-black tracking-[0.1em] text-mist uppercase">
          {label}
        </span>
        <span className="gf-numeric gf-cyber-glow-text text-2xl font-black">
          {value}
          <span className="ml-1 text-sm font-bold text-mist">{unit}</span>
        </span>
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
