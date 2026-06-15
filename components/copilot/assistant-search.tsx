"use client";

import { useState } from "react";

import { SearchIcon, SparklesIcon } from "@/components/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { askAssistant, type AssistantAnswer } from "@/lib/actions/search";

const EXAMPLES = [
  "Quand est mon prochain rendez-vous avec un client ?",
  "Quel est le dernier devis que j'ai envoyé ?",
  "Qui attend une réponse de ma part ?",
];

export function AssistantSearch() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AssistantAnswer | null>(null);

  async function run(q: string) {
    const value = q.trim();
    if (!value) return;
    setLoading(true);
    setResult(null);
    try {
      setResult(await askAssistant(value));
    } catch {
      setResult({ ok: false, error: "Recherche impossible pour le moment." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void run(query);
        }}
        className="relative"
      >
        <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Posez une question sur vos emails, agenda, documents…"
          className="w-full rounded-2xl border border-border bg-surface py-4 pl-12 pr-28 text-base outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="bg-gradient-accent absolute right-2 top-1/2 -translate-y-1/2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform active:scale-95 disabled:opacity-50"
        >
          {loading ? "…" : "Demander"}
        </button>
      </form>

      {!result && !loading && (
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => {
                setQuery(ex);
                void run(ex);
              }}
              className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-muted transition-colors active:scale-95 hover:border-accent/40 hover:text-foreground"
            >
              {ex}
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="space-y-2 rounded-2xl border border-border bg-surface p-5">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      )}

      {result?.ok && result.answer && (
        <section className="card-glow rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted">
            <SparklesIcon className="size-4 text-accent" />
            Réponse
          </h2>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">
            {result.answer}
          </p>
          {result.sources && (
            <p className="mt-3 border-t border-border pt-3 text-xs text-muted">
              Basé sur {result.sources.emails} email(s), {result.sources.events}{" "}
              événement(s) et {result.sources.files} document(s).
            </p>
          )}
        </section>
      )}

      {result && !result.ok && (
        <div className="rounded-2xl border border-danger/30 bg-danger-surface p-4 text-sm text-foreground">
          {result.error}
        </div>
      )}
    </div>
  );
}
