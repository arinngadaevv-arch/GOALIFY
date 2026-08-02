"use client";

import { useCallback, useRef, useState } from "react";
import { fireBurst } from "./particle-burst";

const TRACK_TOP = 44;
const TRACK_H = 14;
const THUMB_SIZE = 52;
const THUMB_TOP = TRACK_TOP + TRACK_H / 2 - THUMB_SIZE / 2;

/** Ruler tick marks across the full width — every 5th one reads taller and
 * brighter, purely decorative (the drag math below is a plain linear
 * position-to-value map, not a scrolling wheel). */
const TICK_COUNT = 41;
const TICKS = Array.from({ length: TICK_COUNT }, (_, i) => i % 5 === 0);

/**
 * A bold, wide horizontal ruler/slider — the tactile replacement for the
 * old circular tachometer gauge. Drag anywhere across the full-width band
 * (not just the thumb) to scrub the value; a big glowing number sits above
 * it so the selected weight is always the loudest thing on screen.
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
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const lastValue = useRef(value);

  const ratio = Math.min(1, Math.max(0, (value - min) / (max - min)));

  const updateFromClientX = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const rawRatio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      const raw = min + rawRatio * (max - min);
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
    fireBurst(event.clientX, event.clientY);
  };

  const nudge = (delta: number) => {
    const clamped = Math.min(max, Math.max(min, value + delta));
    if (clamped !== value) {
      lastValue.current = clamped;
      onChange(clamped);
      onTick();
    }
  };

  const startEditing = () => {
    if (disabled) return;
    setDraft(String(value));
    setEditing(true);
  };

  const commitEdit = () => {
    const trimmed = draft.trim();
    if (trimmed !== "") {
      const parsed = Number(trimmed);
      if (!Number.isNaN(parsed)) {
        const stepped = Math.round(parsed / step) * step;
        const clamped = Math.min(max, Math.max(min, stepped));
        if (clamped !== value) {
          lastValue.current = clamped;
          onChange(clamped);
          onTick();
        }
      }
    }
    setEditing(false);
  };

  return (
    <div className="select-none">
      <div className="text-center">
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
            onBlur={commitEdit}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.currentTarget.blur();
              if (event.key === "Escape") setEditing(false);
            }}
            aria-label={`${unit} value (exact)`}
            className="gf-numeric mx-auto block w-56 rounded-2xl border border-electric/50 bg-black/30 px-4 py-1 text-center text-7xl leading-none font-black text-electric outline-none"
          />
        ) : (
          <button
            type="button"
            onClick={startEditing}
            disabled={disabled}
            aria-label={`Edit ${unit} value directly`}
            className="gf-numeric gf-cyber-glow-text gf-press text-7xl leading-none font-black tracking-tight underline decoration-electric/40 decoration-dotted underline-offset-8 disabled:pointer-events-none"
          >
            {value}
            <span className="ml-2 text-2xl font-bold text-mist">{unit}</span>
          </button>
        )}
      </div>

      <div
        ref={trackRef}
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-disabled={disabled}
        className="relative mt-7 h-24 touch-none rounded-2xl outline-none focus-visible:shadow-[0_0_0_3px_rgba(255,199,0,0.4)]"
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
        {/* Ruler tick marks. */}
        <div className="pointer-events-none absolute inset-x-1 top-0 flex h-7 items-end justify-between">
          {TICKS.map((major, i) => (
            <span
              key={i}
              className="w-px rounded-full bg-haze"
              style={{ height: major ? 22 : 11, opacity: major ? 0.55 : 0.25 }}
            />
          ))}
        </div>

        {/* Track. */}
        <div
          className="absolute inset-x-0 overflow-hidden rounded-full bg-ink/10"
          style={{ top: TRACK_TOP, height: TRACK_H }}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#ffc700] to-[#ffe27a]"
            style={{
              width: `${ratio * 100}%`,
              boxShadow: "0 0 18px -2px rgba(255, 199, 0, 0.75)",
            }}
          />
        </div>

        {/* Thumb — large, glowing, easy to grab on mobile. */}
        <div
          className="pointer-events-none absolute rounded-full transition-transform duration-150 ease-out"
          style={{
            top: THUMB_TOP,
            left: `${ratio * 100}%`,
            width: THUMB_SIZE,
            height: THUMB_SIZE,
            transform: `translateX(-50%) scale(${dragging ? 1.12 : 1})`,
            background: "radial-gradient(circle at 35% 30%, #fff3c9 0%, #ffc700 45%, #7a4d0f 100%)",
            border: "3px solid #ffc700",
            boxShadow:
              "0 0 0 2px rgba(255, 199, 0, 0.5), 0 0 22px -2px rgba(255, 199, 0, 0.95)",
          }}
        />
      </div>

      <div className="mt-1 flex justify-between px-1 text-xs font-semibold text-haze">
        <span>
          {min} {unit}
        </span>
        <span>
          {max} {unit}
        </span>
      </div>
    </div>
  );
}
