"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { SparklesIcon } from "@/components/icons";
import { getDailyBrief, type DailyBriefResult } from "@/lib/actions/brief";

const CHIPS: { key: keyof NonNullable<DailyBriefResult["stats"]>; label: string; href: string }[] =
  [
    { key: "unread", label: "non lus", href: "/dashboard/inbox" },
    { key: "events", label: "RDV", href: "/dashboard/agenda" },
    { key: "followups", label: "relances", href: "/dashboard/relances" },
    { key: "tasks", label: "tâches", href: "/dashboard/tasks" },
  ];

export function DailyBrief() {
  const [result, setResult] = useState<DailyBriefResult | null>(null);

  useEffect(() => {
    let active = true;
    getDailyBrief()
      .then((r) => {
        if (active) setResult(r);
      })
      .catch(() => {
        if (active) setResult({ ok: false });
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="card-glow relative overflow-hidden rounded-3xl border border-border bg-surface p-6 shadow-sm">
      <div className="aurora opacity-40" />
      <div className="relative flex items-start gap-3">
        <span className="bg-gradient-accent flex size-10 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm">
          <SparklesIcon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Ma journée
          </h2>

          {result === null ? (
            <div className="mt-2 space-y-2">
              <div className="shimmer h-3 w-5/6 rounded bg-surface-muted" />
              <div className="shimmer h-3 w-2/3 rounded bg-surface-muted" />
            </div>
          ) : (
            <p className="mt-1.5 text-[15px] leading-relaxed text-foreground">
              {result.brief ??
                "Votre brief est momentanément indisponible. Tout reste accessible ci-dessous."}
            </p>
          )}

          {result?.stats &&
            (() => {
              const stats = result.stats;
              return (
                <div className="mt-4 flex flex-wrap gap-2">
                  {CHIPS.map((chip) => (
                    <Link
                      key={chip.key}
                      href={chip.href}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted transition-colors active:scale-95 hover:border-accent/40 hover:text-foreground"
                    >
                      <span className="font-semibold text-foreground">
                        {stats[chip.key]}
                      </span>
                      {chip.label}
                    </Link>
                  ))}
                </div>
              );
            })()}
        </div>
      </div>
    </section>
  );
}
