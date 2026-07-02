import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { getAppUrl, getStripeClient, STRIPE_PRICE_IDS } from "@/lib/stripe";

const bodySchema = z.object({ plan: z.enum(["PRO", "BUSINESS"]) });

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "יש להתחבר תחילה" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "תוכנית לא תקינה" }, { status: 400 });
  }

  const priceId = STRIPE_PRICE_IDS[parsed.data.plan];
  if (!priceId) {
    return NextResponse.json(
      {
        error:
          "התוכנית הזו עדיין לא הוגדרה במערכת הסליקה. ודאו שהגדרתם את משתני הסביבה STRIPE_PRICE_ID_PRO / STRIPE_PRICE_ID_BUSINESS.",
      },
      { status: 500 }
    );
  }

  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "משתמש לא נמצא" }, { status: 404 });
    }

    const stripe = getStripeClient();

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name ?? undefined,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      await db
        .update(users)
        .set({ stripeCustomerId: customerId })
        .where(eq(users.id, user.id));
    }

    const appUrl = getAppUrl(req.url);

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      client_reference_id: user.id,
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${appUrl}/dashboard/account?checkout=success`,
      cancel_url: `${appUrl}/pricing?checkout=cancelled`,
      subscription_data: {
        metadata: { userId: user.id },
      },
    });

    if (!checkoutSession.url) {
      return NextResponse.json(
        { error: "יצירת עמוד התשלום נכשלה" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("[/api/stripe/checkout] failed", error);
    return NextResponse.json(
      { error: "משהו השתבש ביצירת התשלום. נסו שוב בעוד רגע." },
      { status: 500 }
    );
  }
}
