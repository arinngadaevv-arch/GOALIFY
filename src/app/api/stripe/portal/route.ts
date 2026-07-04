import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { getAppUrl, getStripeClient } from "@/lib/stripe";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "יש להתחבר תחילה" }, { status: 401 });
  }

  const [user] = await db
    .select({ stripeCustomerId: users.stripeCustomerId })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!user?.stripeCustomerId) {
    return NextResponse.json(
      { error: "לא נמצא מנוי פעיל לניהול" },
      { status: 400 }
    );
  }

  try {
    const stripe = getStripeClient();
    const appUrl = getAppUrl(req.url);

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${appUrl}/dashboard/account`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error("[/api/stripe/portal] failed", error);
    return NextResponse.json(
      { error: "משהו השתבש בפתיחת ניהול המנוי. נסו שוב בעוד רגע." },
      { status: 500 }
    );
  }
}
