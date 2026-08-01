import Link from "next/link";
import clsx from "clsx";

type Variant = "electric" | "lime" | "glass" | "ghost" | "cyber";
type Size = "sm" | "md" | "lg" | "xl";

const VARIANTS: Record<Variant, string> = {
  electric:
    "bg-electric text-white gf-glow-electric hover:bg-[#0047db] hover:shadow-[0_18px_40px_-10px_rgba(0,82,255,0.72)] focus-visible:outline-electric",
  lime: "bg-lime-neon text-ink gf-glow-lime hover:bg-[#2ef00c] hover:shadow-[0_18px_40px_-10px_rgba(57,255,20,0.68)] focus-visible:outline-lime-deep",
  glass:
    "gf-glass text-ink hover:border-electric/40 hover:shadow-[0_18px_36px_-16px_rgba(8,22,66,0.38)] focus-visible:outline-electric",
  ghost:
    "text-ink-soft hover:text-electric hover:bg-electric/6 focus-visible:outline-electric",
  cyber:
    "bg-gradient-to-r from-[#f0c14b] to-[#c8890f] text-[#1a1100] shadow-[0_0_0_1px_rgba(232,179,44,0.6),0_18px_44px_-10px_rgba(232,179,44,0.8)] hover:shadow-[0_0_0_1px_rgba(232,179,44,0.85),0_24px_54px_-8px_rgba(232,179,44,1)] focus-visible:outline-[#e8b32c]",
};

const SIZES: Record<Size, string> = {
  sm: "h-10 px-4 text-sm",
  md: "h-12 px-6 text-sm",
  lg: "h-14 px-8 text-base",
  xl: "h-16 px-10 text-lg",
};

function classes(
  variant: Variant,
  size: Size,
  pulse: boolean,
  fullWidth: boolean,
  className?: string,
) {
  return clsx(
    "inline-flex items-center justify-center gap-2.5 rounded-full font-bold tracking-tight",
    "gf-press transition-all duration-200 select-none hover:-translate-y-0.5",
    "focus-visible:outline-2 focus-visible:outline-offset-3",
    "disabled:opacity-40 disabled:pointer-events-none",
    VARIANTS[variant],
    SIZES[size],
    pulse && "gf-anim-pulse",
    fullWidth && "w-full",
    className,
  );
}

type SharedProps = {
  variant?: Variant;
  size?: Size;
  pulse?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
  className?: string;
};

export function GlowButton({
  variant = "electric",
  size = "md",
  pulse = false,
  fullWidth = false,
  className,
  children,
  ...rest
}: SharedProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={classes(variant, size, pulse, fullWidth, className)}
      {...rest}
    >
      {children}
    </button>
  );
}

export function GlowLink({
  variant = "electric",
  size = "md",
  pulse = false,
  fullWidth = false,
  className,
  children,
  href,
  ...rest
}: SharedProps &
  Omit<React.ComponentProps<typeof Link>, "className" | "children">) {
  return (
    <Link
      href={href}
      className={classes(variant, size, pulse, fullWidth, className)}
      {...rest}
    >
      {children}
    </Link>
  );
}
