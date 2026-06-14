"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Spinner } from "@/components/ui/spinner";
import {
  generateInvoice,
  type GenerateInvoiceState,
} from "@/lib/actions/billing";

interface BillingWorkspaceProps {
  profile: {
    companyName: string;
    address: string | null;
    siret: string | null;
  } | null;
}

const initialState: GenerateInvoiceState = { ok: false };

const inputClass =
  "w-full rounded-lg border border-border bg-surface p-2.5 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20";

export function BillingWorkspace({ profile }: BillingWorkspaceProps) {
  const [state, action, pending] = useActionState(
    generateInvoice,
    initialState,
  );

  return (
    <form action={action} className="flex flex-col gap-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <fieldset className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <legend className="px-1 text-sm font-semibold">Votre entreprise</legend>
          <input
            name="companyName"
            placeholder="Nom de l'entreprise"
            defaultValue={profile?.companyName ?? ""}
            className={inputClass}
          />
          <input
            name="address"
            placeholder="Adresse (optionnel)"
            defaultValue={profile?.address ?? ""}
            className={inputClass}
          />
          <input
            name="siret"
            placeholder="SIRET (optionnel)"
            defaultValue={profile?.siret ?? ""}
            className={inputClass}
          />
        </fieldset>

        <fieldset className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <legend className="px-1 text-sm font-semibold">Le client</legend>
          <input name="clientName" placeholder="Nom du client" className={inputClass} />
          <input
            name="clientEmail"
            type="email"
            placeholder="Email du client (optionnel)"
            className={inputClass}
          />
          <div className="grid grid-cols-2 gap-3">
            <select name="type" defaultValue="devis" className={inputClass}>
              <option value="devis">Devis</option>
              <option value="facture">Facture</option>
            </select>
            <select name="tvaRate" defaultValue="20" className={inputClass}>
              <option value="20">TVA 20 %</option>
              <option value="10">TVA 10 %</option>
              <option value="5.5">TVA 5,5 %</option>
              <option value="0">Sans TVA</option>
            </select>
          </div>
        </fieldset>
      </div>

      <div className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <label htmlFor="requestText" className="text-sm font-semibold">
          La demande du client
        </label>
        <textarea
          id="requestText"
          name="requestText"
          rows={5}
          placeholder="Collez l'email ou décrivez ce que le client demande — l'IA en déduit les lignes et les montants."
          className={inputClass}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="bg-gradient-accent inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5 disabled:opacity-60"
        >
          {pending && <Spinner className="size-4" />}
          {pending ? "Génération…" : "Générer le document"}
        </button>

        {state.message && <span className="text-sm text-danger">{state.message}</span>}

        {state.ok && state.invoiceId && (
          <Link
            href={`/dashboard/billing/${state.invoiceId}`}
            className="inline-flex items-center gap-1 text-sm font-semibold text-accent hover:text-accent-hover"
          >
            Voir le document →
          </Link>
        )}
      </div>
    </form>
  );
}
