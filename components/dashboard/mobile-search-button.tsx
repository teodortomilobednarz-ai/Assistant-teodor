"use client";

import { SearchIcon } from "@/components/icons";

export function MobileSearchButton() {
  return (
    <button
      type="button"
      aria-label="Rechercher"
      onClick={() => window.dispatchEvent(new Event("open-command-palette"))}
      className="flex size-10 items-center justify-center rounded-xl border border-border bg-surface-muted text-muted transition-colors active:scale-95 hover:text-foreground"
    >
      <SearchIcon className="size-5" />
    </button>
  );
}
