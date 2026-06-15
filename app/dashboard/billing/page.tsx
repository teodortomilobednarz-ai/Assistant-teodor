import Link from "next/link";

import { auth } from "@/auth";
import { BillingWorkspace } from "@/components/billing/billing-workspace";
import { PageHeader } from "@/components/dashboard/page-header";
import { ReceiptIcon } from "@/components/icons";
import { formatEuro } from "@/lib/billing-utils";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [profile, invoices] = await Promise.all([
    prisma.businessProfile.findUnique({ where: { userId } }),
    prisma.invoice.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
      <PageHeader
        icon={ReceiptIcon}
        title="Devis & factures"
        description="Générez un devis ou une facture à partir d'une demande client — l'IA en déduit les lignes."
      />

      <BillingWorkspace
        profile={
          profile
            ? {
                companyName: profile.companyName,
                address: profile.address,
                siret: profile.siret,
              }
            : null
        }
      />

      {invoices.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Documents récents
          </h2>
          <ul className="flex flex-col gap-2">
            {invoices.map((invoice) => (
              <li key={invoice.id}>
                <Link
                  href={`/dashboard/billing/${invoice.id}`}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm transition-colors hover:border-accent/40"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ring-1 ring-inset ${
                        invoice.type === "facture"
                          ? "bg-accent-soft text-accent ring-accent/20"
                          : "bg-surface-muted text-muted ring-border"
                      }`}
                    >
                      {invoice.type}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {invoice.clientName}
                      </p>
                      <p className="text-xs text-muted">{invoice.number}</p>
                    </div>
                  </div>
                  <span className="shrink-0 text-sm font-semibold tabular-nums">
                    {formatEuro(invoice.total)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
