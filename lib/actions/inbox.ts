"use server";

import { auth } from "@/auth";
import { listMessages, type GmailSummary } from "@/lib/gmail";
import { getValidGoogleAccessToken } from "@/lib/google";

export type InboxFilter =
  | "all"
  | "unread"
  | "read"
  | "today"
  | "week"
  | "attachment";

export interface InboxQuery {
  search?: string;
  filter?: InboxFilter;
  pageToken?: string;
}

export interface InboxResult {
  messages: GmailSummary[];
  nextPageToken?: string;
  error?: string;
}

/**
 * Builds a Gmail search query from the UI state.
 *
 * - When the user types a search term, we drop the `in:inbox` scope so Gmail
 *   searches the *whole* mailbox (find emails from months ago).
 * - Filters map to native Gmail operators, which run server-side and are fast.
 */
function buildQuery({ search, filter }: InboxQuery): string {
  const parts: string[] = [];
  const term = search?.trim();

  switch (filter) {
    case "unread":
      parts.push("is:unread");
      break;
    case "read":
      parts.push("-is:unread");
      break;
    case "today":
      parts.push("newer_than:1d");
      break;
    case "week":
      parts.push("newer_than:7d");
      break;
    case "attachment":
      parts.push("has:attachment");
      break;
  }

  if (term) {
    parts.push(term);
  } else {
    // No free-text search → stay scoped to the inbox.
    parts.unshift("in:inbox");
  }

  return parts.join(" ") || "in:inbox";
}

function friendlyError(error: unknown): string {
  const code = error instanceof Error ? error.message : "";
  if (code === "NO_GOOGLE_ACCOUNT" || code === "NO_REFRESH_TOKEN") {
    return "Pour accéder à Gmail, déconnecte-toi puis reconnecte-toi avec Google afin d'autoriser l'accès à ta boîte.";
  }
  return "Impossible de charger la boîte de réception pour le moment.";
}

/** Server action used by the inbox browser for search, filtering and paging. */
export async function fetchInbox(query: InboxQuery): Promise<InboxResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return { messages: [], error: "Non authentifié." };
  }

  try {
    const accessToken = await getValidGoogleAccessToken(userId);
    const page = await listMessages(accessToken, {
      q: buildQuery(query),
      pageToken: query.pageToken,
      maxResults: 25,
    });
    return { messages: page.messages, nextPageToken: page.nextPageToken };
  } catch (error) {
    console.error("[fetchInbox] failed:", error);
    return { messages: [], error: friendlyError(error) };
  }
}
