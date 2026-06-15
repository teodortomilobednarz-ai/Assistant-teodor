"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  CalendarIcon,
  ChecksIcon,
  FileIcon,
  GearIcon,
  MailIcon,
  ReceiptIcon,
  ReplyIcon,
  SearchIcon,
  SparklesIcon,
} from "@/components/icons";

const COMMANDS = [
  { label: "Accueil", href: "/dashboard", icon: SparklesIcon },
  { label: "Boîte de réception", href: "/dashboard/inbox", icon: MailIcon },
  { label: "Relances", href: "/dashboard/relances", icon: ReplyIcon },
  { label: "Agenda", href: "/dashboard/agenda", icon: CalendarIcon },
  { label: "Documents", href: "/dashboard/docs", icon: FileIcon },
  { label: "Nouveau devis", href: "/dashboard/billing", icon: ReceiptIcon },
  { label: "Tâches", href: "/dashboard/tasks", icon: ChecksIcon },
  { label: "Réglages", href: "/dashboard/settings", icon: GearIcon },
];

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? COMMANDS.filter((c) => c.label.toLowerCase().includes(q))
      : COMMANDS;
  }, [query]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      } else if (event.key === "Escape") {
        setOpen(false);
      }
    }
    function onOpenEvent() {
      setOpen(true);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-command-palette", onOpenEvent);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-command-palette", onOpenEvent);
    };
  }, []);

  const go = useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router],
  );

  if (!open) return null;

  function onInputKey(event: React.KeyboardEvent) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const target = results[index];
      if (target) go(target.href);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[12vh]"
      role="dialog"
      aria-modal
    >
      <div
        className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />
      <div className="glass animate-fade-up relative w-full max-w-lg overflow-hidden rounded-2xl border border-border shadow-xl">
        <div className="flex items-center gap-2 border-b border-border px-4">
          <SearchIcon className="size-4 shrink-0 text-muted" />
          <input
            autoFocus
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setIndex(0);
            }}
            onKeyDown={onInputKey}
            placeholder="Aller à…"
            className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted"
          />
          <kbd className="rounded border border-border px-1.5 py-0.5 text-[10px] text-muted">
            esc
          </kbd>
        </div>
        <ul className="max-h-72 overflow-y-auto p-2">
          {results.length === 0 ? (
            <li className="px-3 py-6 text-center text-sm text-muted">
              Aucun résultat.
            </li>
          ) : (
            results.map((cmd, i) => {
              const Icon = cmd.icon;
              return (
                <li key={cmd.href}>
                  <button
                    type="button"
                    onMouseEnter={() => setIndex(i)}
                    onClick={() => go(cmd.href)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      i === index
                        ? "bg-accent-soft text-accent"
                        : "hover:bg-surface-muted"
                    }`}
                  >
                    <Icon className="size-4" />
                    {cmd.label}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
}
