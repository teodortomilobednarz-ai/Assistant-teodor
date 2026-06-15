import Link from "next/link";

import { auth } from "@/auth";
import { EmailWorkspace } from "@/components/copilot/email-workspace";
import { EmailActions } from "@/components/inbox/email-actions";
import { getMessage, markAsRead, type GmailMessage } from "@/lib/gmail";
import { getValidGoogleAccessToken } from "@/lib/google";

export const dynamic = "force-dynamic";

export default async function EmailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const userId = session!.user.id;

  let email: GmailMessage | null = null;
  let errorMessage: string | null = null;

  try {
    const accessToken = await getValidGoogleAccessToken(userId);
    email = await getMessage(accessToken, id);
    // Mark read on open (best-effort).
    await markAsRead(accessToken, id).catch(() => {});
  } catch (error) {
    console.error("[inbox/email] failed to load:", error);
    errorMessage = "Impossible de charger cet email pour le moment.";
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/dashboard/inbox"
          className="text-sm font-medium text-muted transition-colors hover:text-foreground"
        >
          ← Retour à la boîte
        </Link>
        {email && <EmailActions id={id} />}
      </div>

      {email ? (
        <EmailWorkspace email={email} />
      ) : (
        <div className="rounded-xl border border-border bg-surface p-6 text-sm text-muted">
          {errorMessage}
        </div>
      )}
    </main>
  );
}
