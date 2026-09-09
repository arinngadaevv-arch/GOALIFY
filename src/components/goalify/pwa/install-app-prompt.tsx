"use client";

import { useState, useSyncExternalStore } from "react";
import { Download, Share, SquarePlus, X } from "lucide-react";
import { GlowButton } from "@/components/goalify/ui/glow-button";
import { consumeInstallPromptPending } from "@/lib/goalify/install-prompt";

/** Chrome/Android's actual event shape — not in lib.dom.d.ts. */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type InstallState = {
  /** Whether a fresh signup actually asked for this banner — see
   * markInstallPromptPending. Resolved once, the first time anything
   * subscribes to the store, never on every mount. */
  eligible: boolean;
  deferredPrompt: BeforeInstallPromptEvent | null;
  platform: "android" | "ios" | null;
};

let state: InstallState = {
  eligible: false,
  deferredPrompt: null,
  platform: null,
};
let initialized = false;
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

// Module-level store instead of component state: the one-time
// localStorage read (consumeInstallPromptPending) and the
// beforeinstallprompt listener both need to survive for the lifetime of
// the tab, not just one component instance, and useSyncExternalStore's
// subscribe phase — unlike a useEffect body — is where React expects
// exactly this kind of one-time external-system wiring to happen.
function ensureInitialized() {
  if (initialized) return;
  initialized = true;

  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari's own (non-standard) flag — matchMedia never reports
    // standalone there even once the app is installed.
    (navigator as unknown as { standalone?: boolean }).standalone === true;
  const eligible = !isStandalone && consumeInstallPromptPending();
  const isIOS =
    /iphone|ipad|ipod/i.test(navigator.userAgent) && !("MSStream" in window);
  state = { eligible, deferredPrompt: null, platform: isIOS ? "ios" : null };
  if (!eligible) return;

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    state = {
      ...state,
      deferredPrompt: event as BeforeInstallPromptEvent,
      platform: "android",
    };
    notify();
  });
}

function subscribe(listener: () => void) {
  ensureInitialized();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

// A stable reference, not a fresh object literal per call — useSyncExternalStore
// compares snapshots with Object.is, so a new object every render reads as a
// perpetual store change and triggers React's "should be cached" loop warning.
const SERVER_SNAPSHOT: InstallState = {
  eligible: false,
  deferredPrompt: null,
  platform: null,
};

function getServerSnapshot() {
  return SERVER_SNAPSHOT;
}

function clearDeferredPrompt() {
  state = { ...state, deferredPrompt: null };
  notify();
}

/**
 * A one-time "install this as an app" nudge, shown right after a brand-new
 * signup (see markInstallPromptPending — the credentials form and the
 * Google new-signup branch are the only two callers) rather than on every
 * visit. Mounted once at the root layout so it survives the client-side
 * router.push from the quiz's results gate into /plan, where the flag is
 * actually consumed.
 *
 * Android/Chrome gets a real one-tap install via the captured
 * `beforeinstallprompt` event; iOS Safari never fires that event at all,
 * so it gets manual "Share → Add to Home Screen" instructions instead.
 * Desktop browsers that support neither just never show the banner — the
 * flag stays consumed either way so it can't reappear later.
 */
export function InstallAppPrompt() {
  const { eligible, deferredPrompt, platform } = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const [dismissed, setDismissed] = useState(false);

  const visible =
    eligible && !dismissed && (platform === "ios" || deferredPrompt !== null);
  if (!visible) return null;

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    clearDeferredPrompt();
  }

  return (
    <div className="gf-anim-rise fixed inset-x-4 bottom-4 z-[90] mx-auto max-w-md rounded-3xl border border-white/10 bg-[#12151d] p-4 pr-3 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.8)] sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-96">
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => setDismissed(true)}
        className="gf-press absolute top-3 right-3 grid size-7 place-items-center rounded-full bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
      >
        <X className="size-3.5" strokeWidth={2.5} />
      </button>

      <div className="flex items-start gap-3 pr-6">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#f0c14b] to-[#c8890f]">
          <Download className="size-5 text-[#1a1100]" strokeWidth={2.5} />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-black text-white">Install GOALIFY</p>
          <p className="mt-0.5 text-xs leading-relaxed text-white/60">
            {platform === "ios"
              ? "Add it to your home screen for one-tap access to your plan."
              : "Get one-tap access to your plan, right from your home screen."}
          </p>
        </div>
      </div>

      {platform === "ios" ? (
        <div className="mt-3.5 flex items-center gap-2 rounded-2xl bg-white/5 px-3.5 py-3 text-xs font-semibold text-white/75">
          <span className="inline-flex items-center gap-1">
            Tap <Share className="size-3.5 text-[#FFC700]" strokeWidth={2.4} />
          </span>
          <span>then</span>
          <span className="inline-flex items-center gap-1">
            <SquarePlus className="size-3.5 text-[#FFC700]" strokeWidth={2.4} />
            Add to Home Screen
          </span>
        </div>
      ) : (
        <GlowButton
          type="button"
          variant="cyber"
          size="sm"
          fullWidth
          className="mt-3.5"
          onClick={handleInstall}
        >
          Install app
        </GlowButton>
      )}
    </div>
  );
}
