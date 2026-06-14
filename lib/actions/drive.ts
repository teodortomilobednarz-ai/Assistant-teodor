"use server";

import { auth } from "@/auth";
import { summarize } from "@/lib/copilot";
import { getDocumentText, searchFiles, type DriveFile } from "@/lib/drive";
import { getValidGoogleAccessToken } from "@/lib/google";

async function requireToken(): Promise<string> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("NOT_AUTHENTICATED");
  return getValidGoogleAccessToken(userId);
}

export interface DriveSearchResult {
  ok: boolean;
  files: DriveFile[];
  error?: string;
}

export async function searchDrive(query: string): Promise<DriveSearchResult> {
  const trimmed = query.trim();
  if (!trimmed) {
    return { ok: true, files: [] };
  }

  try {
    const accessToken = await requireToken();
    const files = await searchFiles(accessToken, trimmed);
    return { ok: true, files };
  } catch (error) {
    console.error("[searchDrive] failed:", error);
    const code = error instanceof Error ? error.message : "";
    const reconnect = code === "NO_GOOGLE_ACCOUNT" || code === "NO_REFRESH_TOKEN";
    return {
      ok: false,
      files: [],
      error: reconnect
        ? "Reconnecte ton compte Google pour autoriser Drive."
        : "Recherche impossible pour le moment.",
    };
  }
}

export interface DocSummaryResult {
  ok: boolean;
  summary?: string;
  error?: string;
}

export async function summarizeDoc(
  fileId: string,
  mimeType: string,
): Promise<DocSummaryResult> {
  try {
    const accessToken = await requireToken();
    const text = await getDocumentText(accessToken, fileId, mimeType);

    if (!text.trim()) {
      return { ok: false, error: "Ce document est vide." };
    }

    const summary = await summarize({
      instruction:
        "Tu es un assistant pour dirigeant de PME. Résume ce document en français : 3-5 phrases pour l'essentiel, puis les points clés en puces. Sois clair et concis.",
      content: text.slice(0, 20_000),
    });

    return { ok: true, summary };
  } catch (error) {
    console.error("[summarizeDoc] failed:", error);
    const code = error instanceof Error ? error.message : "";
    if (code === "UNSUPPORTED_FILE_TYPE") {
      return {
        ok: false,
        error: "Pour l'instant, seuls les Google Docs peuvent être résumés.",
      };
    }
    return { ok: false, error: "Résumé impossible pour le moment." };
  }
}
