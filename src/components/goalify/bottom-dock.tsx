"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Apple, House, TrendingUp } from "lucide-react";

// Settings uses the literal ⚙️ emoji glyph instead of a Lucide icon, on
// request — the other three tabs stay vector icons.
const NAV = [
  { href: "/home", label: "Home", Icon: House },
  { href: "/nutrition", label: "Nutrition", Icon: Apple },
  { href: "/progress", label: "Progress", Icon: TrendingUp },
  { href: "/settings", label: "Settings", Icon: null },
] as const;

export function BottomDock() {
  const pathname = usePathname();
  const activeIndex = Math.max(
    0,
    NAV.findIndex((item) => pathname.startsWith(item.href)),
  );

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
    >
      <div className="gf-glass gf-glass-deep relative flex w-full max-w-md items-center gap-1 rounded-full p-2">
        {/* Sliding highlight — the dock's "dynamic" element. */}
        <span
          className="absolute top-2 bottom-2 rounded-full bg-electric/10 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            width: `calc((100% - 1rem) / ${NAV.length})`,
            left: `calc(0.5rem + (100% - 1rem) / ${NAV.length} * ${activeIndex})`,
          }}
          aria-hidden
        />
        {NAV.map(({ href, label, Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={clsx(
                "relative z-10 flex flex-1 flex-col items-center gap-1 rounded-full py-2.5",
                "transition-colors duration-300",
                active ? "text-electric" : "text-mist hover:text-ink-soft",
              )}
            >
              {Icon ? (
                <Icon
                  className={clsx(
                    "size-5 transition-transform duration-300",
                    active && "-translate-y-0.5 scale-110",
                  )}
                  strokeWidth={active ? 2.6 : 2}
                />
              ) : (
                <span
                  className={clsx(
                    "text-lg leading-none transition-transform duration-300",
                    active && "-translate-y-0.5 scale-110",
                  )}
                  aria-hidden
                >
                  ⚙️
                </span>
              )}
              <span className="text-[10px] font-bold tracking-tight">
                {label}
              </span>
              {active && (
                <span className="absolute -bottom-0 size-1 rounded-full bg-lime-neon shadow-[0_0_8px_var(--color-lime-neon)]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
