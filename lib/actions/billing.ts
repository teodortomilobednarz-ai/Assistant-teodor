"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { computeTotals } from "@/lib/billing-utils";
import { generateInvoiceItems } from "@/lib/billing";
import { prisma } from "@/lib/prisma";
import { checkInvoiceQuota } from "@/lib/usage";

export interface GenerateInvoiceState {
  ok: boolean;
  message?: string;
  invoiceId?: string;
}

export async function generateInvoice(
  _prevState: GenerateInvoiceState,
  formData: FormData,
): Promise<GenerateInvoiceState> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return { ok: false, message: "Non authentifié." };
  }

  const type =
    String(formData.get("type") ?? "devis") === "facture"
      ? "facture"
      : "devis";
  const companyName = String(formData.get("companyName") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim() || null;
  const siret = String(formData.get("siret") ?? "").trim() || null;
  const clientName = String(formData.get("clientName") ?? "").trim();
  const clientEmail = String(formData.get("clientEmail") ?? "").trim() || null;
  const requestText = String(formData.get("requestText") ?? "").trim();
  const tvaRate = Number(formData.get("tvaRate") ?? 20);

  if (!companyName || !clientName || !requestText) {
    return {
      ok: false,
      message: "Renseigne ton entreprise, le client et la demande.",
    };
  }

  const quota = await checkInvoiceQuota(userId);
  if (!quota.allowed) {
    return {
      ok: false,
      message:
        quota.limit === 0
          ? "Les devis & factures nécessitent un abonnement (Essentiel ou Pro)."
          : `Limite atteinte : ${quota.limit} devis/factures par mois sur votre plan. Passez au plan Pro pour un usage illimité.`,
    };
  }

  try {
    await prisma.businessProfile.upsert({
      where: { userId },
      create: { userId, companyName, address, siret },
      update: { companyName, address, siret },
    });

    const items = await generateInvoiceItems(requestText);
    const { total } = computeTotals(items, tvaRate);

    const count = await prisma.invoice.count({ where: { userId, type } });
    const prefix = type === "facture" ? "FAC" : "DEV";
    const number = `${prefix}-${new Date().getFullYear()}-${String(
      count + 1,
    ).padStart(3, "0")}`;

    const invoice = await prisma.invoice.create({
      data: {
        userId,
        type,
        number,
        clientName,
        clientEmail,
        items: items as unknown as Prisma.InputJsonValue,
        tvaRate,
        total,
      },
    });

    revalidatePath("/dashboard/billing");
    return { ok: true, invoiceId: invoice.id };
  } catch (error) {
    console.error("[generateInvoice] failed:", error);
    return { ok: false, message: "Génération impossible. Réessaie." };
  }
}
