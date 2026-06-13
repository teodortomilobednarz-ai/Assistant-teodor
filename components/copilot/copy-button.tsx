"use client";

import { useCallback, useState } from "react";

interface CopyButtonProps {
  value: string;
  label?: string;
}

/** Copies `value` to the clipboard and briefly confirms. */
export function CopyButton({ value, label = "Copier" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2_000);
    } catch {
      // Clipboard can be unavailable (e.g. insecure context); fail silently.
    }
  }, [value]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-muted transition-colors hover:text-foreground hover:border-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      aria-live="polite"
    >
      {copied ? "Copié ✓" : label}
    </button>
  );
}
