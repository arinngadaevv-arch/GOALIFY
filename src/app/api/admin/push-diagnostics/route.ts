import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getAdminSession } from "@/lib/admin";
import { db } from "@/lib/db";
import { pushSubscriptions } from "@/lib/db/schema";
import { pushConfig, sendPushNotification } from "@/lib/goalify/push";

// Owner-only: fires a real test push at every subscription the admin's own
// account has (their own browsers/devices, from the notifications page's
// "Streak-risk alerts" toggle) — the fastest way to confirm the VAPID
// keys actually work without waiting for tonight's streak-reminder cron
// to either work or silently not. Sends to nobody else's subscriptions.
export async function GET() {
  const session = await getAdminSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
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

  const results = await Promise.all(
    subscriptions.map((subscription) =>
      sendPushNotification(subscription, {
        title: "GOALIFY test push",
        body: "If you see this, web push is wired up correctly.",
        url: "/home",
      }),
    ),
  );

  return NextResponse.json({
    config,
    subscriptionCount: subscriptions.length,
    results,
  });
}
