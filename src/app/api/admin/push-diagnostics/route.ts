import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getAdminSession } from "@/lib/admin";
import { db } from "@/lib/db";
import { pushSubscriptions } from "@/lib/db/schema";
import {
  DAILY_PUSH_CONTENT,
  isDailyPushSlot,
} from "@/lib/goalify/daily-push-content";
import { pushConfig, sendPushNotification } from "@/lib/goalify/push";

// Owner-only: fires a real test push at every subscription the admin's own
// account has (their own browsers/devices, from the notifications page's
// "Push notifications" toggle) — the fastest way to confirm the VAPID keys
// actually work without waiting for tonight's streak-reminder cron to
// either work or silently not. Sends to nobody else's subscriptions.
//
// `?slot=` (motivation/nutrition/water/workout) swaps the generic test
// payload for that category's real, exact copy — the same content
// api/cron/daily-push actually sends — so the admin can preview any of the
// four on demand instead of waiting for its scheduled UTC time to roll
// around.
export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const slot = new URL(req.url).searchParams.get("slot");
  if (slot !== null && !isDailyPushSlot(slot)) {
    return NextResponse.json(
      {
        error: "?slot= must be one of: motivation, nutrition, water, workout.",
      },
      { status: 400 },
    );
  }

  const config = pushConfig();

  const subscriptions = await db
    .select({
      endpoint: pushSubscriptions.endpoint,
      p256dh: pushSubscriptions.p256dh,
      auth: pushSubscriptions.auth,
    })
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.userId, session.user.id));

  if (subscriptions.length === 0) {
    return NextResponse.json({ config, subscriptionCount: 0, results: [] });
  }

  const payload = slot
    ? DAILY_PUSH_CONTENT[slot]
    : {
        title: "GOALIFY test push",
        body: "If you see this, web push is wired up correctly.",
      };

  const results = await Promise.all(
    subscriptions.map((subscription) =>
      sendPushNotification(subscription, { ...payload, url: "/home" }),
    ),
  );

  return NextResponse.json({
    config,
    slot: slot ?? null,
    subscriptionCount: subscriptions.length,
    results,
  });
}
