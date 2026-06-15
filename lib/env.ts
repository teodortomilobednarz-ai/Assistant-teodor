import "server-only";

/**
 * Server-side environment access.
 *
 * Reads are validated lazily (at call time) rather than at module load so the
 * app can still build and render pages that don't need the AI provider.
 */
export interface ServerEnv {
  readonly geminiApiKey: string;
}

export function getServerEnv(): ServerEnv {
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (!geminiApiKey) {
    throw new Error(
      "GEMINI_API_KEY is not set. Copy .env.example to .env.local and add your Google Gemini API key.",
    );
  }

  return { geminiApiKey };
}

export interface StripeEnv {
  readonly secretKey: string;
  readonly webhookSecret: string;
  /** Stripe Price IDs, keyed by `${tier}_${interval}` (e.g. "essentiel_monthly"). */
  readonly prices: Readonly<Record<string, string | undefined>>;
  readonly appUrl: string;
}

/**
 * Stripe configuration, validated lazily. Only the routes/actions that touch
 * billing call this, so the rest of the app builds without Stripe configured.
 */
export function getStripeEnv(): StripeEnv {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const essentielMonthly = process.env.STRIPE_PRICE_ESSENTIEL_MONTHLY;
  const proMonthly = process.env.STRIPE_PRICE_PRO_MONTHLY;

  if (!secretKey) throw new Error("STRIPE_SECRET_KEY is not set.");
  if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET is not set.");
  if (!essentielMonthly)
    throw new Error("STRIPE_PRICE_ESSENTIEL_MONTHLY is not set.");
  if (!proMonthly) throw new Error("STRIPE_PRICE_PRO_MONTHLY is not set.");

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://assistant-teodor.vercel.app";

  return {
    secretKey,
    webhookSecret,
    prices: {
      essentiel_monthly: essentielMonthly,
      pro_monthly: proMonthly,
      essentiel_yearly: process.env.STRIPE_PRICE_ESSENTIEL_YEARLY || undefined,
      pro_yearly: process.env.STRIPE_PRICE_PRO_YEARLY || undefined,
    },
    appUrl,
  };
}
