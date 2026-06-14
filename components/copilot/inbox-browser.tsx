"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { SearchIcon, XIcon } from "@/components/icons";
import {
  fetchInbox,
  type InboxFilter,
  type InboxResult,
} from "@/lib/actions/inbox";
import type { GmailSummary } from "@/lib/gmail";

const FILTERS: { id: InboxFilter; label: string }[] = [
  { id: "all", label: "Tous" },
  { id: "unread", label: "Non lus" },
  { id: "read", label: "Lus" },
  { id: "today", label: "Aujourd'hui" },
  { id: "week", label: "Cette semaine" },
  { id: "attachment", label: "Pièce jointe" },
];

/** "Camille Durand <x@y.com>" → "Camille Durand". */
function senderName(from: string): string {
  return from.replace(/<[^>]+>/, "").replace(/"/g, "").trim() || from;
}

/** Compact, locale-aware date: time today, day+month otherwise. */
function formatDate(raw: string): string {
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return "";
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  if (sameDay) {
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  const sameYear = date.getFullYear() === now.getFullYear();
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}

interface InboxBrowserProps {
  initial: InboxResult;
}

export function InboxBrowser({ initial }: InboxBrowserProps) {
  const [messages, setMessages] = useState<GmailSummary[]>(initial.messages);
  const [nextPageToken, setNextPageToken] = useState(initial.nextPageToken);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<InboxFilter>("all");
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(initial.error ?? null);

  // A token to discard stale responses when the query changes mid-flight.
  const requestId = useRef(0);

  const runQuery = useCallback(
    async (nextSearch: string, nextFilter: InboxFilter) => {
      const id = ++requestId.current;
      setLoading(true);
      setError(null);
      const result = await fetchInbox({
        search: nextSearch,
        filter: nextFilter,
      });
      if (id !== requestId.current) return; // a newer query superseded us
      setMessages(result.messages);
      setNextPageToken(result.nextPageToken);
      setError(result.error ?? null);
      setLoading(false);
    },
    [],
  );

  // Debounce free-text search.
  useEffect(() => {
    const handle = setTimeout(() => {
      void runQuery(search, filter);
    }, 350);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  function selectFilter(next: InboxFilter) {
    setFilter(next);
    void runQuery(search, next);
  }

  const loadMore = useCallback(async () => {
    if (!nextPageToken || loadingMore) return;
    const id = requestId.current;
    setLoadingMore(true);
    const result = await fetchInbox({
      search,
      filter,
      pageToken: nextPageToken,
    });
    if (id !== requestId.current) return; // query changed while paging
    setMessages((prev) => [...prev, ...result.messages]);
    setNextPageToken(result.nextPageToken);
    setLoadingMore(false);
  }, [nextPageToken, loadingMore, search, filter]);

  // Infinite scroll: observe a sentinel near the bottom of the list.
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void loadMore();
      },
      { rootMargin: "400px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Rechercher dans toute la boîte (expéditeur, objet, mots-clés…)"
          className="w-full rounded-xl border border-border bg-surface py-2.5 pl-10 pr-10 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
          aria-label="Rechercher des emails"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-foreground"
            aria-label="Effacer la recherche"
          >
            <XIcon className="size-4" />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map(({ id, label }) => {
          const active = filter === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => selectFilter(id)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                active
                  ? "border-accent/50 bg-accent-soft text-accent"
                  : "border-border bg-surface text-muted hover:text-foreground"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* List */}
      {error ? (
        <div className="rounded-2xl border border-border bg-surface p-6 text-sm text-muted shadow-sm">
          {error}
        </div>
      ) : loading ? (
        <InboxSkeleton />
      ) : messages.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-surface/50 p-10 text-center">
          <span className="bg-accent-soft flex size-12 items-center justify-center rounded-2xl text-accent">
            <SearchIcon className="size-6" />
          </span>
          <p className="text-sm text-muted">
            {search || filter !== "all"
              ? "Aucun email ne correspond à cette recherche."
              : "Aucun email dans la boîte de réception."}
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {messages.map((message) => (
            <EmailRow key={message.id} message={message} />
          ))}
        </ul>
      )}

      {/* Infinite-scroll sentinel + loader */}
      {!loading && nextPageToken && (
        <div ref={sentinelRef} className="py-2">
          {loadingMore && <InboxSkeleton rows={3} />}
        </div>
      )}
    </div>
  );
}

function EmailRow({ message }: { message: GmailSummary }) {
  const name = senderName(message.from);
  return (
    <li className="animate-fade-up">
      <Link
        href={`/dashboard/inbox/${message.id}`}
        className={`group flex items-start gap-3 rounded-2xl border p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-md ${
          message.unread
            ? "border-accent/30 bg-accent-soft/40"
            : "border-border bg-surface"
        }`}
      >
        <span
          className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
            message.unread
              ? "bg-gradient-accent text-white"
              : "bg-accent-soft text-accent"
          }`}
        >
          {(name || "?").charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3">
            <span
              className={`truncate text-sm ${
                message.unread ? "font-bold" : "font-semibold"
              }`}
            >
              {name}
            </span>
            <span className="shrink-0 text-xs text-muted">
              {formatDate(message.date)}
            </span>
          </div>
          <div className="mt-0.5 flex items-center gap-2">
            {message.unread && (
              <span className="shrink-0 rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-foreground">
                Non lu
              </span>
            )}
            <p
              className={`truncate text-sm ${
                message.unread ? "font-semibold" : ""
              }`}
            >
              {message.subject || "(sans objet)"}
            </p>
          </div>
          <p className="mt-1 line-clamp-2 text-xs text-muted">
            {message.snippet}
          </p>
        </div>
      </Link>
    </li>
  );
}

function InboxSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <ul className="flex flex-col gap-2" aria-hidden>
      {Array.from({ length: rows }).map((_, index) => (
        <li
          key={index}
          className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-4"
        >
          <span className="size-9 shrink-0 animate-pulse rounded-full bg-surface-muted" />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <span className="h-3.5 w-1/3 animate-pulse rounded bg-surface-muted" />
            <span className="h-3 w-2/3 animate-pulse rounded bg-surface-muted" />
            <span className="h-3 w-1/2 animate-pulse rounded bg-surface-muted" />
          </div>
        </li>
      ))}
    </ul>
  );
}
