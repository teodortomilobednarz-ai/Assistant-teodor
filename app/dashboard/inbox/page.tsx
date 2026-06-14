import Link from "next/link";

import { auth } from "@/auth";
import { PageHeader } from "@/components/dashboard/page-header";
import { MailIcon } from "@/components/icons";
import { listRecentMessages, type GmailSummary } from "@/lib/gmail";
import { getValidGoogleAccessToken } from "@/lib/google";

export const dynamic = "force-dynamic";

function friendlyError(error: unknown): string {
  const code = error instanceof Error ? error.message : "";
  if (code === "NO_GOOGLE_ACCOUNT" || code === "NO_REFRESH_TOKEN") {
    return "Pour accéder à Gmail, déconnecte-toi puis reconnecte-toi avec Google afin d'autoriser l'accès à ta boîte.";
  }
  return "Impossible de charger la boîte de réception pour le moment.";
}

/** "Camille Durand <x@y.com>" → "Camille Durand". */
function senderName(from: string): string {
  return from.replace(/<[^>]+>/, "").replace(/"/g, "").trim() || from;
}

export default async function InboxPage() {
  const session = await auth();
  const userId = session!.user.id;

  let messages: GmailSummary[] = [];
  let errorMessage: string | null = null;

  try {
    const accessToken = await getValidGoogleAccessToken(userId);
    messages = await listRecentMessages(accessToken);
  } catch (error) {
    console.error("[inbox] failed to load:", error);
    errorMessage = friendlyError(error);
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-10">
      <PageHeader
        icon={MailIcon}
        title="Boîte de réception"
        description="Ouvre un email pour le résumer et préparer une réponse."
      />

      {errorMessage ? (
        <div className="rounded-2xl border border-border bg-surface p-6 text-sm text-muted shadow-sm">
          {errorMessage}
        </div>
      ) : messages.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-surface/50 p-10 text-center">
          <span className="bg-accent-soft flex size-12 items-center justify-center rounded-2xl text-accent">
            <MailIcon className="size-6" />
          </span>
          <p className="text-sm text-muted">
            Aucun email récent dans la boîte de réception.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {messages.map((message) => {
            const name = senderName(message.from);
            return (
              <li key={message.id} className="animate-fade-up">
                <Link
                  href={`/dashboard/inbox/${message.id}`}
                  className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-md"
                >
                  <span className="bg-accent-soft mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-accent">
                    {(name || "?").charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="truncate text-sm font-semibold">
                        {name}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-sm">
                      {message.subject || "(sans objet)"}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs text-muted">
                      {message.snippet}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
