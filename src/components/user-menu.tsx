"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { LogOut, User } from "lucide-react";

export function UserMenu({
  name,
  email,
}: {
  name?: string | null;
  email?: string | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="grid size-9 place-items-center rounded-full bg-surface-2 text-muted transition-colors hover:text-foreground"
      >
        <User className="size-4" />
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 z-50 mt-2 w-56 rounded-xl border border-border bg-surface p-2 shadow-xl">
            <div className="px-2 py-1.5">
              <p className="truncate text-sm font-medium">{name || "משתמש"}</p>
              <p className="truncate text-xs text-muted">{email}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="mt-1 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10"
            >
              <LogOut className="size-4" />
              התנתקות
            </button>
          </div>
        </>
      )}
    </div>
  );
}
