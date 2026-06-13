import Link from "next/link";

import { auth } from "@/auth";
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
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Boîte de réception
        </h1>
        <p className="text-sm text-muted">
          Ouvre un email pour le résumer et préparer une réponse.
        </p>
      </div>

      {errorMessage ? (
        <div className="rounded-xl border border-border bg-surface p-6 text-sm text-muted">
          {errorMessage}
        </div>
      ) : messages.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface/50 p-8 text-center text-sm text-muted">
          Aucun email récent dans la boîte de réception.
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {messages.map((message) => (
            <li key={message.id}>
              <Link
                href={`/dashboard/inbox/${message.id}`}
                className="block rounded-xl border border-border bg-surface p-4 shadow-sm transition-colors hover:border-muted"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="truncate text-sm font-medium">
                    {message.from || "(expéditeur inconnu)"}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-sm">
                  {message.subject || "(sans objet)"}
                </p>
                <p className="mt-1 line-clamp-2 text-xs text-muted">
                  {message.snippet}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
