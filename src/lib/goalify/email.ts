import { Resend } from "resend";

/**
 * The one place this app sends transactional email — used today only by
 * api/cron/checkout-reminder. Uses Resend when RESEND_API_KEY is set;
 * otherwise the email is printed to the server console instead of sent,
 * exactly the contract .env.example already documents (so local dev and
 * any deploy without a Resend key still exercise this code path without
 * ever actually emailing anyone).
 */
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "GOALIFY <noreply@yourdomain.com>";

  if (!apiKey) {
    console.log(
      `[email] RESEND_API_KEY not set — would have sent to ${to}: "${subject}"`,
    );
    return;
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({ from, to, subject, html });
  if (error) {
    // Never throw — a failed send for one user shouldn't take down a batch
    // job processing many. Callers log which user this was for.
    console.error(`[email] Resend rejected send to ${to}:`, error);
  }
}
