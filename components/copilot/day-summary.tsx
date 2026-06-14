"use client";

import { useState } from "react";

import { summarizeDay } from "@/lib/actions/calendar";

export function DaySummary() {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      setSummary(await summarizeDay());
    } catch {
      setError("Résumé indisponible pour le moment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          Résumé de votre journée
        </h2>
        <button
          type="button"
          onClick={run}
          disabled={loading}
          className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground transition-colors hover:bg-accent-hover disabled:opacity-50"
        >
          {loading ? "…" : summary ? "Régénérer" : "Générer"}
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-danger">{error}</p>}
      {summary && (
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">
          {summary}
        </p>
      )}
    </section>
  );
}
