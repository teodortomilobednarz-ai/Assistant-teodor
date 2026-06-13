"use server";

import { auth } from "@/auth";
import { createDraft } from "@/lib/gmail";
import { getValidGoogleAccessToken } from "@/lib/google";

export interface DraftActionState {
  ok: boolean;
  message: string;
}

/** Extracts a bare email address from a "Name <email>" header value. */
function parseEmailAddress(value: string): string {
  const match = value.match(/<([^>]+)>/);
  return (match ? match[1] : value).trim();
}

/**
 * Creates a Gmail draft reply for the signed-in user. Never sends — the user
 * stays in control of sending from Gmail.
 */
export async function createDraftAction(
  _prevState: DraftActionState,
  formData: FormData,
): Promise<DraftActionState> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return { ok: false, message: "Non authentifié." };
  }

  const to = parseEmailAddress(String(formData.get("to") ?? ""));
  const subject = String(formData.get("subject") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  const threadId = String(formData.get("threadId") ?? "") || undefined;

  if (!to || !body) {
    return { ok: false, message: "Destinataire ou contenu manquant." };
  }

  try {
    const accessToken = await getValidGoogleAccessToken(userId);
    await createDraft(accessToken, { to, subject, body, threadId });
    return { ok: true, message: "Brouillon créé dans Gmail (non envoyé)." };
  } catch (error) {
    console.error("[createDraftAction] failed:", error);
    const code = error instanceof Error ? error.message : "";
    if (code === "NO_GOOGLE_ACCOUNT" || code === "NO_REFRESH_TOKEN") {
      return {
        ok: false,
        message: "Reconnecte ton compte Google pour accéder à Gmail.",
      };
    }
    return {
      ok: false,
      message: "Impossible de créer le brouillon. Réessaie dans un instant.",
    };
  }
}
