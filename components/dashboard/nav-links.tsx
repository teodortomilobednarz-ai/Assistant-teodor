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
  { href: "/dashboard", label: "Copilote", icon: SparklesIcon, exact: true },
  { href: "/dashboard/inbox", label: "Boîte", icon: MailIcon },
  { href: "/dashboard/agenda", label: "Agenda", icon: CalendarIcon },
  { href: "/dashboard/docs", label: "Documents", icon: FileIcon },
  { href: "/dashboard/billing", label: "Devis", icon: ReceiptIcon },
  { href: "/dashboard/tasks", label: "Tâches", icon: ChecksIcon },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 overflow-x-auto">
      {LINKS.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              active
                ? "bg-accent-soft text-accent"
                : "text-muted hover:bg-surface-muted hover:text-foreground"
            }`}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
