import "server-only";

/**
 * Minimal Google Drive REST client (fetch + user access token).
 * Searches files and extracts the text of Google Docs for summarization.
 */

const DRIVE_API = "https://www.googleapis.com/drive/v3";
const GOOGLE_DOC_MIME = "application/vnd.google-apps.document";

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  isGoogleDoc: boolean;
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
  }));
}

/**
 * Returns the plain-text content of a Google Doc. Throws for unsupported file
 * types (the caller should surface a friendly message).
 */
export async function getDocumentText(
  accessToken: string,
  fileId: string,
  mimeType: string,
): Promise<string> {
  if (mimeType !== GOOGLE_DOC_MIME) {
    throw new Error("UNSUPPORTED_FILE_TYPE");
  }

  const response = await fetch(
    `${DRIVE_API}/files/${fileId}/export?mimeType=text/plain`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Drive export error ${response.status}: ${detail}`);
  }

  return response.text();
}
