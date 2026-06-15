"use client";

import { useActionState, useEffect } from "react";

import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast";
import { saveProfile, type ProfileState } from "@/lib/actions/profile";

const initialState: ProfileState = { ok: false, message: "" };

const inputClass =
  "w-full rounded-lg border border-border bg-surface p-2.5 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20";

interface ProfileFormProps {
  profile: { companyName: string; address: string | null; siret: string | null } | null;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [state, action, pending] = useActionState(saveProfile, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.message) {
      toast(state.message, state.ok ? "success" : "error");
    }
  }, [state, toast]);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="companyName" className="text-sm font-medium">
          Nom de l&apos;entreprise
        </label>
        <input
          id="companyName"
          name="companyName"
          defaultValue={profile?.companyName ?? ""}
          className={inputClass}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="address" className="text-sm font-medium">
          Adresse <span className="text-muted">(optionnel)</span>
        </label>
        <input
          id="address"
          name="address"
          defaultValue={profile?.address ?? ""}
          className={inputClass}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="siret" className="text-sm font-medium">
          SIRET <span className="text-muted">(optionnel)</span>
        </label>
        <input
          id="siret"
          name="siret"
          defaultValue={profile?.siret ?? ""}
          className={inputClass}
        />
      </div>
      <p className="text-xs text-muted">
        Ces informations pré-remplissent vos devis et factures.
      </p>
      <button
        type="submit"
        disabled={pending}
        className="bg-gradient-accent inline-flex w-fit items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5 disabled:opacity-60"
      >
        {pending && <Spinner className="size-4" />}
        {pending ? "Enregistrement…" : "Enregistrer"}
      </button>
    </form>
  );
}
