"use client";

import { useActionState, useState } from "react";

import { SparklesIcon } from "@/components/icons";
import { Spinner } from "@/components/ui/spinner";
import { createDraftAction, type DraftActionState } from "@/lib/actions/gmail";
import type { Analysis } from "@/lib/schema";

import { AnalysisResults } from "./analysis-results";

interface EmailWorkspaceProps {
  email: {
    id: string;
    threadId: string;
    from: string;
    subject: string;
    body: string;
  };
}

const initialDraftState: DraftActionState = { ok: false, message: "" };

export function EmailWorkspace({ email }: EmailWorkspaceProps) {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [reply, setReply] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [draftState, runDraft, draftPending] = useActionState(
    createDraftAction,
    initialDraftState,
  );

  const replySubject = email.subject.startsWith("Re:")
    ? email.subject
    : `Re: ${email.subject}`;

  async function analyze() {
    setStatus("loading");
    setError(null);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: email.body }),
      });
      const data: unknown = await response.json();
      if (!response.ok) {
        const message =
          typeof data === "object" && data !== null && "error" in data
            ? String((data as { error: unknown }).error)
            : "Une erreur est survenue.";
        throw new Error(message);
      }
      const result = data as Analysis;
      setAnalysis(result);
      setReply(result.suggestedReply);
      setStatus("idle");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Erreur inattendue.");
      setStatus("error");
    }
  }

  const isLoading = status === "loading";

  return (
    <div className="flex flex-col gap-6">
      <article className="animate-fade-up rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <h2 className="text-lg font-semibold">{email.subject || "(sans objet)"}</h2>
        <p className="mt-1 text-sm text-muted">{email.from}</p>
        <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed">
          {email.body}
        </p>
      </article>

      {!analysis && (
        <button
          type="button"
          onClick={analyze}
          disabled={isLoading}
          className="inline-flex w-fit items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground shadow-sm transition-all hover:bg-accent-hover hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {isLoading ? (
            <>
              <Spinner className="size-4" />
              Analyse en cours…
            </>
          ) : (
            <>
              <SparklesIcon className="size-4" />
              Analyser et préparer une réponse
            </>
          )}
        </button>
      )}

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-danger-border bg-danger-surface px-4 py-3 text-sm text-danger"
        >
          {error}
        </p>
      )}

      {analysis && (
        <>
          <AnalysisResults analysis={analysis} hideReply />

          <section className="rounded-xl border border-border bg-surface p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
              Brouillon de réponse
            </h3>
            <textarea
              value={reply}
              onChange={(event) => setReply(event.target.value)}
              rows={10}
              className="w-full resize-y rounded-lg border border-border bg-surface-muted p-4 text-sm leading-relaxed outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            />

            <form action={runDraft} className="mt-3 flex flex-wrap items-center gap-3">
              <input type="hidden" name="to" value={email.from} />
              <input type="hidden" name="subject" value={replySubject} />
              <input type="hidden" name="threadId" value={email.threadId} />
              <input type="hidden" name="body" value={reply} />
              <button
                type="submit"
                disabled={draftPending || !reply.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground shadow-sm transition-colors hover:bg-accent-hover disabled:opacity-50"
              >
                {draftPending && <Spinner className="size-4" />}
                {draftPending ? "Création…" : "Créer le brouillon dans Gmail"}
              </button>
              {draftState.message && (
                <span
                  className={`text-sm ${
                    draftState.ok ? "text-emerald-600" : "text-danger"
                  }`}
                >
                  {draftState.message}
                </span>
              )}
            </form>
            <p className="mt-2 text-xs text-muted">
              Le brouillon est créé dans Gmail mais <strong>jamais envoyé</strong>{" "}
              — vous gardez le contrôle.
            </p>
          </section>
        </>
      )}
    </div>
  );
}
