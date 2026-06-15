"use client";

import { useTransition } from "react";

import { openBillingPortal } from "@/lib/actions/subscription";

export function ManageButton() {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => openBillingPortal())}
      className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold transition-transform active:scale-[0.98] hover:border-accent/40 disabled:opacity-60"
    >
      {pending ? "Ouverture…" : "Gérer mon abonnement"}
    </button>
  );
}
