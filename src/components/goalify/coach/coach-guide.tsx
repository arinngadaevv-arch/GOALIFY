"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import clsx from "clsx";
import { MessageSquare, X } from "lucide-react";
import { COACH } from "@/lib/goalify/coach";
import { CoachBadge } from "./coach-bubble";

/* -------------------------------------------------------------------------
   Tiny external store so any screen can make the coach speak without having
   to thread props or context through the tree.
   ------------------------------------------------------------------------- */

type CoachSay = { message: string; at: number } | null;

let current: CoachSay = null;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

/** Push a line into the floating coach widget from anywhere in the app. */
export function sayCoach(message: string) {
  current = { message, at: Date.now() };
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => current;
const getServerSnapshot = (): CoachSay => null;

/** How long a pushed line stays up before the widget returns to idle. */
const SPEAK_MS = 4200;

/**
 * Persistent floating coach. Sits above the content on every funnel screen,
 * idles as a tappable badge, and pops open whenever the coach has something
 * to say about what the user just did.
 */
export function CoachGuide({
  idleMessage = COACH.tagline,
  autoOpen = true,
  className,
}: {
  idleMessage?: string;
  /**
   * When false the widget never pops open on its own — it just flags an
   * unread line. Used on the quiz, where the reaction is already shown
   * inline and a floating bubble would cover the answer options.
   */
  autoOpen?: boolean;
  className?: string;
}) {
  const said = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  /** Timestamp of the line whose display window has elapsed. */
  const [expired, setExpired] = useState<number | null>(null);
  /** A manual open/close, scoped to the line it was made against. */
  const [override, setOverride] = useState<{
    at: number | null;
    open: boolean;
  } | null>(null);

  // Only the auto-close is scheduled here, and it fires inside a timer
  // callback — never a synchronous setState in the effect body.
  useEffect(() => {
    if (!said) return;
    const timer = setTimeout(() => setExpired(said.at), SPEAK_MS);
    return () => clearTimeout(timer);
  }, [said]);

  const currentAt = said?.at ?? null;
  // Visibility is derived: a new line opens the bubble, its timer closes it,
  // and an explicit tap wins until the next line arrives.
  const shouldAutoOpen = autoOpen && said !== null && expired !== said.at;
  const open =
    override && override.at === currentAt ? override.open : shouldAutoOpen;

  const toggle = useCallback(() => {
    setOverride({ at: currentAt, open: !open });
  }, [currentAt, open]);

  const dismiss = useCallback(() => {
    setOverride({ at: currentAt, open: false });
  }, [currentAt]);

  const message = said?.message ?? idleMessage;

  return (
    <div
      className={clsx(
        "fixed right-4 bottom-4 z-60 flex flex-col items-end gap-2",
        "max-w-[min(20rem,calc(100vw-2rem))]",
        className,
      )}
    >
      {open && (
        <div
          key={said?.at ?? "idle"}
          className="gf-anim-slide-in gf-glass gf-glass-deep relative w-full rounded-2xl rounded-br-sm p-4"
          role="status"
          aria-live="polite"
        >
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss coach message"
            className="absolute top-2 right-2 grid size-6 place-items-center rounded-full text-mist hover:text-ink"
          >
            <X className="size-3.5" />
          </button>
          <p className="pr-5 text-[10px] font-black tracking-[0.16em] text-electric uppercase">
            {COACH.name} · live
          </p>
          <p className="mt-1 text-sm leading-snug font-bold text-ink">
            {message}
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={toggle}
        aria-label={open ? "Hide coach" : "Show coach"}
        aria-expanded={open}
        className="gf-press relative"
      >
        <CoachBadge size="lg" />
        {/* Unread nudge when the coach has spoken but the bubble is closed. */}
        {!open && (
          <span className="absolute -top-1 -left-1 grid size-5 place-items-center rounded-full bg-lime-neon shadow-[0_0_10px_#39FF14]">
            <MessageSquare className="size-2.5 text-ink" strokeWidth={3} />
          </span>
        )}
      </button>
    </div>
  );
}
