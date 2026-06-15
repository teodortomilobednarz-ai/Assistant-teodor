import type Stripe from "stripe";

import { getStripeEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Reads the current period end (unix seconds) across Stripe API shapes. */
function periodEnd(sub: Stripe.Subscription): Date | null {
  const top = (sub as unknown as { current_period_end?: number })
    .current_period_end;
  const item = sub.items?.data?.[0]?.current_period_end;
  const seconds = top ?? item;
  return seconds ? new Date(seconds * 1000) : null;
}

/** Syncs a subscription's state onto the matching user. */
async function syncSubscription(sub: Stripe.Subscription): Promise<void> {
  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const priceId = sub.items?.data?.[0]?.price?.id ?? null;
  const active = sub.status === "active" || sub.status === "trialing";

  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: customerId },
    select: { id: true },
  });
  if (!user) return;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      stripeSubscriptionId: sub.id,
      stripePriceId: priceId,
      stripeCurrentPeriodEnd: active ? periodEnd(sub) : null,
    },
  });
}

export async function POST(request: Request): Promise<Response> {
  const { webhookSecret } = getStripeEnv();
  const stripe = getStripe();

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing signature", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error("[stripe webhook] signature verification failed:", error);
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.subscription) {
          const subId =
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription.id;
          const sub = await stripe.subscriptions.retrieve(subId);
          await syncSubscription(sub);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        await syncSubscription(event.data.object as Stripe.Subscription);
        break;
      }
      default:
        break;
    }
  } catch (error) {
    console.error("[stripe webhook] handler error:", error);
    return new Response("Handler error", { status: 500 });
  }

  return new Response(null, { status: 200 });
}
