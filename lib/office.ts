import "server-only";

import AdmZip from "adm-zip";
import mammoth from "mammoth";
import * as XLSX from "xlsx";

/**
 * Text extraction for Office documents and archives. These formats can't be
 * read natively by the multimodal model, so we extract their text here and feed
 * that to the LLM. Heavy parsing deps are isolated in this module.
 */

const DOCX =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const XLSX_MIME =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const XLS = "application/vnd.ms-excel";
const PPTX =
  "application/vnd.openxmlformats-officedocument.presentationml.presentation";
const OPENDOC = [
  "application/vnd.oasis.opendocument.text",
  "application/vnd.oasis.opendocument.spreadsheet",
  "application/vnd.oasis.opendocument.presentation",
];
const ARCHIVE = ["application/zip", "application/x-zip-compressed"];

export const OFFICE_MIMES = new Set([DOCX, XLSX_MIME, XLS, PPTX, ...OPENDOC]);
export const ARCHIVE_MIMES = new Set(ARCHIVE);

/** Human label for a file type (used by the UI). */
export function officeLabel(mime: string): string | null {
  if (mime === DOCX) return "Word";
  if (mime === XLSX_MIME || mime === XLS) return "Excel";
  if (mime === PPTX) return "PowerPoint";
  if (mime === OPENDOC[0]) return "Document";
  if (mime === OPENDOC[1]) return "Tableur";
  if (mime === OPENDOC[2]) return "Présentation";
  if (ARCHIVE_MIMES.has(mime)) return "Archive";
  return null;
}

/** Extracts plain text from an Office document or lists an archive's contents. */
export async function extractOfficeText(
  buffer: Buffer,
  mime: string,
): Promise<string> {
  if (mime === DOCX) {
    const { value } = await mammoth.extractRawText({ buffer });
    return value;
  }
  if (mime === XLSX_MIME || mime === XLS) {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    return workbook.SheetNames.map((name) => {
      const csv = XLSX.utils.sheet_to_csv(workbook.Sheets[name]);
      return `# Feuille : ${name}\n${csv}`;
    }).join("\n\n");
  }
  if (mime === PPTX) {
    return extractPptxText(buffer);
  }
  if (OPENDOC.includes(mime)) {
    return extractOpenDocumentText(buffer);
  }
  if (ARCHIVE_MIMES.has(mime)) {
    return listArchive(buffer);
  }
  throw new Error("UNSUPPORTED_FILE_TYPE");
}

function extractPptxText(buffer: Buffer): string {
  const zip = new AdmZip(buffer);
  const slides = zip
    .getEntries()
    .filter((e) => /ppt\/slides\/slide\d+\.xml$/.test(e.entryName))
    .sort((a, b) => a.entryName.localeCompare(b.entryName, undefined, { numeric: true }));

  return slides
    .map((entry, index) => {
      const xml = entry.getData().toString("utf-8");
      const parts = xml.match(/<a:t>([^<]*)<\/a:t>/g) ?? [];
      const text = parts.map((p) => p.replace(/<\/?a:t>/g, "")).join(" ");
      return `# Diapositive ${index + 1}\n${text}`;
    })
    .join("\n\n");
}

function extractOpenDocumentText(buffer: Buffer): string {
  const zip = new AdmZip(buffer);
  const entry = zip.getEntry("content.xml");
  if (!entry) return "";
  const xml = entry.getData().toString("utf-8");
  return xml
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function listArchive(buffer: Buffer): string {
  const zip = new AdmZip(buffer);
  const names = zip
    .getEntries()
    .filter((e) => !e.isDirectory)
    .map((e) => e.entryName);
  return `Archive contenant ${names.length} fichier(s) :\n${names
    .slice(0, 200)
    .join("\n")}`;
}
