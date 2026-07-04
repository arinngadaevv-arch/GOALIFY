import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import {
  getStripeClient,
  getSubscriptionPeriodEnd,
  planFromPriceId,
} from "@/lib/stripe";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    console.error("[stripe webhook] missing signature or webhook secret");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });
  }

  const rawBody = await req.text();
  const stripe = getStripeClient();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("[stripe webhook] signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const checkoutSession = event.data.object as Stripe.Checkout.Session;
        if (checkoutSession.mode !== "subscription" || !checkoutSession.subscription) {
          break;
        }
        const subscriptionId =
          typeof checkoutSession.subscription === "string"
            ? checkoutSession.subscription
            : checkoutSession.subscription.id;
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        await syncSubscription(subscription, checkoutSession.client_reference_id);
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await syncSubscription(subscription, subscription.metadata?.userId ?? null);
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }
      default:
        break;
    }
  } catch (error) {
    console.error(`[stripe webhook] failed to process ${event.type}`, error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function syncSubscription(
  subscription: Stripe.Subscription,
  fallbackUserId: string | null
) {
  const priceId = subscription.items.data[0]?.price.id;
  const isEntitled = subscription.status === "active" || subscription.status === "trialing";
  const plan = isEntitled ? planFromPriceId(priceId) : "FREE";
  const userId = subscription.metadata?.userId || fallbackUserId;
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  const values = {
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscription.id,
    stripePriceId: priceId ?? null,
    stripeCurrentPeriodEnd: getSubscriptionPeriodEnd(subscription),
    subscriptionStatus: subscription.status,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    plan,
  };

  if (userId) {
    await db.update(users).set(values).where(eq(users.id, userId));
    return;
  }

  await db.update(users).set(values).where(eq(users.stripeCustomerId, customerId));
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  await db
    .update(users)
    .set({
      plan: "FREE",
      subscriptionStatus: "canceled",
      cancelAtPeriodEnd: false,
      stripeSubscriptionId: null,
      stripePriceId: null,
      stripeCurrentPeriodEnd: null,
    })
    .where(eq(users.stripeCustomerId, customerId));
}
