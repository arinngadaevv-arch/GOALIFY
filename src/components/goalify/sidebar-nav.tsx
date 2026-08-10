"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { Brand } from "./brand";
import { NAV_ITEMS as NAV } from "./nav-items";

/**
 * Desktop counterpart to BottomDock — a persistent left rail, shown only
 * at `lg+` (BottomDock covers everything below that). Same four
 * destinations, same active-state logic, just laid out vertically with
 * room to actually show labels next to icons instead of stacked under
 * them.
 */
export function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-white/8 px-5 py-8 lg:flex">
      <Brand className="mb-10" />

      <nav aria-label="Primary" className="flex flex-col gap-1">
        {NAV.map(({ href, label, Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={clsx(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-colors duration-200",
                active
                  ? "gf-glass text-electric"
                  : "text-mist hover:text-ink-soft",
              )}
            >
              {Icon ? (
                <Icon className="size-5 shrink-0" strokeWidth={active ? 2.6 : 2} />
              ) : (
                <span className="text-lg leading-none" aria-hidden>
                  ⚙️
                </span>
              )}
              {label}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={() => void signOut({ callbackUrl: "/" })}
        className="mt-auto flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-mist transition-colors duration-200 hover:text-ink-soft"
      >
        <LogOut className="size-5 shrink-0" />
        Sign out
      </button>
    </aside>
  );
}
