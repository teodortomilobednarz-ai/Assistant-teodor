"use client";

import { SearchIcon } from "@/components/icons";

export function CommandTrigger() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("open-command-palette"))}
      className="flex w-full items-center gap-2 rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm text-muted transition-colors hover:text-foreground"
    >
      <SearchIcon className="size-4" />
      <span className="flex-1 text-left">Rechercher</span>
      <kbd className="rounded border border-border px-1.5 py-0.5 text-[10px]">
        ⌘K
      </kbd>
    </button>
  );
}
