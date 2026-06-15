"use server";

import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getStripeEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import {
  getStripe,
  priceIdFor,
  type BillingInterval,
  type PlanTier,
} from "@/lib/stripe";

/** Ensures the user has a Stripe customer, creating one on first need. */
async function ensureCustomer(
  userId: string,
  email: string | null,
): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true },
  });
  if (user?.stripeCustomerId) return user.stripeCustomerId;

  const customer = await getStripe().customers.create({
    email: email ?? undefined,
    metadata: { userId },
  });
  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id },
  });
  return customer.id;
}

/**
 * Starts a Stripe Checkout session for the Pro subscription and redirects the
 * user to Stripe's hosted page. No charge happens until the user confirms there.
 */
export async function startCheckout(
  tier: PlanTier,
  interval: BillingInterval = "monthly",
): Promise<void> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/");

  let url: string | null = null;
  try {
    const { appUrl } = getStripeEnv();
    const customerId = await ensureCustomer(userId, session.user.email ?? null);

    const checkout = await getStripe().checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceIdFor(tier, interval), quantity: 1 }],
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      success_url: `${appUrl}/dashboard/abonnement?status=success`,
      cancel_url: `${appUrl}/dashboard/abonnement?status=cancel`,
      subscription_data: { metadata: { userId } },
      metadata: { userId },
    });
    url = checkout.url;
  } catch (error) {
    // Log server-side; show the user a clean, generic message.
    console.error("[startCheckout] failed:", error);
    redirect("/dashboard/abonnement?status=error");
  }

  if (!url) redirect("/dashboard/abonnement?status=error");
  redirect(url);
}

/**
 * Opens the Stripe Customer Portal so the user can manage / cancel their
 * subscription and update payment details.
 */
export async function openBillingPortal(): Promise<void> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/");

  const { appUrl } = getStripeEnv();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true },
  });
  if (!user?.stripeCustomerId) redirect("/dashboard/abonnement");

  const portal = await getStripe().billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${appUrl}/dashboard/abonnement`,
  });

  redirect(portal.url);
}
