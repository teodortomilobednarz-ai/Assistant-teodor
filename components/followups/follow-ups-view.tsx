"use client";

import { useActionState, useEffect, useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast";
import {
  createFollowUp,
  fetchFollowUps,
  type FollowUpActionState,
} from "@/lib/actions/followups";

type Candidate = Awaited<
  ReturnType<typeof fetchFollowUps>
>["candidates"][number];

const initialState: FollowUpActionState = { ok: false, message: "" };

function recipientName(to: string): string {
  return to.replace(/<[^>]+>/, "").replace(/"/g, "").trim() || to;
}

function FollowUpRow({ candidate }: { candidate: Candidate }) {
  const [state, action, pending] = useActionState(createFollowUp, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.message) {
      toast(state.message, state.ok ? "success" : "error");
    }
  }, [state, toast]);

  return (
    <li className="glow-hover rounded-2xl border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">
            {candidate.subject || "(sans objet)"}
          </p>
          <p className="mt-0.5 text-xs text-muted">
            À {recipientName(candidate.to)} · en attente depuis{" "}
            {candidate.daysWaiting} j
          </p>
          <p className="mt-1 line-clamp-2 text-xs text-muted">
            {candidate.snippet}
          </p>
        </div>

        {state.ok ? (
          <span className="bg-success/15 shrink-0 rounded-full px-2.5 py-1 text-xs font-medium text-success">
            Relance créée ✓
          </span>
        ) : (
          <form action={action} className="shrink-0">
            <input type="hidden" name="threadId" value={candidate.threadId} />
            <input type="hidden" name="to" value={candidate.to} />
            <input type="hidden" name="subject" value={candidate.subject} />
            <input type="hidden" name="context" value={candidate.snippet} />
            <button
              type="submit"
              disabled={pending}
              className="bg-gradient-accent inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5 disabled:opacity-60"
            >
              {pending && <Spinner className="size-3.5" />}
              {pending ? "…" : "Créer une relance"}
            </button>
          </form>
        )}
      </div>
    </li>
  );
}

export function FollowUpsView() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetchFollowUps().then((result) => {
      if (!active) return;
      if (!result.ok) {
        setError(result.error ?? "Erreur");
        setStatus("error");
        return;
      }
      setCandidates(result.candidates);
      setStatus("ready");
    });
    return () => {
      active = false;
    };
  }, []);

  if (status === "loading") {
    return (
      <ul className="flex flex-col gap-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <li
            key={index}
            className="rounded-2xl border border-border bg-surface p-4"
          >
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="mt-2 h-3 w-1/3" />
          </li>
        ))}
      </ul>
    );
  }

  if (status === "error") {
    return (
      <div className="rounded-2xl border border-border bg-surface p-6 text-sm text-muted">
        {error}
      </div>
    );
  }

  if (candidates.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-surface/50 p-10 text-center text-sm text-muted">
        Rien à relancer pour l&apos;instant — vos emails envoyés ont reçu une
        réponse. 🎉
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {candidates.map((candidate) => (
        <FollowUpRow key={candidate.threadId} candidate={candidate} />
      ))}
    </ul>
  );
}
