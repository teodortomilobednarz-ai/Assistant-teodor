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
  searchParams: Promise<{ status?: string; reason?: string }>;
}) {
  const session = await auth();
  const userId = session!.user.id;
  const status = await getSubscriptionStatus(userId);
  const { status: outcome, reason } = await searchParams;

  // Temporary diagnostic: which billing env vars does the running deployment
  // actually see? Names only — values are never read or shown.
  const EXPECTED = [
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "STRIPE_PRICE_ESSENTIEL_MONTHLY",
    "STRIPE_PRICE_PRO_MONTHLY",
    "NEXT_PUBLIC_APP_URL",
  ];
  const envPresence = EXPECTED.map((name) => ({
    name,
    present: Boolean(process.env[name] && process.env[name]!.trim()),
  }));
  const detectedStripeKeys = Object.keys(process.env).filter((k) =>
    k.toUpperCase().includes("STRIPE"),
  );

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
          <p className="font-semibold">Le paiement n&apos;a pas pu démarrer.</p>
          {reason && (
            <p className="mt-2 break-words font-mono text-xs text-danger">
              {reason}
            </p>
          )}
          <div className="mt-3 rounded-lg border border-border bg-surface p-3">
            <p className="mb-1.5 text-xs font-semibold text-muted">
              Diagnostic — variables vues par ce déploiement :
            </p>
            <ul className="flex flex-col gap-0.5 font-mono text-xs">
              {envPresence.map((e) => (
                <li key={e.name}>
                  {e.present ? "✅" : "❌"} {e.name}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-muted">
              Clés contenant « STRIPE » détectées :{" "}
              {detectedStripeKeys.length > 0
                ? detectedStripeKeys.join(", ")
                : "aucune"}
            </p>
          </div>
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
