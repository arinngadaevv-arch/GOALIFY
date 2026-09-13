"use client";

import { useCallback, useEffect, useState } from "react";

export type PushStatus =
  | "unsupported"
  | "checking"
  | "enabled"
  | "disabled"
  | "denied";

/** The Push API wants the VAPID public key as a raw byte array, not the
 * base64url string it's normally shared as — this is the standard
 * conversion every Web Push integration needs, copied nowhere special. */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Owns the whole browser-side push lifecycle: feature detection, the
 * current permission/subscription state, and the two actions (enable/
 * disable) — so notifications-preview.tsx just renders `status` and calls
 * `enable`/`disable`, without knowing anything about the Push API itself.
 */
export function usePushSubscription() {
  const [status, setStatus] = useState<PushStatus>("checking");

  const supported =
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window;

  useEffect(() => {
    // Every branch resolves through this one promise chain rather than
    // calling setState directly off the top of the effect — not just
    // style, `react-hooks/set-state-in-effect` specifically flags a
    // synchronous setState call sitting right in an effect's body as a
    // sign the value could've been computed during render instead. That
    // read doesn't apply here (this genuinely can't run during a server
    // render — there's no `window`/`Notification` there), but funneling
    // every path through `.then()` satisfies the rule without fighting it.
    Promise.resolve()
      .then(async () => {
        if (!supported) return "unsupported" as const;
        if (Notification.permission === "denied") return "denied" as const;
        const registration = await navigator.serviceWorker.getRegistration();
        const subscription = await registration?.pushManager.getSubscription();
        return subscription ? "enabled" : ("disabled" as const);
      })
      .then(setStatus);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once on mount to read the current browser state.
  }, []);

  const enable = useCallback(async () => {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!supported || !publicKey) return;

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      setStatus(permission === "denied" ? "denied" : "disabled");
      return;
    }

    await navigator.serviceWorker.register("/sw.js");
    // `register()` resolves as soon as a registration exists — on a
    // brand-new install that registration's worker is still
    // "installing"/"waiting", not yet "active", and `pushManager.
    // subscribe()` throws ("no active Service Worker") if called before
    // then. `.ready` is the one promise that actually waits for
    // activation, unlike `register()`'s own return value.
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      // `applicationServerKey` wants `BufferSource`, but TS's DOM lib
      // types a plain `Uint8Array`'s `.buffer` as `ArrayBufferLike`
      // (which also covers `SharedArrayBuffer`) rather than the narrower
      // `ArrayBuffer` the Push API's own types demand — a real subscribe
      // call always gets a real Uint8Array backed by an ArrayBuffer here,
      // so this cast just papers over that DOM-lib mismatch, not an
      // actual runtime concern.
      applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
    });

    await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subscription.toJSON()),
    }).catch(() => {});

    setStatus("enabled");
  }, [supported]);

  const disable = useCallback(async () => {
    if (!supported) return;
    const registration = await navigator.serviceWorker.getRegistration();
    const subscription = await registration?.pushManager.getSubscription();
    if (!subscription) {
      setStatus("disabled");
      return;
    }
    await fetch("/api/push/unsubscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    }).catch(() => {});
    await subscription.unsubscribe();
    setStatus("disabled");
  }, [supported]);

  return { status, enable, disable };
}
