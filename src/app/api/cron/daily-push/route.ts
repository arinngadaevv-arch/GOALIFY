import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { pushSubscriptions, users } from "@/lib/db/schema";
import {
  DAILY_PUSH_CONTENT,
  isDailyPushSlot,
} from "@/lib/goalify/daily-push-content";
import {
  isExpiredSubscriptionError,
  sendPushNotification,
} from "@/lib/goalify/push";

const ENABLED_COLUMN = {
  motivation: users.pushMotivationEnabled,
  nutrition: users.pushNutritionEnabled,
  water: users.pushWaterEnabled,
  workout: users.pushWorkoutEnabled,
} as const;

/**
 * One shared handler for all four daily categories (see vercel.json's
 * crons — each entry hits this same route with its own `?slot=`) rather
 * than four near-identical route files, since the only thing that differs
 * between them is which column gates eligibility and which copy goes out.
 *
 * Times in vercel.json are UTC, taken at face value against the mock
 * preview's local-looking times (07:30/12:00/15:30/19:00) — same
 * documented simplification as streak-reminder's UTC-day boundary: this
 * app has no per-user timezone on file, so there's no way to actually
 * land each push at each user's real local time. The tradeoff is
 * identical: it doesn't change whether a nudge is relevant, only how
 * close its send time lands to what the preview implies for any given user.
 */
export async function GET(req: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error("[daily-push] CRON_SECRET is not set — refusing to run.");
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }
  if (req.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const slot = new URL(req.url).searchParams.get("slot");
  if (!isDailyPushSlot(slot)) {
    return NextResponse.json(
      {
        error: "?slot= must be one of: motivation, nutrition, water, workout.",
      },
      { status: 400 },
    );
  }

  const eligibleUsers = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(ENABLED_COLUMN[slot], true));

  let notified = 0;
  let staleRemoved = 0;

  for (const user of eligibleUsers) {
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
        ...DAILY_PUSH_CONTENT[slot],
        url: "/home",
      });
      if (result.ok) {
        notified += 1;
      } else if (isExpiredSubscriptionError(result)) {
        await db
          .delete(pushSubscriptions)
          .where(eq(pushSubscriptions.endpoint, subscription.endpoint));
        staleRemoved += 1;
      } else {
        console.error(
          `[daily-push:${slot}] Push to user ${user.id} failed:`,
          result.error,
        );
      }
    }
  }

  return NextResponse.json({
    ok: true,
    slot,
    eligibleUsers: eligibleUsers.length,
    notified,
    staleRemoved,
  });
}
