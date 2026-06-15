"use server";

import { auth } from "@/auth";
import { summarize } from "@/lib/copilot";
import {
  createDraft,
  findFollowUps,
  type FollowUpCandidate,
} from "@/lib/gmail";
import { getValidGoogleAccessToken, isReconnectError } from "@/lib/google";

export interface FollowUpsResult {
  ok: boolean;
  candidates: FollowUpCandidate[];
  error?: string;
}

export async function fetchFollowUps(): Promise<FollowUpsResult> {
  const session = await auth();
  const userId = session?.user?.id;
  const email = session?.user?.email;
  if (!userId || !email) {
    return { ok: false, candidates: [], error: "Non authentifié." };
  }

  try {
    const accessToken = await getValidGoogleAccessToken(userId);
    const candidates = await findFollowUps(accessToken, email);
    return { ok: true, candidates };
  } catch (error) {
    console.error("[fetchFollowUps] failed:", error);
    return {
      ok: false,
      candidates: [],
      error: isReconnectError(error)
        ? "Reconnecte-toi avec Google (déconnexion → reconnexion) pour accéder à Gmail."
        : "Impossible de charger les relances pour le moment.",
    };
  }
}

export interface FollowUpActionState {
  ok: boolean;
  message: string;
}

export async function createFollowUp(
  _prevState: FollowUpActionState,
  formData: FormData,
): Promise<FollowUpActionState> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return { ok: false, message: "Non authentifié." };
  }

  const threadId = String(formData.get("threadId") ?? "");
  const to = String(formData.get("to") ?? "");
  const subjectRaw = String(formData.get("subject") ?? "");
  const context = String(formData.get("context") ?? "");

  if (!threadId || !to) {
    return { ok: false, message: "Données manquantes." };
  }

  try {
    const accessToken = await getValidGoogleAccessToken(userId);
    const body = await summarize({
      instruction:
        "Tu écris une relance courtoise et brève (3 à 4 phrases maximum) pour relancer poliment un email resté sans réponse. IMPORTANT : écris la relance dans la MÊME LANGUE que l'objet et le dernier message fournis (par ex. anglais → relance en anglais, polonais → en polonais). Ton professionnel, jamais insistant. Ne réécris pas tout l'historique. Termine par une formule de politesse adaptée à la langue. N'invente aucune information.",
      content: `Objet : ${subjectRaw}\nDestinataire : ${to}\nDernier message envoyé (extrait) : ${context}`,
    });

    const subject = subjectRaw.toLowerCase().startsWith("re:")
      ? subjectRaw
      : `Re: ${subjectRaw}`;

    await createDraft(accessToken, { to, subject, body, threadId });
    return {
      ok: true,
      message: "Brouillon de relance créé dans Gmail (non envoyé).",
    };
  } catch (error) {
    console.error("[createFollowUp] failed:", error);
    return {
      ok: false,
      message: isReconnectError(error)
        ? "Reconnecte-toi avec Google."
        : "Impossible de créer la relance. Réessaie dans un instant.",
    };
  }
}
