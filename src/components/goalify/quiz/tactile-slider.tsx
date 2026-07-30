"use client";

import { useCallback, useRef, useState } from "react";
import clsx from "clsx";

/**
 * A heavy, gym-plate-styled drag slider — the tactile replacement for plain
 * number inputs. Dragging the plate scrubs the value, glows the filled
 * track, and fires a "click-clack" tick every time the stepped value
 * changes (wired by the caller so it can respect the sound-effects toggle).
 */
export function TactileSlider({
  value,
  min,
  max,
  step,
  unit,
  onChange,
  onTick,
  disabled = false,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (next: number) => void;
  onTick: () => void;
  disabled?: boolean;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const lastValue = useRef(value);

  const percent = ((value - min) / (max - min)) * 100;

  const updateFromClientX = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      const raw = min + ratio * (max - min);
      const stepped = Math.round(raw / step) * step;
      const clamped = Math.min(max, Math.max(min, stepped));
      if (clamped !== lastValue.current) {
        lastValue.current = clamped;
        onChange(clamped);
        onTick();
      }
    },
    [min, max, step, onChange, onTick],
  );

  const startDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
    updateFromClientX(event.clientX);
  };

  const moveDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging || disabled) return;
    updateFromClientX(event.clientX);
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setDragging(false);
  };

  const nudge = (delta: number) => {
    const clamped = Math.min(max, Math.max(min, value + delta));
    if (clamped !== value) {
      onChange(clamped);
      onTick();
    }
  };

  return (
    <div className="select-none">
      <p className="gf-numeric text-center text-6xl font-black text-ink">
        {value}
        <span className="ml-1 text-xl font-bold text-mist">{unit}</span>
      </p>

      <div className="relative mt-10 px-6 pb-2">
        <div
          ref={trackRef}
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-disabled={disabled}
          className="relative h-3 w-full cursor-pointer touch-none rounded-full bg-ink/8"
          onPointerDown={startDrag}
          onPointerMove={moveDrag}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onKeyDown={(event) => {
            if (disabled) return;
            if (event.key === "ArrowRight" || event.key === "ArrowUp") nudge(step);
            if (event.key === "ArrowLeft" || event.key === "ArrowDown") nudge(-step);
            if (event.key === "Home") onChange(min);
            if (event.key === "End") onChange(max);
          }}
        >
          {/* Glowing fill track — the "target arc" burning toward the plate. */}
          <div
            className={clsx(
              "h-full rounded-full bg-linear-to-r from-[#22d3ee] via-[#a855f7] to-[#ff7a1a] transition-[width] duration-150",
              dragging && "shadow-[0_0_18px_rgba(168,85,247,0.65)]",
            )}
            style={{ width: `${percent}%` }}
          />

          {/* The gym plate handle. */}
          <div
            className={clsx(
              "gf-plate absolute top-1/2 grid -translate-y-1/2 place-items-center rounded-full transition-transform duration-150 ease-out",
              dragging ? "scale-[1.15]" : "scale-100",
            )}
            style={{ left: `calc(${percent}% - 26px)` }}
            aria-hidden
          >
            <span className="gf-plate-ring" />
            <span className="gf-plate-core" />
          </div>
        </div>

        <div className="mt-3 flex justify-between text-xs font-semibold text-haze">
          <span>
            {min} {unit}
          </span>
          <span>
            {max} {unit}
          </span>
        </div>
      </div>
    </div>
  );
}
