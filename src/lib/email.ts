/**
 * Minimal email sender. Uses the Resend REST API when RESEND_API_KEY is set,
 * otherwise logs the message to the server console so local development and
 * preview environments work without an email provider.
 *
 * Resend is called over plain fetch (no SDK dependency, no Node-version
 * coupling) and is fully production-ready.
 */

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

const RESEND_ENDPOINT = "https://api.resend.com/emails";

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: SendEmailInput): Promise<{ delivered: boolean }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "TrendSpark AI <onboarding@resend.dev>";

  if (!apiKey) {
    // Dev / preview fallback: surface the email in the server logs.
    console.info(
      `\n[email:dev] No RESEND_API_KEY set - email not sent.\n  to: ${to}\n  subject: ${subject}\n  text: ${text ?? "(html only)"}\n`
    );
    return { delivered: false };
  }

  const res = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html, text }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Resend send failed (${res.status}): ${detail}`);
  }

  return { delivered: true };
}

export function passwordResetEmail(resetUrl: string): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = "איפוס סיסמה - TrendSpark AI";
  const text = `קיבלנו בקשה לאיפוס הסיסמה שלך ב-TrendSpark AI.\nלאיפוס הסיסמה היכנס לקישור הבא (בתוקף לשעה):\n${resetUrl}\n\nאם לא ביקשת לאפס סיסמה, אפשר להתעלם מהודעה זו.`;

  const html = `<!doctype html>
<html lang="he" dir="rtl">
  <body style="margin:0;background:#0a0a12;font-family:Arial,'Segoe UI',sans-serif;color:#f5f5fa;">
    <div style="max-width:480px;margin:0 auto;padding:32px 24px;">
      <div style="font-size:20px;font-weight:800;margin-bottom:24px;">
        Trend<span style="color:#a855f7;">Spark</span> AI
      </div>
      <div style="background:#12121e;border:1px solid #262636;border-radius:16px;padding:24px;">
        <h1 style="font-size:18px;margin:0 0 12px;">איפוס סיסמה</h1>
        <p style="font-size:14px;color:#9797ad;line-height:1.6;margin:0 0 20px;">
          קיבלנו בקשה לאיפוס הסיסמה שלך. לחצו על הכפתור כדי לבחור סיסמה חדשה.
          הקישור בתוקף למשך שעה אחת.
        </p>
        <a href="${resetUrl}"
           style="display:inline-block;background:linear-gradient(135deg,#fe2c55,#a855f7 55%,#25f4ee);color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 28px;border-radius:999px;">
          איפוס הסיסמה
        </a>
        <p style="font-size:12px;color:#6b6b80;line-height:1.6;margin:20px 0 0;">
          אם לא ביקשתם לאפס סיסמה, אפשר להתעלם מהודעה זו - לא בוצע כל שינוי בחשבון.
        </p>
      </div>
    </div>
  </body>
</html>`;

  return { subject, html, text };
}
