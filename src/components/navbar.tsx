"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Logo } from "@/components/logo";
import { LayoutDashboard, LogOut } from "lucide-react";

export function Navbar() {
  const { status } = useSession();

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-6 text-sm text-muted md:flex">
          <Link href="/#features" className="hover:text-foreground transition-colors">
            יכולות
          </Link>
          <Link href="/pricing" className="hover:text-foreground transition-colors">
            מחירים
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          {status === "authenticated" ? (
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
      </div>
    </header>
  );
}
