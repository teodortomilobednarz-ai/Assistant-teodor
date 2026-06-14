import Link from "next/link";
import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { InvoiceDocument } from "@/components/billing/invoice-document";
import { PrintButton } from "@/components/billing/print-button";
import { parseItems } from "@/lib/billing-utils";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const userId = session!.user.id;

  const [invoice, profile] = await Promise.all([
    prisma.invoice.findFirst({ where: { id, userId } }),
    prisma.businessProfile.findUnique({ where: { userId } }),
  ]);

  if (!invoice) {
    notFound();
  }

  const dateLabel = invoice.createdAt.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-10">
      <div className="flex items-center justify-between gap-3 print:hidden">
        <Link
          href="/dashboard/billing"
          className="text-sm font-medium text-muted transition-colors hover:text-foreground"
        >
          ← Retour
        </Link>
        <PrintButton />
      </div>

      <InvoiceDocument
        type={invoice.type}
        number={invoice.number}
        dateLabel={dateLabel}
        clientName={invoice.clientName}
        clientEmail={invoice.clientEmail}
        company={{
          name: profile?.companyName ?? "Votre entreprise",
          address: profile?.address,
          siret: profile?.siret,
          email: profile?.email,
        }}
        items={parseItems(invoice.items)}
        tvaRate={invoice.tvaRate}
      />
    </main>
  );
}
