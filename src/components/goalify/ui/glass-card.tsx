import clsx from "clsx";

type Tone = "plain" | "electric" | "lime";

export function GlassCard({
  children,
  className,
  tone = "plain",
  deep = false,
  interactive = false,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & {
  tone?: Tone;
  deep?: boolean;
  interactive?: boolean;
}) {
  return (
    <div
      className={clsx(
        "gf-glass rounded-glass",
        deep && "gf-glass-deep",
        tone === "electric" && "gf-glass-electric",
        tone === "lime" && "gf-glass-lime",
        interactive && "gf-lift gf-press cursor-pointer",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
