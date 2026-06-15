"use server";

import { headers } from "next/headers";

import { auth } from "@/auth";
import { listUpcomingEvents } from "@/lib/calendar";
import { summarize } from "@/lib/copilot";
import { searchFiles } from "@/lib/drive";
import { listMessages } from "@/lib/gmail";
import { getValidGoogleAccessToken, isReconnectError } from "@/lib/google";

export interface AssistantAnswer {
  ok: boolean;
  answer?: string;
  sources?: { emails: number; events: number; files: number };
  error?: string;
}

async function ownerLanguage(): Promise<string> {
  const h = await headers();
  const accept = h.get("accept-language") ?? "";
  return accept.split(",")[0]?.split(";")[0]?.trim() || "fr";
}

/**
 * Answers a natural-language question using the user's own data — emails,
 * calendar and Drive documents — and replies in their language. Read-only.
 */
export async function askAssistant(query: string): Promise<AssistantAnswer> {
  const trimmed = query.trim();
  if (!trimmed) return { ok: true };

  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, error: "Non authentifié." };

  try {
    const token = await getValidGoogleAccessToken(userId);

    const [page, events, files] = await Promise.all([
      listMessages(token, { q: trimmed, maxResults: 8 }).catch(() => ({
        messages: [],
        nextPageToken: undefined,
      })),
      listUpcomingEvents(token, 25).catch(() => []),
      searchFiles(token, trimmed, 8).catch(() => []),
    ]);

    const emailLines = page.messages.map(
      (m) =>
        `- De ${m.from} — "${m.subject || "(sans objet)"}" (${m.date}) : ${m.snippet}`,
    );
    const eventLines = events.map(
      (e) => `- ${e.summary} (${e.allDay ? "journée" : e.start})`,
    );
    const fileLines = files.map((f) => `- ${f.name}`);

    const context = [
      "EMAILS PERTINENTS :",
      emailLines.length ? emailLines.join("\n") : "(aucun)",
      "",
      "AGENDA À VENIR :",
      eventLines.length ? eventLines.join("\n") : "(aucun)",
      "",
      "DOCUMENTS (noms) :",
      fileLines.length ? fileLines.join("\n") : "(aucun)",
    ].join("\n");

    const lang = await ownerLanguage();
    const answer = await summarize({
      instruction: `Tu es l'assistant d'un dirigeant de PME. Réponds à la question de l'utilisateur en t'appuyant UNIQUEMENT sur le contexte fourni (ses emails, son agenda, ses documents). Réponds dans la langue dont le code est "${lang}" (français si indéterminé), de façon directe et concise. Si l'information n'est pas dans le contexte, dis-le clairement et suggère où chercher. N'invente jamais.`,
      content: `Question : ${trimmed}\n\n${context}`,
    });

    return {
      ok: true,
      answer,
      sources: {
        emails: page.messages.length,
        events: events.length,
        files: files.length,
      },
    };
  } catch (error) {
    console.error("[askAssistant] failed:", error);
    return {
      ok: false,
      error: isReconnectError(error)
        ? "Reconnecte-toi avec Google pour que l'assistant accède à tes données."
        : "Recherche impossible pour le moment. Réessaie dans un instant.",
    };
  }
}
