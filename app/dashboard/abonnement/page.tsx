import { auth } from "@/auth";
import { ManageButton } from "@/components/billing/manage-button";
import { PlanGrid } from "@/components/billing/plan-grid";
import { SubscribeButton } from "@/components/billing/subscribe-button";
import { PageHeader } from "@/components/dashboard/page-header";
import { ReceiptIcon } from "@/components/icons";
import { planById } from "@/lib/plans";
import { getSubscriptionStatus } from "@/lib/subscription";

export const dynamic = "force-dynamic";

export default async function AbonnementPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await auth();
  const userId = session!.user.id;
  const status = await getSubscriptionStatus(userId);
  const { status: outcome } = await searchParams;

  const current = planById(status.plan);
  const periodEnd = status.currentPeriodEnd?.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
      <PageHeader
        icon={ReceiptIcon}
        title="Abonnement"
        description="Choisissez la formule adaptée à votre activité."
      />

      {outcome === "success" && (
        <div className="rounded-2xl border border-success/30 bg-success/10 p-4 text-sm text-foreground">
          🎉 Merci ! Votre abonnement est actif. Profitez de Draidly sans limite.
        </div>
      )}
      {outcome === "cancel" && (
        <div className="rounded-2xl border border-border bg-surface p-4 text-sm text-muted">
          Paiement annulé — aucun montant n&apos;a été prélevé.
        </div>
      )}
      {outcome === "error" && (
        <div className="rounded-2xl border border-danger/30 bg-danger-surface p-4 text-sm text-foreground">
          Le paiement n&apos;a pas pu démarrer. Veuillez réessayer dans un
          instant.
        </div>
      )}

      {/* Current plan summary */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted">Formule actuelle</p>
          <p className="text-lg font-semibold">
            {current.name}
            {status.active && periodEnd && (
              <span className="ml-2 text-sm font-normal text-muted">
                · renouvellement le {periodEnd}
              </span>
            )}
          </p>
        </div>
        {status.hasCustomer && (
          <div className="sm:w-56">
            <ManageButton />
          </div>
        )}
      </div>

      <PlanGrid
        cta={(plan) => {
          const isCurrent = status.active && status.plan === plan.id;
          if (plan.id === "free") {
            return (
              <p className="text-center text-xs text-muted">
                {status.plan === "free"
                  ? "Votre formule actuelle"
                  : "Inclus dans les formules payantes"}
              </p>
            );
          }
          if (isCurrent) {
            return (
              <div className="rounded-xl border border-accent/30 bg-accent-soft px-4 py-2.5 text-center text-sm font-semibold text-accent">
                Plan actuel
              </div>
            );
          }
          return (
            <SubscribeButton
              tier={plan.tier!}
              highlight={plan.highlight}
              label={status.active ? "Changer pour ce plan" : "Choisir"}
            />
          );
        }}
      />

      <p className="text-center text-xs text-muted">
        Paiement sécurisé par Stripe · Résiliable à tout moment · TVA incluse le
        cas échéant.
      </p>
    </main>
  );
}
