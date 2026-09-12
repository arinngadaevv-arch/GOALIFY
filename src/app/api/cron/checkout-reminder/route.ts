import { NextResponse } from "next/server";
import { and, eq, isNull, lt, gt, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { sendEmail } from "@/lib/goalify/email";
import { goalLabel } from "@/lib/goalify/plan";
import type { Goal } from "@/lib/goalify/types";

/**
 * Daily Vercel Cron job (see vercel.json's `crons` entry) — the automated
 * "you signed up but never started your plan" nudge. Targets accounts that:
 *   - are still on the FREE plan (never converted, trial or paid),
 *   - signed up 1–3 days ago (recent enough that the nudge is still
 *     relevant, wide enough that a slightly-late or slightly-early cron
 *     run never skips someone),
 *   - have never had a real checkoutEvents row (the same "never actually
 *     paid" signal the admin dashboard's Trial badge already uses), and
 *   - haven't already gotten this email (`checkoutReminderSentAt`).
 *
 * Protected the same way the payment webhooks protect themselves: refuses
 * to run at all without a matching secret, so this can't be triggered by
 * anyone who finds the URL. Vercel Cron sends `Authorization: Bearer
 * <CRON_SECRET>` automatically once that env var is set — see
 * https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs.
 */
export async function GET(req: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error(
      "[checkout-reminder] CRON_SECRET is not set — refusing to run.",
    );
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }
  if (req.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const now = Date.now();
  const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);
  const threeDaysAgo = new Date(now - 3 * 24 * 60 * 60 * 1000);

  const candidates = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      quizGoal: users.quizGoal,
    })
    .from(users)
    .where(
      and(
        eq(users.plan, "FREE"),
        lt(users.createdAt, oneDayAgo),
        gt(users.createdAt, threeDaysAgo),
        isNull(users.checkoutReminderSentAt),
        sql`not exists (
          select 1 from "checkout_event" ce where ce.user_id = ${users.id}
        )`,
      ),
    );

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
  const planUrl = `${appUrl}/plan`;

  let sent = 0;
  for (const user of candidates) {
    const goal = user.quizGoal ? goalLabel(user.quizGoal as Goal) : null;
    await sendEmail({
      to: user.email,
      subject: "Still avoiding your own plan?",
      html: checkoutReminderHtml({ name: user.name, goal, planUrl }),
    });
    await db
      .update(users)
      .set({ checkoutReminderSentAt: new Date() })
      .where(eq(users.id, user.id));
    sent += 1;
  }

  return NextResponse.json({ ok: true, candidates: candidates.length, sent });
}

function checkoutReminderHtml({
  name,
  goal,
  planUrl,
}: {
  name: string | null;
  goal: string | null;
  planUrl: string;
}): string {
  const greeting = name ? `${name}.` : "Hey.";
  const goalLine = goal
    ? `You made it as far as signing up for the ${goal.toLowerCase()} plan. Then... nothing.`
    : "You made it as far as signing up. Then... nothing.";
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; color: #1a1100;">
      <p style="font-size: 16px; font-weight: 700;">${greeting}</p>
      <p style="font-size: 16px; line-height: 1.5;">${goalLine}</p>
      <p style="font-size: 16px; line-height: 1.5;">Nobody's coming to save your streak for you. The plan's still sitting exactly where you left it, untouched.</p>
      <p style="text-align: center; margin: 32px 0;">
        <a href="${planUrl}" style="background: #e8b32c; color: #1a1100; padding: 14px 28px; border-radius: 999px; font-weight: 800; text-decoration: none; display: inline-block;">
          FINE. LET'S GO
        </a>
      </p>
      <p style="font-size: 12px; line-height: 1.4; color: #6b6b6b; text-align: center;">This is the only nudge you'll get about this.</p>
    </div>
  `;
}
