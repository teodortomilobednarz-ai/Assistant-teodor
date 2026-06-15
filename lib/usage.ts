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

/** What document types the user's plan may read. */
export async function getDocAccess(
  userId: string,
): Promise<{ standard: boolean; advanced: boolean }> {
  const { plan } = await getSubscriptionStatus(userId);
  const limits = limitsFor(plan);
  return { standard: limits.standardDocs, advanced: limits.advancedDocs };
}
