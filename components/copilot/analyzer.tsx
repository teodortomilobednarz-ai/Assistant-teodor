"use client";

import { useState } from "react";

import { SparklesIcon } from "@/components/icons";
import { Spinner } from "@/components/ui/spinner";
import type { Analysis } from "@/lib/schema";

import { AnalysisResults } from "./analysis-results";

const SAMPLE_EMAIL = `Bonjour,

Suite à notre échange de la semaine dernière, je confirme notre intérêt pour votre offre d'accompagnement. Pourriez-vous nous envoyer un devis détaillé avant vendredi prochain ? Nous aimerions également caler une réunion de lancement la semaine du 23 juin.

Par ailleurs, notre comptable aura besoin de votre numéro de SIRET pour préparer le dossier.

Merci d'avance,
Camille Durand
Directrice, Atelier Lumière`;

type Status = "idle" | "loading" | "error";

export function Analyzer() {
  const [content, setContent] = useState("");
  const [question, setQuestion] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);

  const canSubmit = content.trim().length > 0 && status !== "loading";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setStatus("loading");
    setError(null);
    setAnalysis(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          question: question.trim() || null,
        }),
      });

      const data: unknown = await response.json();

      if (!response.ok) {
        const message =
          typeof data === "object" && data !== null && "error" in data
            ? String((data as { error: unknown }).error)
            : "Une erreur est survenue.";
        throw new Error(message);
      }

      setAnalysis(data as Analysis);
      setStatus("idle");
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Une erreur inattendue est survenue.",
      );
      setStatus("error");
    }
  }

  const isLoading = status === "loading";

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label htmlFor="content" className="text-sm font-medium">
              Email ou texte à analyser
            </label>
            <button
              type="button"
              onClick={() => setContent(SAMPLE_EMAIL)}
              className="text-xs font-medium text-accent hover:text-accent-hover"
            >
              Charger un exemple
            </button>
          </div>
          <textarea
            id="content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={12}
            maxLength={20_000}
            placeholder="Collez ici l'email reçu ou le texte à traiter…"
            className="w-full resize-y rounded-xl border border-border bg-surface p-4 text-sm leading-relaxed shadow-sm outline-none transition-colors placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="question" className="text-sm font-medium">
            Une question précise ? <span className="text-muted">(optionnel)</span>
          </label>
          <input
            id="question"
            type="text"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            maxLength={2_000}
            placeholder="Ex. Quelle est l'échéance demandée ?"
            className="w-full rounded-xl border border-border bg-surface p-3 text-sm shadow-sm outline-none transition-colors placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground shadow-sm transition-all hover:bg-accent-hover hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {isLoading ? (
            <>
              <Spinner className="size-4" />
              Analyse en cours…
            </>
          ) : (
            <>
              <SparklesIcon className="size-4" />
              Analyser
            </>
          )}
        </button>

        {error && (
          <p
            role="alert"
            className="rounded-lg border border-danger-border bg-danger-surface px-4 py-3 text-sm text-danger"
          >
            {error}
          </p>
        )}
      </form>

      <div className="lg:min-h-full">
        {analysis ? (
          <AnalysisResults analysis={analysis} />
        ) : (
          <div className="flex h-full min-h-64 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-surface/50 p-8 text-center">
            <span className="bg-accent-soft flex size-12 items-center justify-center rounded-2xl text-accent">
              {isLoading ? (
                <Spinner className="size-5" />
              ) : (
                <SparklesIcon className="size-6" />
              )}
            </span>
            <p className="max-w-xs text-sm text-muted">
              {isLoading
                ? "Le copilote analyse votre texte…"
                : "Le résumé, le brouillon de réponse et les tâches s'afficheront ici."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
