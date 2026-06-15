"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { SignOutButton } from "@/components/auth/sign-out-button";
import {
  BoltIcon,
  CalendarIcon,
  ChecksIcon,
  FileIcon,
  GearIcon,
  HomeIcon,
  MailIcon,
  MoreIcon,
  ReceiptIcon,
  ReplyIcon,
} from "@/components/icons";

type Item = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
};

// Primary tabs — thumb-reachable, max 5 (ui-ux-pro-max §9 bottom-nav-limit).
const PRIMARY: Item[] = [
  { href: "/dashboard", label: "Accueil", icon: HomeIcon, exact: true },
  { href: "/dashboard/inbox", label: "Emails", icon: MailIcon },
  { href: "/dashboard/agenda", label: "Agenda", icon: CalendarIcon },
  { href: "/dashboard/docs", label: "Docs", icon: FileIcon },
];

// Secondary destinations — revealed via the "Plus" sheet.
const MORE: Item[] = [
  { href: "/dashboard/relances", label: "Relances", icon: ReplyIcon },
  { href: "/dashboard/billing", label: "Devis & factures", icon: ReceiptIcon },
  { href: "/dashboard/tasks", label: "Tâches", icon: ChecksIcon },
  { href: "/dashboard/abonnement", label: "Abonnement", icon: BoltIcon },
  { href: "/dashboard/settings", label: "Réglages", icon: GearIcon },
];

function useActive() {
  const pathname = usePathname();
  return (item: Item) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);
}

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const isActive = useActive();
  const moreActive = MORE.some((item) => isActive(item));

  // Lock body scroll while the sheet is open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <>
      {/* Bottom tab bar */}
      <nav
        className="glass fixed inset-x-0 bottom-0 z-30 border-t border-border lg:hidden print:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        aria-label="Navigation principale"
      >
        <div className="mx-auto grid max-w-md grid-cols-5">
          {PRIMARY.map((item) => {
            const active = isActive(item);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors active:scale-95 ${
                  active ? "text-accent" : "text-muted"
                }`}
              >
                <span
                  className={`flex size-9 items-center justify-center rounded-xl transition-colors ${
                    active ? "bg-accent-soft" : ""
                  }`}
                >
                  <Icon className="size-5" />
                </span>
                {item.label}
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={open}
            className={`flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors active:scale-95 ${
              moreActive ? "text-accent" : "text-muted"
            }`}
          >
            <span
              className={`flex size-9 items-center justify-center rounded-xl transition-colors ${
                moreActive ? "bg-accent-soft" : ""
              }`}
            >
              <MoreIcon className="size-5" />
            </span>
            Plus
          </button>
        </div>
      </nav>

      {/* "Plus" sheet */}
      {open && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Plus d'options"
        >
          <button
            type="button"
            aria-label="Fermer"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm animate-[fade-up_.2s_ease]"
          />
          <div className="animate-sheet-up absolute inset-x-0 bottom-0 rounded-t-3xl border-t border-border bg-surface p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-2xl">
            <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-border" />
            <ul className="grid grid-cols-2 gap-2">
              {MORE.map((item) => {
                const active = isActive(item);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 rounded-2xl border p-4 transition-colors active:scale-[0.98] ${
                        active
                          ? "border-accent/40 bg-accent-soft text-accent"
                          : "border-border bg-surface-muted text-foreground"
                      }`}
                    >
                      <span
                        className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${
                          active
                            ? "bg-accent text-accent-foreground"
                            : "bg-surface text-accent"
                        }`}
                      >
                        <Icon className="size-5" />
                      </span>
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="mt-3 border-t border-border pt-3">
              <SignOutButton />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
