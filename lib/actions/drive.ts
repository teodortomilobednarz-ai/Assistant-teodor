"use server";

import { auth } from "@/auth";
import { summarizeDocument } from "@/lib/copilot";
import {
  getFileContent,
  listRecentFiles,
  searchFiles,
  type DriveFile,
} from "@/lib/drive";
import { getValidGoogleAccessToken, isReconnectError } from "@/lib/google";

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
    return {
      ok: false,
      files: [],
      error: isReconnectError(error)
        ? "Reconnecte-toi avec Google (déconnexion → reconnexion) pour autoriser Drive."
        : "Recherche impossible pour le moment.",
    };
  }
}

export async function listRecentDocs(): Promise<DriveSearchResult> {
  try {
    const accessToken = await requireToken();
    const files = await listRecentFiles(accessToken);
    return { ok: true, files };
  } catch (error) {
    console.error("[listRecentDocs] failed:", error);
    return {
      ok: false,
      files: [],
      error: isReconnectError(error)
        ? "Reconnecte-toi avec Google (déconnexion → reconnexion) pour autoriser Drive."
        : "Impossible de charger les documents pour le moment.",
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
    const content = await getFileContent(accessToken, fileId, mimeType);

    if (content.kind === "text" && !content.text.trim()) {
      return { ok: false, error: "Ce document est vide." };
    }

    const summary = await summarizeDocument(content);
    return { ok: true, summary };
  } catch (error) {
    console.error("[summarizeDoc] failed:", error);
    const code = error instanceof Error ? error.message : "";
    if (code === "UNSUPPORTED_FILE_TYPE") {
      return {
        ok: false,
        error: "Ce type de fichier n'est pas pris en charge.",
      };
    }
    if (code === "FILE_TOO_LARGE") {
      return {
        ok: false,
        error: "Ce fichier est trop volumineux pour être analysé (max 50 Mo).",
      };
    }
    if (code === "MEDIA_PROCESSING_FAILED") {
      return {
        ok: false,
        error: "Ce média n'a pas pu être traité. Réessaie dans un instant.",
      };
    }
    if (isReconnectError(error)) {
      return {
        ok: false,
        error:
          "Reconnecte-toi avec Google (déconnexion → reconnexion) pour autoriser Drive.",
      };
    }
    return { ok: false, error: "Résumé impossible pour le moment." };
  }
}
