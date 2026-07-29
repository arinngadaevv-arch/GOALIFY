"use client";

import clsx from "clsx";

export function Toggle({
  checked,
  onChange,
  label,
  description,
  icon,
  tone = "electric",
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  tone?: "electric" | "lime";
}) {
  return (
    <label className="flex cursor-pointer items-center gap-4 py-3.5">
      {icon && (
        <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-electric/8 text-electric">
          {icon}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-ink">{label}</span>
        {description && (
          <span className="mt-0.5 block text-xs leading-snug text-mist">
            {description}
          </span>
        )}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={clsx(
          "relative h-7 w-12 shrink-0 rounded-full transition-colors duration-300",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-electric",
          checked
            ? tone === "lime"
              ? "bg-lime-neon gf-glow-lime"
              : "bg-electric gf-glow-electric"
            : "bg-ink/12",
        )}
      >
        <span
          className={clsx(
            "absolute top-1 size-5 rounded-full bg-white shadow-md transition-all duration-300",
            checked ? "left-6" : "left-1",
          )}
        />
      </button>
    </label>
  );
}
