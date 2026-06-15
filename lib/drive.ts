import "server-only";

/**
 * Minimal Google Drive REST client (fetch + user access token).
 * Searches files and extracts the text of Google Docs for summarization.
 */

const DRIVE_API = "https://www.googleapis.com/drive/v3";
const GOOGLE_DOC_MIME = "application/vnd.google-apps.document";

/** Google-native types that export cleanly to a text representation. */
const EXPORT_AS_TEXT: Record<string, string> = {
  "application/vnd.google-apps.document": "text/plain",
  "application/vnd.google-apps.presentation": "text/plain",
  "application/vnd.google-apps.spreadsheet": "text/csv",
};

/** Largest file we will download for analysis (Gemini inline limit ~20 MB). */
const MAX_BYTES = 18 * 1024 * 1024;

/**
 * Whether Draidly can currently read/summarize this file:
 * Google Docs/Sheets/Slides (export), PDFs & images (Gemini multimodal),
 * and plain-text formats. Office binaries / video / archives are not yet supported.
 */
export function isSummarizable(mimeType: string): boolean {
  return (
    mimeType in EXPORT_AS_TEXT ||
    mimeType === "application/pdf" ||
    mimeType.startsWith("image/") ||
    mimeType.startsWith("text/") ||
    mimeType === "application/json"
  );
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  isGoogleDoc: boolean;
  summarizable: boolean;
}

interface RawFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
}

export async function searchFiles(
  accessToken: string,
  query: string,
  maxResults = 15,
): Promise<DriveFile[]> {
  // Escape single quotes to keep the Drive query syntax valid.
  const safe = query.replace(/'/g, "\\'");
  const q = `name contains '${safe}' and trashed = false`;
  const params = new URLSearchParams({
    q,
    pageSize: String(maxResults),
    orderBy: "modifiedTime desc",
    fields: "files(id,name,mimeType,modifiedTime)",
  });

  const response = await fetch(`${DRIVE_API}/files?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Drive API error ${response.status}: ${detail}`);
  }

  const data = (await response.json()) as { files?: RawFile[] };
  return (data.files ?? []).map((file) => ({
    id: file.id,
    name: file.name,
    mimeType: file.mimeType,
    modifiedTime: file.modifiedTime ?? "",
    isGoogleDoc: file.mimeType === GOOGLE_DOC_MIME,
    summarizable: isSummarizable(file.mimeType),
  }));
}

/** Lists the most recently modified (non-trashed) files. */
export async function listRecentFiles(
  accessToken: string,
  maxResults = 15,
): Promise<DriveFile[]> {
  const params = new URLSearchParams({
    q: "trashed = false",
    pageSize: String(maxResults),
    orderBy: "modifiedTime desc",
    fields: "files(id,name,mimeType,modifiedTime)",
  });

  const response = await fetch(`${DRIVE_API}/files?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Drive API error ${response.status}: ${detail}`);
  }

  const data = (await response.json()) as { files?: RawFile[] };
  return (data.files ?? []).map((file) => ({
    id: file.id,
    name: file.name,
    mimeType: file.mimeType,
    modifiedTime: file.modifiedTime ?? "",
    isGoogleDoc: file.mimeType === GOOGLE_DOC_MIME,
    summarizable: isSummarizable(file.mimeType),
  }));
}

/**
 * Content ready to hand to the LLM: either extracted text, or raw bytes
 * (base64) for multimodal models (PDF, images).
 */
export type FileContent =
  | { kind: "text"; text: string }
  | { kind: "inline"; mimeType: string; data: string };

/**
 * Fetches a file's content for analysis. Google-native files are exported to
 * text; PDFs and images are downloaded as bytes (read natively by Gemini);
 * plain-text formats are downloaded as UTF-8. Throws UNSUPPORTED_FILE_TYPE for
 * anything Draidly can't yet read (the caller surfaces a friendly message).
 */
export async function getFileContent(
  accessToken: string,
  fileId: string,
  mimeType: string,
): Promise<FileContent> {
  const headers = { Authorization: `Bearer ${accessToken}` };

  // 1) Google-native types → export to a text representation.
  const exportType = EXPORT_AS_TEXT[mimeType];
  if (exportType) {
    const url = `${DRIVE_API}/files/${fileId}/export?mimeType=${encodeURIComponent(exportType)}`;
    const response = await fetch(url, { headers, cache: "no-store" });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(`Drive export error ${response.status}: ${detail}`);
    }
    return { kind: "text", text: await response.text() };
  }

  if (!isSummarizable(mimeType)) {
    throw new Error("UNSUPPORTED_FILE_TYPE");
  }

  // 2) Other readable types → download the raw bytes.
  const response = await fetch(`${DRIVE_API}/files/${fileId}?alt=media`, {
    headers,
    cache: "no-store",
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Drive download error ${response.status}: ${detail}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.byteLength > MAX_BYTES) {
    throw new Error("FILE_TOO_LARGE");
  }

  // Plain-text formats → decode as UTF-8.
  if (mimeType.startsWith("text/") || mimeType === "application/json") {
    return { kind: "text", text: buffer.toString("utf-8") };
  }

  // PDF / images → base64 for the multimodal model.
  return { kind: "inline", mimeType, data: buffer.toString("base64") };
}
