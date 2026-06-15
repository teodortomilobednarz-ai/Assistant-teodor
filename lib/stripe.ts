import "server-only";

import Stripe from "stripe";

import { getStripeEnv } from "./env";

/**
 * Lazily-instantiated, process-wide Stripe client. Reuses the connection pool
 * across requests; only constructed when billing is actually used.
 */
let client: Stripe | null = null;

export function getStripe(): Stripe {
  if (client === null) {
    const { secretKey } = getStripeEnv();
    client = new Stripe(secretKey, {
      typescript: true,
      // Be resilient to transient serverless ↔ Stripe network blips.
      maxNetworkRetries: 3,
      timeout: 20_000,
    });
  }
  return client;
}

/** Paid plan tiers. */
export type PlanTier = "essentiel" | "pro";

/** Billing interval offered at checkout. */
export type BillingInterval = "monthly" | "yearly";

/** Resolves the Stripe Price ID for a tier + interval. */
export function priceIdFor(tier: PlanTier, interval: BillingInterval): string {
  const { prices } = getStripeEnv();
  const key = `${tier}_${interval}`;
  const price = prices[key];
  if (!price) {
    throw new Error(`Stripe price not configured for ${key}.`);
  }
  return price;
}

/** Maps a Stripe Price ID back to a plan tier (for showing the active plan). */
export function tierFromPriceId(priceId: string | null): PlanTier | null {
  if (!priceId) return null;
  const { prices } = getStripeEnv();
  for (const [key, value] of Object.entries(prices)) {
    if (value === priceId) return key.split("_")[0] as PlanTier;
  }
  return null;
}
