"use client";

import { useEffect, useState } from "react";

import { FileIcon, SparklesIcon } from "@/components/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { listRecentDocs, searchDrive, summarizeDoc } from "@/lib/actions/drive";

type DriveFile = Awaited<ReturnType<typeof searchDrive>>["files"][number];

/** Short, human label for a Drive file type. */
function fileKind(mimeType: string): string {
  if (mimeType === "application/vnd.google-apps.document") return "Google Doc";
  if (mimeType === "application/vnd.google-apps.spreadsheet") return "Sheet";
  if (mimeType === "application/vnd.google-apps.presentation") return "Slides";
  if (mimeType === "application/vnd.google-apps.folder") return "Dossier";
  if (mimeType === "application/pdf") return "PDF";
  if (
    mimeType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  )
    return "Word";
  if (
    mimeType ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    mimeType === "application/vnd.ms-excel"
  )
    return "Excel";
  if (
    mimeType ===
    "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  )
    return "PowerPoint";
  if (mimeType.startsWith("application/vnd.oasis.opendocument")) return "OpenDocument";
  if (mimeType === "application/zip" || mimeType === "application/x-zip-compressed")
    return "Archive";
  if (mimeType.startsWith("image/")) return "Image";
  if (mimeType.startsWith("video/")) return "Vidéo";
  if (mimeType.startsWith("audio/")) return "Audio";
  return "Fichier";
}

function formatDate(value: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function DocsWorkspace() {
  const [query, setQuery] = useState("");
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<DriveFile | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [summarizing, setSummarizing] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  // Show recent documents by default.
  useEffect(() => {
    let active = true;
    listRecentDocs().then((result) => {
      if (!active) return;
      if (result.ok) setFiles(result.files);
      else setError(result.error ?? null);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  async function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!query.trim()) return;

    setSearching(true);
    setError(null);
    setSelected(null);
    setSummary(null);
    setSummaryError(null);

    const result = await searchDrive(query);
    if (!result.ok) {
      setError(result.error ?? "Recherche impossible.");
      setFiles([]);
    } else {
      setFiles(result.files);
      if (result.files.length === 0) setError("Aucun document trouvé.");
    }
    setSearching(false);
  }

  async function handleSummarize(file: DriveFile) {
    setSelected(file);
    setSummary(null);
    setSummaryError(null);
    setSummarizing(true);

    const result = await summarizeDoc(file.id, file.mimeType);
    if (!result.ok) {
      setSummaryError(result.error ?? "Résumé impossible.");
    } else {
      setSummary(result.summary ?? "");
    }
    setSummarizing(false);
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Capability note — sets expectations, prevents brutal errors. */}
      <div className="bg-accent-soft/60 flex items-start gap-3 rounded-2xl border border-accent/20 p-4">
        <span className="bg-gradient-accent flex size-8 shrink-0 items-center justify-center rounded-lg text-white">
          <SparklesIcon className="size-4" />
        </span>
        <p className="text-sm leading-relaxed text-foreground">
          Draidly lit{" "}
          <strong>
            tous vos fichiers : Google Docs, Word, Excel, PowerPoint, PDF,
            images, audio, vidéos et archives
          </strong>{" "}
          — et en fait un résumé clair.
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un document…"
          className="w-full min-w-0 rounded-xl border border-border bg-surface p-3 text-base outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20 sm:text-sm"
        />
        <button
          type="submit"
          disabled={searching || !query.trim()}
          className="shrink-0 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground transition-colors active:scale-95 hover:bg-accent-hover disabled:opacity-50"
        >
          {searching ? "…" : "Rechercher"}
        </button>
      </form>

      {loading ? (
        <ul className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <li
              key={index}
              className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4"
            >
              <Skeleton className="size-9 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </li>
          ))}
        </ul>
      ) : error ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface/50 p-8 text-center text-sm text-muted">
          {error}
        </div>
      ) : files.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-surface/50 p-10 text-center">
          <span className="bg-accent-soft flex size-12 items-center justify-center rounded-2xl text-accent">
            <FileIcon className="size-6" />
          </span>
          <p className="text-sm text-muted">
            Aucun document pour le moment. Recherchez-en un par son nom.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {files.map((file) => {
            const kind = fileKind(file.mimeType);
            const date = formatDate(file.modifiedTime);
            return (
              <li
                key={file.id}
                className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3.5 shadow-sm transition-colors hover:border-accent/30"
              >
                <span
                  className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${
                    file.summarizable
                      ? "bg-accent-soft text-accent"
                      : "bg-surface-muted text-muted"
                  }`}
                >
                  <FileIcon className="size-4" />
                </span>

                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate text-sm font-medium">
                    {file.name}
                  </span>
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted">
                    <span>{kind}</span>
                    {date && (
                      <>
                        <span aria-hidden>·</span>
                        <span>{date}</span>
                      </>
                    )}
                  </span>
                </div>

                {file.summarizable ? (
                  <button
                    type="button"
                    onClick={() => handleSummarize(file)}
                    disabled={summarizing && selected?.id === file.id}
                    className="shrink-0 rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground transition-colors active:scale-95 hover:bg-accent-hover disabled:opacity-50"
                  >
                    {summarizing && selected?.id === file.id ? "…" : "Résumer"}
                  </button>
                ) : (
                  <span className="shrink-0 rounded-full border border-border bg-surface-muted px-2.5 py-1 text-[10px] font-medium text-muted">
                    Bientôt
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {selected && (
        <section className="card-glow rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted">
            <SparklesIcon className="size-4 text-accent" />
            <span className="truncate">Résumé · {selected.name}</span>
          </h2>
          {summarizing && (
            <div className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
              <Skeleton className="h-3 w-4/6" />
            </div>
          )}
          {summaryError && <p className="text-sm text-danger">{summaryError}</p>}
          {summary && (
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {summary}
            </p>
          )}
        </section>
      )}
    </div>
  );
}
