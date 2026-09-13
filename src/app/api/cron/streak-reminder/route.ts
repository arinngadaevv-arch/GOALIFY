import { NextResponse } from "next/server";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { pushSubscriptions, users } from "@/lib/db/schema";
import {
  isExpiredSubscriptionError,
  sendPushNotification,
} from "@/lib/goalify/push";

/**
 * Daily Vercel Cron job (see vercel.json's `crons` entry) — the "you're
 * about to lose your streak" nudge, timed for evening. Targets accounts
 * that trained yesterday but haven't yet today: that's specifically an
 * *active* streak at risk, not just "hasn't opened the app," which is why
 * this only fires for people with a workoutCompletions row yesterday —
 * see that table's own comment in db/schema.ts for why this is the one
 * server-side record of "did they actually train," independent of
 * whatever lib/goalify/store.tsx's client-only streak math shows.
 *
 * "Today" and "yesterday" here are UTC calendar days — a deliberate
 * simplification, not a bug: this app has no per-user timezone on file,
 * so there is no way to reproduce each user's actual local midnight
 * server-side. The tradeoff is a fixed-once-a-day cron run reads slightly
 * differently as "today" for someone in Los Angeles than someone in Tel
 * Aviv; it does not affect whether the reminder is *relevant*, only its
 * exact local send time.
 */
function utcDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function GET(req: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error(
      "[streak-reminder] CRON_SECRET is not set — refusing to run.",
    );
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }
  if (req.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const today = utcDateKey(new Date());
  const yesterday = utcDateKey(new Date(Date.now() - 24 * 60 * 60 * 1000));

  const atRiskUsers = await db
    .select({ id: users.id })
    .from(users)
    .where(
      and(
        sql`exists (
          select 1 from "workout_completion" wc
          where wc.user_id = ${users.id} and wc.completed_on = ${yesterday}
        )`,
        sql`not exists (
          select 1 from "workout_completion" wc
          where wc.user_id = ${users.id} and wc.completed_on = ${today}
        )`,
        sql`exists (
          select 1 from "push_subscription" ps where ps.user_id = ${users.id}
        )`,
      ),
    );

  let notified = 0;
  let staleRemoved = 0;

  for (const user of atRiskUsers) {
    const subscriptions = await db
      .select({
        endpoint: pushSubscriptions.endpoint,
        p256dh: pushSubscriptions.p256dh,
        auth: pushSubscriptions.auth,
      })
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, user.id));

    for (const subscription of subscriptions) {
      const result = await sendPushNotification(subscription, {
        title: "Your streak is about to die",
        body: "You trained yesterday. Today's still sitting there empty.",
        url: "/home",
      });
      if (result.ok) {
        notified += 1;
      } else if (isExpiredSubscriptionError(result)) {
        // The browser/device this was subscribed on no longer exists as
        // far as the push service is concerned — keeping the row around
        // would just mean retrying a dead endpoint every day forever.
        await db
          .delete(pushSubscriptions)
          .where(eq(pushSubscriptions.endpoint, subscription.endpoint));
        staleRemoved += 1;
      } else {
        console.error(
          `[streak-reminder] Push to user ${user.id} failed:`,
          result.error,
        );
      }
    }
  }

  return NextResponse.json({
    ok: true,
    atRiskUsers: atRiskUsers.length,
    notified,
    staleRemoved,
  });
}
