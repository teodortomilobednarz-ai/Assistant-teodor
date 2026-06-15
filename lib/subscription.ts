import "server-only";

import type { PlanId } from "./plans";
import { prisma } from "./prisma";
import { tierFromPriceId } from "./stripe";

export interface SubscriptionStatus {
  active: boolean;
  plan: PlanId;
  currentPeriodEnd: Date | null;
  hasCustomer: boolean;
}

/**
 * Reads the user's subscription state from our DB (kept in sync by the Stripe
 * webhook). "active" means a paid period that hasn't elapsed yet.
 */
export async function getSubscriptionStatus(
  userId: string,
): Promise<SubscriptionStatus> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      stripeCustomerId: true,
      stripeCurrentPeriodEnd: true,
      stripePriceId: true,
    },
  });

  const end = user?.stripeCurrentPeriodEnd ?? null;
  const active = end !== null && end.getTime() > Date.now();

  let plan: PlanId = "free";
  if (active) {
    // Derive the tier from the active price; fall back to "pro" if env lookup fails.
    try {
      plan = tierFromPriceId(user?.stripePriceId ?? null) ?? "pro";
    } catch {
      plan = "pro";
    }
  }

  return {
    active,
    plan,
    currentPeriodEnd: end,
    hasCustomer: Boolean(user?.stripeCustomerId),
  };
}
