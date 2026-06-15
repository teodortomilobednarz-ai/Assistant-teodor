"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useToast } from "@/components/ui/toast";
import { archiveEmail, markEmailUnread } from "@/lib/actions/inbox";

const btn =
  "rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:text-foreground disabled:opacity-60";

export function EmailActions({ id }: { id: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  async function unread() {
    setBusy(true);
    const result = await markEmailUnread(id);
    toast(result.message, result.ok ? "success" : "error");
    setBusy(false);
  }

  async function archive() {
    setBusy(true);
    const result = await archiveEmail(id);
    toast(result.message, result.ok ? "success" : "error");
    setBusy(false);
    if (result.ok) router.push("/dashboard/inbox");
  }

  return (
    <div className="flex items-center gap-2">
      <button type="button" onClick={unread} disabled={busy} className={btn}>
        Marquer non lu
      </button>
      <button type="button" onClick={archive} disabled={busy} className={btn}>
        Archiver
      </button>
    </div>
  );
}
