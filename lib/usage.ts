import "server-only";

import { limitsFor } from "./plan-limits";
import type { PlanId } from "./plans";
import { prisma } from "./prisma";
import { getSubscriptionStatus } from "./subscription";

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfMonth(): Date {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export interface QuotaCheck {
  allowed: boolean;
  plan: PlanId;
  used: number;
  /** null = unlimited. */
  limit: number | null;
}

/** Can the user run another Copilot analysis today? */
export async function checkAnalysisQuota(userId: string): Promise<QuotaCheck> {
  const { plan } = await getSubscriptionStatus(userId);
  const limit = limitsFor(plan).analysesPerDay;
  if (limit === null) {
    return { allowed: true, plan, used: 0, limit: null };
  }
  const used = await prisma.analysis.count({
    where: { userId, createdAt: { gte: startOfToday() } },
  });
  return { allowed: used < limit, plan, used, limit };
}

/** Can the user generate another quote/invoice this month? */
export async function checkInvoiceQuota(userId: string): Promise<QuotaCheck> {
  const { plan } = await getSubscriptionStatus(userId);
  const limit = limitsFor(plan).invoicesPerMonth;
  if (limit === null) {
    return { allowed: true, plan, used: 0, limit: null };
  }
  const used = await prisma.invoice.count({
    where: { userId, createdAt: { gte: startOfMonth() } },
  });
  return { allowed: used < limit, plan, used, limit };
}

/** Whether the user's plan can read heavy file types (Office, audio, video, zip). */
export async function canReadAdvancedDocs(userId: string): Promise<boolean> {
  const { plan } = await getSubscriptionStatus(userId);
  return limitsFor(plan).advancedDocs;
}
