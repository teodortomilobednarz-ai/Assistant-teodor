"use client";

import { useState } from "react";

import { searchDrive, summarizeDoc } from "@/lib/actions/drive";

type DriveFile = Awaited<ReturnType<typeof searchDrive>>["files"][number];

export function DocsWorkspace() {
  const [query, setQuery] = useState("");
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<DriveFile | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [summarizing, setSummarizing] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

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
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un document par nom…"
          className="w-full rounded-xl border border-border bg-surface p-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
        <button
          type="submit"
          disabled={searching || !query.trim()}
          className="shrink-0 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-hover disabled:opacity-50"
        >
          {searching ? "…" : "Rechercher"}
        </button>
      </form>

      {error && <p className="text-sm text-muted">{error}</p>}

      {files.length > 0 && (
        <ul className="flex flex-col gap-2">
          {files.map((file) => (
            <li
              key={file.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm"
            >
              <span className="truncate text-sm font-medium">{file.name}</span>
              <button
                type="button"
                onClick={() => handleSummarize(file)}
                disabled={summarizing && selected?.id === file.id}
                className="shrink-0 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted transition-colors hover:text-foreground disabled:opacity-50"
              >
                {summarizing && selected?.id === file.id ? "…" : "Résumer"}
              </button>
            </li>
          ))}
        </ul>
      )}

      {selected && (
        <section className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
            Résumé · {selected.name}
          </h2>
          {summarizing && <p className="text-sm text-muted">Résumé en cours…</p>}
          {summaryError && <p className="text-sm text-danger">{summaryError}</p>}
          {summary && (
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{summary}</p>
          )}
        </section>
      )}
    </div>
  );
}
