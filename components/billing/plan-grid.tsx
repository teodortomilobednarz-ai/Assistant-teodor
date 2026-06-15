import type { ReactNode } from "react";

import { ChecksIcon } from "@/components/icons";
import { formatPrice, PLANS, type Plan } from "@/lib/plans";

/**
 * Presentational pricing grid. `cta` renders the call-to-action for each plan
 * (a subscribe button in-app, a sign-in link on the public page). Server-only
 * component, so the function prop stays on the server side.
 */
export function PlanGrid({ cta }: { cta: (plan: Plan) => ReactNode }) {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {PLANS.map((plan) => (
        <div
          key={plan.id}
          className={`relative flex flex-col rounded-3xl border p-6 shadow-sm ${
            plan.highlight
              ? "border-accent/40 bg-surface ring-1 ring-accent/30"
              : "border-border bg-surface"
          }`}
        >
          {plan.highlight && (
            <span className="bg-gradient-accent absolute -top-3 left-6 rounded-full px-3 py-1 text-[11px] font-semibold text-white shadow-sm">
              Le plus populaire
            </span>
          )}

          <h3 className="text-lg font-semibold tracking-tight">{plan.name}</h3>
          <p className="mt-1 text-sm text-muted">{plan.tagline}</p>

          <div className="mt-4 flex items-end gap-1">
            <span className="text-4xl font-bold tracking-tight">
              {formatPrice(plan.priceMonthly)}
            </span>
            {plan.priceMonthly > 0 && (
              <span className="mb-1 text-sm text-muted">/ mois</span>
            )}
          </div>
          {plan.priceYearly > 0 && (
            <p className="mt-1 text-xs text-muted">
              ou {plan.priceYearly} € / an (2 mois offerts)
            </p>
          )}

          <ul className="mt-5 flex flex-1 flex-col gap-2.5">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm">
                <ChecksIcon className="mt-0.5 size-4 shrink-0 text-accent" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6">{cta(plan)}</div>
        </div>
      ))}
    </div>
  );
}
