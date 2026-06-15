import "server-only";

import { ARCHIVE_MIMES, extractOfficeText, OFFICE_MIMES } from "./office";

/**
 * Minimal Google Drive REST client (fetch + user access token).
 * Searches files and extracts content of any common format for summarization.
 */

const DRIVE_API = "https://www.googleapis.com/drive/v3";
const GOOGLE_DOC_MIME = "application/vnd.google-apps.document";

/** Google-native types that export cleanly to a text representation. */
const EXPORT_AS_TEXT: Record<string, string> = {
  "application/vnd.google-apps.document": "text/plain",
  "application/vnd.google-apps.presentation": "text/plain",
  "application/vnd.google-apps.spreadsheet": "text/csv",
};

/** Largest file we download into memory for analysis. */
const MAX_BYTES = 50 * 1024 * 1024;

/** True for media the multimodal model reads directly (PDF, image, audio, video). */
function isMedia(mimeType: string): boolean {
  return (
    mimeType === "application/pdf" ||
    mimeType.startsWith("image/") ||
    mimeType.startsWith("audio/") ||
    mimeType.startsWith("video/")
  );
}

function isPlainText(mimeType: string): boolean {
  return mimeType.startsWith("text/") || mimeType === "application/json";
}

/**
 * "Advanced" file types reserved for the Pro plan: Office documents, audio,
 * video and archives. (Google-native docs, PDF, images and text stay available
 * on every plan.)
 */
export function isAdvancedDoc(mimeType: string): boolean {
  return (
    OFFICE_MIMES.has(mimeType) ||
    ARCHIVE_MIMES.has(mimeType) ||
    mimeType.startsWith("audio/") ||
    mimeType.startsWith("video/")
  );
}

/**
 * Whether Draidly can read/summarize this file. Covers Google Docs/Sheets/
 * Slides, Office (Word/Excel/PowerPoint/OpenDocument), PDFs, images, audio,
 * video, plain text and archives — i.e. essentially everything common.
 */
export function isSummarizable(mimeType: string): boolean {
  return (
    mimeType in EXPORT_AS_TEXT ||
    isMedia(mimeType) ||
    isPlainText(mimeType) ||
    OFFICE_MIMES.has(mimeType) ||
    ARCHIVE_MIMES.has(mimeType)
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
 * Content ready to hand to the LLM: extracted text, or raw media bytes
 * (PDF, image, audio, video) read directly by the multimodal model.
 */
export type FileContent =
  | { kind: "text"; text: string }
  | { kind: "media"; mimeType: string; bytes: Buffer };

/**
 * Fetches a file's content for analysis. Google-native files export to text;
 * Office docs & archives are parsed to text; PDFs/images/audio/video download
 * as bytes for the multimodal model; plain text decodes as UTF-8. Throws
 * UNSUPPORTED_FILE_TYPE / FILE_TOO_LARGE for the caller to surface kindly.
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

  // Office documents & archives → extract text.
  if (OFFICE_MIMES.has(mimeType) || ARCHIVE_MIMES.has(mimeType)) {
    return { kind: "text", text: await extractOfficeText(buffer, mimeType) };
  }

  // Plain-text formats → decode as UTF-8.
  if (isPlainText(mimeType)) {
    return { kind: "text", text: buffer.toString("utf-8") };
  }

  // PDF / image / audio / video → raw bytes for the multimodal model.
  return { kind: "media", mimeType, bytes: buffer };
}
