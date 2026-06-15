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

export interface MessagePage {
  messages: GmailSummary[];
  nextPageToken?: string;
}

export interface FollowUpCandidate {
  threadId: string;
  messageId: string;
  to: string;
  subject: string;
  date: string;
  snippet: string;
  daysWaiting: number;
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
 * Lists messages matching a Gmail search query (`q`), with pagination.
 * `q` supports Gmail's full search syntax — `is:unread`, `newer_than:7d`,
 * `has:attachment`, `from:alice@x.com`, free text — across the whole mailbox,
 * so even months-old emails are reachable.
 */
export async function listMessages(
  accessToken: string,
  opts: { q?: string; pageToken?: string; maxResults?: number } = {},
): Promise<MessagePage> {
  const params = new URLSearchParams();
  params.set("maxResults", String(opts.maxResults ?? 25));
  if (opts.q) params.set("q", opts.q);
  if (opts.pageToken) params.set("pageToken", opts.pageToken);

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
        unread: (msg.labelIds ?? []).includes("UNREAD"),
      };
    }),
  );

  return { messages, nextPageToken: list.nextPageToken };
}

/** Lightweight count of messages matching a query (uses resultSizeEstimate). */
export async function countMessages(
  accessToken: string,
  q: string,
): Promise<number> {
  const data = await gmailFetch<{ resultSizeEstimate?: number }>(
    accessToken,
    `/messages?maxResults=1&q=${encodeURIComponent(q)}`,
  );
  return data.resultSizeEstimate ?? 0;
}

/**
 * Finds sent emails awaiting a reply: recent threads whose last message was
 * sent by the user and that have gone quiet for 3+ days — i.e. good follow-up
 * candidates.
 */
export async function findFollowUps(
  accessToken: string,
  userEmail: string,
  maxThreads = 12,
): Promise<FollowUpCandidate[]> {
  const list = await gmailFetch<{ messages?: { threadId: string }[] }>(
    accessToken,
    `/messages?maxResults=40&q=${encodeURIComponent("in:sent newer_than:45d")}`,
  );

  const threadIds = Array.from(
    new Set((list.messages ?? []).map((m) => m.threadId)),
  ).slice(0, maxThreads);

  const email = userEmail.toLowerCase();
  const candidates: FollowUpCandidate[] = [];

  await Promise.all(
    threadIds.map(async (threadId) => {
      const thread = await gmailFetch<{ messages?: GmailMessageResource[] }>(
        accessToken,
        `/threads/${threadId}?format=metadata&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Subject&metadataHeaders=Date`,
      );
      const msgs = thread.messages ?? [];
      if (msgs.length === 0) return;

      const last = msgs[msgs.length - 1];
      const lastFrom = header(last.payload?.headers, "From").toLowerCase();
      // Awaiting reply only if the user sent the most recent message.
      if (!lastFrom.includes(email)) return;

      const dateStr = header(last.payload?.headers, "Date");
      const date = new Date(dateStr);
      const daysWaiting = Number.isNaN(date.getTime())
        ? 0
        : Math.floor((Date.now() - date.getTime()) / 86_400_000);
      if (daysWaiting < 3) return;

      candidates.push({
        threadId,
        messageId: last.id,
        to: header(last.payload?.headers, "To"),
        subject: header(last.payload?.headers, "Subject"),
        date: dateStr,
        snippet: last.snippet ?? "",
        daysWaiting,
      });
    }),
  );

  return candidates.sort((a, b) => b.daysWaiting - a.daysWaiting);
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

/** Removes the UNREAD label so an opened email is marked read. */
export async function markAsRead(
  accessToken: string,
  id: string,
): Promise<void> {
  await gmailFetch(accessToken, `/messages/${id}/modify`, {
    method: "POST",
    body: JSON.stringify({ removeLabelIds: ["UNREAD"] }),
  });
}

/** Re-adds the UNREAD label. */
export async function markUnread(
  accessToken: string,
  id: string,
): Promise<void> {
  await gmailFetch(accessToken, `/messages/${id}/modify`, {
    method: "POST",
    body: JSON.stringify({ addLabelIds: ["UNREAD"] }),
  });
}

/** Removes the INBOX label (archives the message). */
export async function archiveMessage(
  accessToken: string,
  id: string,
): Promise<void> {
  await gmailFetch(accessToken, `/messages/${id}/modify`, {
    method: "POST",
    body: JSON.stringify({ removeLabelIds: ["INBOX"] }),
  });
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

/**
 * Sends an email on the user's behalf (requires the gmail.send scope). Only
 * called in response to an explicit "Send" click in the UI.
 */
export async function sendMessage(
  accessToken: string,
  message: { to: string; subject: string; body: string; threadId?: string },
): Promise<{ id: string }> {
  const mime = [
    `To: ${message.to}`,
    `Subject: ${message.subject}`,
    'Content-Type: text/plain; charset="UTF-8"',
    "",
    message.body,
  ].join("\r\n");

  const result = await gmailFetch<{ id: string }>(accessToken, "/messages/send", {
    method: "POST",
    body: JSON.stringify({
      raw: encodeBase64Url(mime),
      ...(message.threadId ? { threadId: message.threadId } : {}),
    }),
  });

  return { id: result.id };
}
