import webpush from "web-push";

/**
 * Server-side Web Push — the delivery mechanism behind
 * api/cron/streak-reminder. Unlike Meta/Resend, this needs no third-party
 * account: VAPID keys are a self-generated key pair (see .env.example),
 * and `webpush.sendNotification` talks directly to whichever push service
 * the browser's own subscription points at (Google's for Chrome, Mozilla's
 * for Firefox, Apple's for Safari, etc.) — there's nothing to sign up for.
 *
 * No-op (returns a clear "not configured" result rather than throwing)
 * whenever the VAPID env vars aren't set, matching the same "safe to
 * leave unset" contract meta-capi.ts and email.ts already use.
 */
export type PushSubscriptionRecord = {
  endpoint: string;
  p256dh: string;
  auth: string;
};

export function pushConfig(): { vapidConfigured: boolean } {
  return {
    vapidConfigured: Boolean(
      process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY,
    ),
  };
}

type SendResult =
  | { ok: true }
  | { ok: false; error: string; statusCode?: number };

/**
 * A 404/410 from the push service means that specific subscription is
 * dead (the user uninstalled, cleared site data, or the browser expired
 * it) — that's the one failure callers should act on by deleting the row,
 * distinguished here from every other failure (network blip, bad VAPID
 * config, payload too large) which is just "didn't send this time."
 */
export function isExpiredSubscriptionError(result: SendResult): boolean {
  return !result.ok && (result.statusCode === 404 || result.statusCode === 410);
}

export async function sendPushNotification(
  subscription: PushSubscriptionRecord,
  payload: { title: string; body: string; url?: string },
): Promise<SendResult> {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:support@goalify.app";

  if (!publicKey || !privateKey) {
    return { ok: false, error: "VAPID keys are not set." };
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);

  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: { p256dh: subscription.p256dh, auth: subscription.auth },
      },
      JSON.stringify(payload),
    );
    return { ok: true };
  } catch (err) {
    const statusCode =
      typeof err === "object" && err !== null && "statusCode" in err
        ? (err as { statusCode?: number }).statusCode
        : undefined;
    return {
      ok: false,
      error: err instanceof Error ? `${err.name}: ${err.message}` : String(err),
      statusCode,
    };
  }
}
