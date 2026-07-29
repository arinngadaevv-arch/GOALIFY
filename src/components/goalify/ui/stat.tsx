import clsx from "clsx";

export function Stat({
  value,
  label,
  suffix,
  tone = "ink",
  className,
}: {
  value: string | number;
  label: string;
  suffix?: string;
  tone?: "ink" | "electric" | "lime";
  className?: string;
}) {
  return (
    <div className={clsx("text-center", className)}>
      <p
        className={clsx(
          "gf-numeric text-2xl font-extrabold",
          tone === "electric" && "text-electric",
          tone === "lime" && "text-lime-deep",
          tone === "ink" && "text-ink",
        )}
      >
        {value}
        {suffix && (
          <span className="ml-0.5 text-sm font-bold opacity-60">{suffix}</span>
        )}
      </p>
      <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-mist">
        {label}
      </p>
    </div>
  );
}

export function Pill({
  children,
  tone = "electric",
  className,
}: {
  children: React.ReactNode;
  tone?: "electric" | "lime" | "neutral";
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5",
        "text-[11px] font-bold uppercase tracking-[0.1em]",
        tone === "electric" && "bg-electric/10 text-electric",
        tone === "lime" && "bg-lime-neon/18 text-lime-deep",
        tone === "neutral" && "bg-ink/6 text-ink-soft",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-electric">
            {eyebrow}
          </p>
        )}
        <h2 className="gf-display text-xl font-extrabold text-ink">{title}</h2>
      </div>
      {action}
    </div>
  );
}
