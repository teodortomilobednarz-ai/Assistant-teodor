"use client";

import Link from "next/link";

export default function AppError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-5 px-6 py-24 text-center">
      <span className="bg-danger-surface flex size-12 items-center justify-center rounded-2xl text-2xl">
        ⚠️
      </span>
      <div>
        <h1 className="text-xl font-semibold">Une erreur est survenue</h1>
        <p className="mt-1 text-sm text-muted">Réessayez dans un instant.</p>
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="bg-gradient-accent rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5"
        >
          Réessayer
        </button>
        <Link
          href="/"
          className="rounded-xl border border-border bg-surface px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-surface-muted"
        >
          Accueil
        </Link>
      </div>
    </main>
  );
}
