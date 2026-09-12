import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin";
import { emailConfig, sendTestEmail } from "@/lib/goalify/email";

// Owner-only: sends a real test email through Resend — the fastest way to
// confirm RESEND_API_KEY and EMAIL_FROM are actually correct (right key,
// `from` address on a verified domain) without waiting for the daily
// checkout-reminder cron to either work or silently not. Defaults to the
// admin's own session email so this never needs a stranger's inbox to test.
export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const config = emailConfig();
  const to =
    new URL(req.url).searchParams.get("to")?.trim() || session.user.email;

  try {
    const result = await sendTestEmail(to);
    return NextResponse.json({ config, to, result });
  } catch (err) {
    console.error("[email-diagnostics] Unexpected failure:", err);
    return NextResponse.json(
      {
        config,
        error:
          err instanceof Error
            ? `${err.name}: ${err.message}`
            : "Unexpected error running diagnostics.",
      },
      { status: 500 },
    );
  }
}
