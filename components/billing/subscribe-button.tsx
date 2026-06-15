"use client";

import { useTransition } from "react";

import { startCheckout } from "@/lib/actions/subscription";
import type { PlanTier } from "@/lib/stripe";

export function SubscribeButton({
  tier,
  label = "Choisir",
  highlight = false,
}: {
  tier: PlanTier;
  label?: string;
  highlight?: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => startCheckout(tier))}
      className={`w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition-transform active:scale-[0.98] disabled:opacity-60 ${
        highlight
          ? "bg-gradient-accent text-white shadow-sm hover:-translate-y-0.5"
          : "border border-border bg-surface text-foreground hover:border-accent/40"
      }`}
    >
      {pending ? "Redirection…" : label}
    </button>
  );
}
