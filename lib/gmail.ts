import "server-only";

/**
 * Minimal Gmail REST client (uses fetch with a user access token).
 *
 * Scope: read messages and create drafts. It never sends — creating a draft is
 * deliberate, leaving the user in control of sending.
 */

const GMAIL_API = "https://gmail.googleapis.com/gmail/v1/users/me";

export interface GmailSummary {
  id: string;
  threadId: string;
  from: string;
  subject: string;
  date: string;
  snippet: string;
  unread: boolean;
}

export interface GmailPage {
  messages: GmailSummary[];
  nextPageToken?: string;
}

export interface GmailMessage {
  id: string;
  threadId: string;
  from: string;
  to: string;
  subject: string;
  date: string;
  body: string;
}

interface GmailHeader {
  name: string;
  value: string;
}

interface GmailPayload {
  mimeType?: string;
  headers?: GmailHeader[];
  body?: { data?: string };
  parts?: GmailPayload[];
}

interface GmailMessageResource {
  id: string;
  threadId: string;
  snippet?: string;
  labelIds?: string[];
  payload?: GmailPayload;
}

function header(headers: GmailHeader[] | undefined, name: string): string {
  const found = headers?.find(
    (h) => h.name.toLowerCase() === name.toLowerCase(),
  );
  return found?.value ?? "";
}

function decodeBase64Url(data: string): string {
  return Buffer.from(
    data.replace(/-/g, "+").replace(/_/g, "/"),
    "base64",
  ).toString("utf8");
}

function encodeBase64Url(text: string): string {
  return Buffer.from(text, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/** Recursively extracts a readable text body from a Gmail payload. */
function extractBody(payload: GmailPayload | undefined): string {
  if (!payload) return "";

  if (payload.mimeType === "text/plain" && payload.body?.data) {
    return decodeBase64Url(payload.body.data);
  }

  if (payload.parts) {
    // Prefer a text/plain part, then fall back to stripped HTML.
    const plain = payload.parts.find((p) => p.mimeType === "text/plain");
    if (plain?.body?.data) return decodeBase64Url(plain.body.data);

    for (const part of payload.parts) {
      const nested = extractBody(part);
      if (nested) return nested;
    }

    const html = payload.parts.find((p) => p.mimeType === "text/html");
    if (html?.body?.data) {
      return decodeBase64Url(html.body.data).replace(/<[^>]+>/g, " ");
    }
  }

  if (payload.body?.data) {
    return decodeBase64Url(payload.body.data);
  }

  return "";
}

async function gmailFetch<T>(
  accessToken: string,
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${GMAIL_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Gmail API error ${response.status}: ${detail}`);
  }

  return response.json() as Promise<T>;
}

/**
 * Lists messages for a Gmail search query, one page at a time.
 *
 * The query (`q`) is passed straight to Gmail, so anything the Gmail search box
 * accepts works here — `is:unread`, `newer_than:7d`, `has:attachment`,
 * `from:alice@x.com`, free text — and it searches the *entire* mailbox, so the
 * user can surface emails from months ago instantly. Pagination is cursor-based
 * via `pageToken` (Gmail's `nextPageToken`).
 */
export async function listMessages(
  accessToken: string,
  options: { q?: string; pageToken?: string; maxResults?: number } = {},
): Promise<GmailPage> {
  const params = new URLSearchParams({
    maxResults: String(options.maxResults ?? 25),
    q: options.q?.trim() || "in:inbox",
  });
  if (options.pageToken) params.set("pageToken", options.pageToken);

  const list = await gmailFetch<{
    messages?: { id: string }[];
    nextPageToken?: string;
  }>(accessToken, `/messages?${params.toString()}`);

  if (!list.messages?.length) {
    return { messages: [], nextPageToken: list.nextPageToken };
  }

  const messages = await Promise.all(
    list.messages.map(async ({ id }) => {
      const msg = await gmailFetch<GmailMessageResource>(
        accessToken,
        `/messages/${id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
      );
      return {
        id: msg.id,
        threadId: msg.threadId,
        from: header(msg.payload?.headers, "From"),
        subject: header(msg.payload?.headers, "Subject"),
        date: header(msg.payload?.headers, "Date"),
        snippet: msg.snippet ?? "",
        unread: msg.labelIds?.includes("UNREAD") ?? false,
      };
    }),
  );

  return { messages, nextPageToken: list.nextPageToken };
}

/** Estimated number of messages matching a query (e.g. unread in inbox). */
export async function countMessages(
  accessToken: string,
  q: string,
): Promise<number> {
  const params = new URLSearchParams({ q, maxResults: "1" });
  const data = await gmailFetch<{ resultSizeEstimate?: number }>(
    accessToken,
    `/messages?${params.toString()}`,
  );
  return data.resultSizeEstimate ?? 0;
}

/** Removes the UNREAD label so opening a message marks it as read. */
export async function markMessageRead(
  accessToken: string,
  id: string,
): Promise<void> {
  await gmailFetch(accessToken, `/messages/${id}/modify`, {
    method: "POST",
    body: JSON.stringify({ removeLabelIds: ["UNREAD"] }),
  });
}

export async function getMessage(
  accessToken: string,
  id: string,
): Promise<GmailMessage> {
  const msg = await gmailFetch<GmailMessageResource>(
    accessToken,
    `/messages/${id}?format=full`,
  );

  return {
    id: msg.id,
    threadId: msg.threadId,
    from: header(msg.payload?.headers, "From"),
    to: header(msg.payload?.headers, "To"),
    subject: header(msg.payload?.headers, "Subject"),
    date: header(msg.payload?.headers, "Date"),
    body: extractBody(msg.payload).trim() || (msg.snippet ?? ""),
  };
}

export async function createDraft(
  accessToken: string,
  draft: { to: string; subject: string; body: string; threadId?: string },
): Promise<{ id: string }> {
  const mime = [
    `To: ${draft.to}`,
    `Subject: ${draft.subject}`,
    'Content-Type: text/plain; charset="UTF-8"',
    "",
    draft.body,
  ].join("\r\n");

  const result = await gmailFetch<{ id: string }>(accessToken, "/drafts", {
    method: "POST",
    body: JSON.stringify({
      message: {
        raw: encodeBase64Url(mime),
        ...(draft.threadId ? { threadId: draft.threadId } : {}),
      },
    }),
  });

  return { id: result.id };
}
