"use client";

import { useState } from "react";

import { deleteAccount } from "@/lib/actions/account";

export function DeleteAccount() {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted">
        Supprime définitivement votre compte et toutes vos données (emails
        analysés, tâches, devis, profil et jetons Google). Cette action est
        irréversible.
      </p>

      {!confirming ? (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="w-fit rounded-xl border border-danger/40 px-4 py-2.5 text-sm font-semibold text-danger transition-colors hover:bg-danger-surface"
        >
          Supprimer mon compte et mes données
        </button>
      ) : (
        <form action={deleteAccount} className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="rounded-xl bg-danger px-4 py-2.5 text-sm font-semibold text-white transition-transform active:scale-95"
          >
            Oui, tout supprimer définitivement
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            Annuler
          </button>
        </form>
      )}
    </div>
  );
}
