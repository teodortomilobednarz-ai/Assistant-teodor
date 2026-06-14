"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  CalendarIcon,
  ChecksIcon,
  FileIcon,
  MailIcon,
  ReceiptIcon,
  SparklesIcon,
} from "@/components/icons";

const LINKS = [
  { href: "/dashboard", label: "Accueil", icon: SparklesIcon, exact: true },
  { href: "/dashboard/inbox", label: "Boîte", icon: MailIcon },
  { href: "/dashboard/agenda", label: "Agenda", icon: CalendarIcon },
  { href: "/dashboard/docs", label: "Documents", icon: FileIcon },
  { href: "/dashboard/billing", label: "Devis", icon: ReceiptIcon },
  { href: "/dashboard/tasks", label: "Tâches", icon: ChecksIcon },
];

export function NavLinks({ vertical = false }: { vertical?: boolean }) {
  const pathname = usePathname();

  return (
    <nav
      className={
        vertical
          ? "flex flex-col gap-1"
          : "flex items-center gap-1 overflow-x-auto"
      }
    >
      {LINKS.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              vertical ? "w-full" : "py-1.5"
            } ${
              active
                ? "bg-accent-soft text-accent"
                : "text-muted hover:bg-surface-muted hover:text-foreground"
            }`}
          >
            <Icon className="size-4 shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
