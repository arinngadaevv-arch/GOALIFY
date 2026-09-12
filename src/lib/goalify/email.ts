import { Resend } from "resend";

const DEFAULT_FROM = "GOALIFY <noreply@yourdomain.com>";

/**
 * The one place this app sends transactional email — used today by
 * api/cron/checkout-reminder, and by the admin diagnostics route below.
 * Uses Resend when RESEND_API_KEY is set; otherwise the email is printed
 * to the server console instead of sent, exactly the contract
 * .env.example already documents (so local dev and any deploy without a
 * Resend key still exercise this code path without ever actually
 * emailing anyone).
 */
type SendResult = { ok: true } | { ok: false; error: string };

/** `EMAIL_FROM` still equal to the literal placeholder this repo ships in
 * .env.example — Resend will reject every send while it's set to this,
 * since "yourdomain.com" was never verified. Surfaced in the admin
 * diagnostics panel so that specific, easy-to-miss mistake shows up by
 * name instead of just as an opaque rejection. */
export function emailConfig(): {
  resendConfigured: boolean;
  from: string;
  fromIsPlaceholder: boolean;
} {
  const from = process.env.EMAIL_FROM || DEFAULT_FROM;
  return {
    resendConfigured: Boolean(process.env.RESEND_API_KEY),
    from,
    fromIsPlaceholder: from.includes("yourdomain.com"),
  };
}

async function trySend({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "RESEND_API_KEY is not set." };
  }

  const from = process.env.EMAIL_FROM || DEFAULT_FROM;
  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({ from, to, subject, html });
  if (error) {
    return { ok: false, error: JSON.stringify(error) };
  }
  return { ok: true };
}

export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const result = await trySend(params);
  if (!result.ok) {
    // Never throw — a failed send for one user shouldn't take down a batch
    // job processing many (see api/cron/checkout-reminder). If
    // RESEND_API_KEY simply isn't set, this is the "printed to console"
    // fallback the env var's own docs promise, not a real failure.
    if (result.error === "RESEND_API_KEY is not set.") {
      console.log(
        `[email] RESEND_API_KEY not set — would have sent to ${params.to}: "${params.subject}"`,
      );
    } else {
      console.error(`[email] Send to ${params.to} failed:`, result.error);
    }
  }
}

/** Fires a real test send — owner-only, from admin/email-diagnostics/
 * route.ts — so the admin can confirm Resend is actually wired up (right
 * API key, a `from` address on a domain that's actually verified) by
 * sending themselves one email, instead of waiting for the daily cron to
 * either work or silently not. */
export function sendTestEmail(to: string): Promise<SendResult> {
  return trySend({
    to,
    subject: "GOALIFY test email",
    html: "<p>If you're reading this, Resend is wired up correctly.</p>",
  });
}
