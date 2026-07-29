import Link from "next/link";
import clsx from "clsx";

type Variant = "electric" | "lime" | "glass" | "ghost";
type Size = "sm" | "md" | "lg" | "xl";

const VARIANTS: Record<Variant, string> = {
  electric:
    "bg-electric text-white gf-glow-electric hover:bg-[#0047db] focus-visible:outline-electric",
  lime: "bg-lime-neon text-ink gf-glow-lime hover:bg-[#2ef00c] focus-visible:outline-lime-deep",
  glass:
    "gf-glass text-ink hover:border-electric/40 focus-visible:outline-electric",
  ghost:
    "text-ink-soft hover:text-electric hover:bg-electric/6 focus-visible:outline-electric",
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
    "gf-press transition-colors duration-200 select-none",
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
