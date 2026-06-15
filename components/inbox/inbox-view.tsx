"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { SearchIcon } from "@/components/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchInbox } from "@/lib/actions/inbox";

type Message = Awaited<ReturnType<typeof fetchInbox>>["messages"][number];

const FILTERS = [
  { key: "all", label: "Tous" },
  { key: "unread", label: "Non lus" },
  { key: "read", label: "Lus" },
  { key: "today", label: "Aujourd'hui" },
  { key: "week", label: "Cette semaine" },
  { key: "attachment", label: "Pièce jointe" },
];

function senderName(from: string): string {
  return from.replace(/<[^>]+>/, "").replace(/"/g, "").trim() || from;
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const sameDay = date.toDateString() === new Date().toDateString();
  return sameDay
    ? date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    : date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export function InboxView() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(search), 350);
    return () => clearTimeout(timer);
  }, [search]);

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);
    const result = await fetchInbox(filter, debounced);
    if (!result.ok) {
      setError(result.error ?? "Erreur");
      setStatus("error");
      setMessages([]);
      setNextPageToken(undefined);
      return;
    }
    setMessages(result.messages);
    setNextPageToken(result.nextPageToken);
    setStatus("ready");
  }, [filter, debounced]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    void load();
  }, [load]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const loadMore = useCallback(async () => {
    if (!nextPageToken || loadingMore) return;
    setLoadingMore(true);
    const result = await fetchInbox(filter, debounced, nextPageToken);
    if (result.ok) {
      setMessages((prev) => [...prev, ...result.messages]);
      setNextPageToken(result.nextPageToken);
    }
    setLoadingMore(false);
  }, [filter, debounced, nextPageToken, loadingMore]);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !nextPageToken) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) void loadMore();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore, nextPageToken]);

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Rechercher dans toute la boîte mail…"
          className="w-full rounded-xl border border-border bg-surface py-2.5 pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((item) => {
          const active = filter === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setFilter(item.key)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                active
                  ? "bg-accent text-accent-foreground"
                  : "border border-border bg-surface text-muted hover:text-foreground"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Results */}
      {status === "loading" ? (
        <ul className="flex flex-col gap-2">
          {Array.from({ length: 8 }).map((_, index) => (
            <li
              key={index}
              className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4"
            >
              <Skeleton className="size-9 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </li>
          ))}
        </ul>
      ) : status === "error" ? (
        <div className="rounded-2xl border border-border bg-surface p-6 text-sm text-muted">
          {error}
        </div>
      ) : messages.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface/50 p-10 text-center text-sm text-muted">
          Aucun email ne correspond.
        </div>
      ) : (
        <>
          <ul className="flex flex-col gap-2">
            {messages.map((message) => {
              const name = senderName(message.from);
              return (
                <li key={message.id}>
                  <Link
                    href={`/dashboard/inbox/${message.id}`}
                    className={`flex items-start gap-3 rounded-2xl border p-4 transition-all hover:-translate-y-0.5 hover:border-accent/40 ${
                      message.unread
                        ? "border-accent/30 bg-accent-soft/60 shadow-sm"
                        : "border-border bg-surface"
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                        message.unread
                          ? "bg-accent text-accent-foreground"
                          : "bg-surface-muted text-muted"
                      }`}
                    >
                      {(name || "?").charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <span
                          className={`truncate text-sm ${
                            message.unread
                              ? "font-semibold text-foreground"
                              : "font-medium text-muted"
                          }`}
                        >
                          {name}
                        </span>
                        <div className="flex shrink-0 items-center gap-2">
                          {message.unread && (
                            <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold text-accent">
                              Non lu
                            </span>
                          )}
                          <span className="text-xs text-muted">
                            {formatDate(message.date)}
                          </span>
                        </div>
                      </div>
                      <p
                        className={`mt-0.5 truncate text-sm ${
                          message.unread ? "font-medium" : ""
                        }`}
                      >
                        {message.subject || "(sans objet)"}
                      </p>
                      <p className="mt-1 line-clamp-1 text-xs text-muted">
                        {message.snippet}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>

          {nextPageToken && (
            <div ref={sentinelRef} className="py-4 text-center text-xs text-muted">
              {loadingMore ? "Chargement…" : ""}
            </div>
          )}
        </>
      )}
    </div>
  );
}
