"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Logo } from "@/components/logo";
import { LayoutDashboard, LogOut, Menu, X } from "lucide-react";

export function Navbar() {
  const { status } = useSession();
  const [open, setOpen] = useState(false);
  const authed = status === "authenticated";

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Logo />

        <nav className="hidden items-center gap-6 text-sm text-muted md:flex">
          <Link href="/#features" className="hover:text-foreground transition-colors">
            יכולות
          </Link>
          <Link href="/pricing" className="hover:text-foreground transition-colors">
            מחירים
          </Link>
        </nav>

        {/* Desktop auth actions */}
        <div className="hidden items-center gap-3 md:flex">
          {authed ? (
            <>
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-foreground hover:bg-surface transition-colors"
              >
                <LayoutDashboard className="size-4" />
                דשבורד
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-muted hover:text-foreground transition-colors"
                aria-label="התנתקות"
              >
                <LogOut className="size-4" />
              </button>
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="rounded-full px-4 py-2 text-sm font-medium text-muted hover:text-foreground transition-colors"
              >
                התחברות
              </Link>
              <Link
                href="/sign-up"
                className="rounded-full gradient-brand px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-pink-500/20 hover:opacity-90 transition-opacity"
              >
                התחילו בחינם
              </Link>
            </>
          )}
        </div>

        {/* Mobile trigger */}
        <button
          onClick={() => setOpen((o) => !o)}
          className="grid size-9 place-items-center rounded-full text-foreground hover:bg-surface transition-colors md:hidden"
          aria-label={open ? "סגירת תפריט" : "פתיחת תפריט"}
          aria-expanded={open}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-border bg-background/95 px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1 text-sm">
            <Link
              href="/#features"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-muted hover:bg-surface hover:text-foreground"
            >
              יכולות
            </Link>
            <Link
              href="/pricing"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-muted hover:bg-surface hover:text-foreground"
            >
              מחירים
            </Link>

            <div className="my-2 h-px bg-border" />

            {authed ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 font-medium text-foreground hover:bg-surface"
                >
                  <LayoutDashboard className="size-4" />
                  לדשבורד
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-red-400 hover:bg-red-500/10"
                >
                  <LogOut className="size-4" />
                  התנתקות
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 font-medium text-foreground hover:bg-surface"
                >
                  התחברות
                </Link>
                <Link
                  href="/sign-up"
                  onClick={() => setOpen(false)}
                  className="mt-1 rounded-full gradient-brand px-3 py-2.5 text-center font-semibold text-white"
                >
                  התחילו בחינם
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
