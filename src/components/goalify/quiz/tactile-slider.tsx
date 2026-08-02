"use client";

import { useCallback, useRef, useState } from "react";
import { fireBurst } from "./particle-burst";

/** Gauge geometry — a 230° sweep open at the bottom, tachometer-style. */
const VIEW_W = 280;
const VIEW_H = 220;
const CX = 140;
const CY = 140;
const R = 104;
const STROKE = 16;
const MIN_ANGLE = -115;
const MAX_ANGLE = 115;
const SWEEP = MAX_ANGLE - MIN_ANGLE;

/** 0° = straight up, positive = clockwise — matches the drag-angle math below. */
function pointAt(angleDeg: number, radius: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: CX + radius * Math.cos(rad), y: CY + radius * Math.sin(rad) };
}

function polarToCartesian(angleDeg: number) {
  return pointAt(angleDeg, R);
}

function describeArc(startAngle: number, endAngle: number) {
  if (endAngle - startAngle < 0.5) return "";
  const start = polarToCartesian(startAngle);
  const end = polarToCartesian(endAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${R} ${R} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
}

/**
 * A tachometer-style arc gauge — the tactile replacement for plain number
 * inputs. Dragging anywhere on the dial scrubs the value along the arc,
 * glows the filled sweep, and fires a "click-clack" tick every time the
 * stepped value changes (wired by the caller so it can respect the
 * sound-effects toggle).
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
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState(false);
  const lastValue = useRef(value);

  const ratio = Math.min(1, Math.max(0, (value - min) / (max - min)));
  const valueAngle = MIN_ANGLE + ratio * SWEEP;

  const updateFromClientPoint = useCallback(
    (clientX: number, clientY: number) => {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const centerX = rect.left + (CX / VIEW_W) * rect.width;
      const centerY = rect.top + (CY / VIEW_H) * rect.height;
      const dx = clientX - centerX;
      const dy = clientY - centerY;
      const angle = (Math.atan2(dx, -dy) * 180) / Math.PI;
      const clampedAngle = Math.min(MAX_ANGLE, Math.max(MIN_ANGLE, angle));
      const rawRatio = (clampedAngle - MIN_ANGLE) / SWEEP;
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

  const startDrag = (event: React.PointerEvent<SVGSVGElement>) => {
    if (disabled) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
    updateFromClientPoint(event.clientX, event.clientY);
  };

  const moveDrag = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!dragging || disabled) return;
    updateFromClientPoint(event.clientX, event.clientY);
  };

  const endDrag = (event: React.PointerEvent<SVGSVGElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setDragging(false);
    fireBurst(event.clientX, event.clientY);
  };

  const nudge = (delta: number) => {
    const clamped = Math.min(max, Math.max(min, value + delta));
    if (clamped !== value) {
      onChange(clamped);
      onTick();
    }
  };

  const trackPath = describeArc(MIN_ANGLE, MAX_ANGLE);
  const fillPath = describeArc(MIN_ANGLE, valueAngle);
  const handlePos = polarToCartesian(valueAngle);

  return (
    <div className="select-none">
      <div className="relative mx-auto w-full max-w-[300px]">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          // The browser's default focus outline is a stark rectangle
          // hugging the SVG's full bounding box — jarring against the round
          // gauge. Swap it for the same gold glow the linear sliders use.
          className="w-full touch-none rounded-2xl outline-none focus-visible:shadow-[0_0_0_3px_rgba(255,199,0,0.4)]"
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-disabled={disabled}
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
          {/* Tick marks around the sweep. */}
          {Array.from({ length: 13 }, (_, i) => {
            const angle = MIN_ANGLE + (i / 12) * SWEEP;
            const inner = pointAt(angle, R - STROKE / 2 - 16);
            const outer = pointAt(angle, R - STROKE / 2 - 6);
            return (
              <line
                key={i}
                x1={inner.x}
                y1={inner.y}
                x2={outer.x}
                y2={outer.y}
                stroke="var(--color-haze)"
                strokeWidth={2}
                opacity={0.35}
              />
            );
          })}

          <defs>
            {/* Flaming energy track — gold at the low end, crimson at the
                high end, so the fill itself reads as "heat" rising with
                the value rather than a flat brand-color bar. */}
            <linearGradient
              id="gf-flame-track"
              gradientUnits="userSpaceOnUse"
              x1={pointAt(MIN_ANGLE, R).x}
              y1={pointAt(MIN_ANGLE, R).y}
              x2={pointAt(MAX_ANGLE, R).x}
              y2={pointAt(MAX_ANGLE, R).y}
            >
              <stop offset="0%" stopColor="#ffc700" />
              <stop offset="100%" stopColor="#ff3b30" />
            </linearGradient>
            {/* Metallic kettlebell body — bright rim light fading to a
                dark core, like brushed cast iron. */}
            <radialGradient id="gf-kettlebell-body" cx="35%" cy="30%" r="75%">
              <stop offset="0%" stopColor="#fff3c9" />
              <stop offset="45%" stopColor="#e8b32c" />
              <stop offset="100%" stopColor="#7a4d0f" />
            </radialGradient>
          </defs>

          {/* Background track. */}
          <path
            d={trackPath}
            fill="none"
            stroke="var(--color-ink)"
            strokeOpacity={0.08}
            strokeWidth={STROKE}
            strokeLinecap="round"
          />
          {/* Filled progress. */}
          <path
            d={fillPath}
            fill="none"
            stroke="url(#gf-flame-track)"
            strokeWidth={STROKE}
            strokeLinecap="round"
            className="gf-cyber-gauge-fill"
          />

          {/* The drag handle — a small kettlebell silhouette (handle loop
              + bell body) in place of a plain dot, metallic-shaded. */}
          <g
            className="gf-cyber-gauge-handle transition-transform duration-150 ease-out"
            style={{
              transform: dragging ? "scale(1.12)" : "scale(1)",
              transformOrigin: `${handlePos.x}px ${handlePos.y}px`,
            }}
          >
            <ellipse
              cx={handlePos.x}
              cy={handlePos.y - 15}
              rx={7}
              ry={9}
              fill="none"
              stroke="#d8d8de"
              strokeWidth={3.5}
            />
            <circle cx={handlePos.x} cy={handlePos.y} r={17} fill="var(--color-canvas)" />
            <circle cx={handlePos.x} cy={handlePos.y} r={17} fill="url(#gf-kettlebell-body)" />
            <circle
              cx={handlePos.x}
              cy={handlePos.y}
              r={17}
              fill="none"
              stroke="#ff3b30"
              strokeWidth={2}
            />
          </g>
        </svg>

        {/* Big numeric readout sits inside the gauge's open mouth. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-2 text-center">
          <p className="gf-numeric gf-cyber-glow-text text-5xl font-black">
            {value}
            <span className="ml-1 text-lg font-bold text-mist">{unit}</span>
          </p>
        </div>
      </div>

      <div className="mt-1 flex justify-between px-4 text-xs font-semibold text-haze">
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
