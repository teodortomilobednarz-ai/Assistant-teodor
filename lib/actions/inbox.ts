"use server";

import { auth } from "@/auth";
import {
  archiveMessage,
  listMessages,
  markUnread,
  type GmailSummary,
} from "@/lib/gmail";
import { getValidGoogleAccessToken, isReconnectError } from "@/lib/google";

const FILTER_QUERIES: Record<string, string> = {
  all: "in:inbox",
  unread: "is:unread",
  read: "is:read",
  today: "newer_than:1d",
  week: "newer_than:7d",
  attachment: "has:attachment",
};

/**
 * Builds a Gmail search query. A free-text search alone spans the whole
 * mailbox (so old emails are reachable); a filter scopes results; combined,
 * both apply.
 */
function buildQuery(filter: string, search: string): string {
  const parts: string[] = [];
  if (filter && filter !== "all") {
    parts.push(FILTER_QUERIES[filter] ?? "in:inbox");
  }
  const term = search.trim();
  if (term) parts.push(term);
  if (parts.length === 0) parts.push("in:inbox");
  return parts.join(" ");
}

export interface InboxResult {
  ok: boolean;
  messages: GmailSummary[];
  nextPageToken?: string;
  error?: string;
}

export async function fetchInbox(
  filter: string,
  search: string,
  pageToken?: string,
): Promise<InboxResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return { ok: false, messages: [], error: "Non authentifié." };
  }

  try {
    const accessToken = await getValidGoogleAccessToken(userId);
    const page = await listMessages(accessToken, {
      q: buildQuery(filter, search),
      pageToken,
      maxResults: 25,
    });
    return {
      ok: true,
      messages: page.messages,
      nextPageToken: page.nextPageToken,
    };
  } catch (error) {
    console.error("[fetchInbox] failed:", error);
    return {
      ok: false,
      messages: [],
      error: isReconnectError(error)
        ? "Reconnecte-toi avec Google (déconnexion → reconnexion) pour accéder à Gmail."
        : "Impossible de charger les emails pour le moment.",
    };
  }
}

export interface MailActionState {
  ok: boolean;
  message: string;
}

async function mailAction(
  id: string,
  fn: (token: string, id: string) => Promise<void>,
  okMessage: string,
): Promise<MailActionState> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, message: "Non authentifié." };
  try {
    const accessToken = await getValidGoogleAccessToken(userId);
    await fn(accessToken, id);
    return { ok: true, message: okMessage };
  } catch (error) {
    console.error("[mailAction] failed:", error);
    return {
      ok: false,
      message: isReconnectError(error)
        ? "Reconnecte-toi avec Google."
        : "Action impossible pour le moment.",
    };
  }
}

export async function archiveEmail(id: string): Promise<MailActionState> {
  return mailAction(id, archiveMessage, "Email archivé.");
}

export async function markEmailUnread(id: string): Promise<MailActionState> {
  return mailAction(id, markUnread, "Marqué comme non lu.");
}
