"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Logo, LogoMark } from "@/components/brand/logo";
import {
  CalendarIcon,
  ChecksIcon,
  FileIcon,
  HomeIcon,
  MailIcon,
  MenuIcon,
  ReceiptIcon,
  XIcon,
} from "@/components/icons";
import { signOutAction } from "@/lib/actions/auth";

const LINKS = [
  { href: "/dashboard", label: "Copilote", icon: HomeIcon, exact: true },
  { href: "/dashboard/inbox", label: "Boîte", icon: MailIcon },
  { href: "/dashboard/agenda", label: "Agenda", icon: CalendarIcon },
  { href: "/dashboard/docs", label: "Documents", icon: FileIcon },
  { href: "/dashboard/billing", label: "Devis", icon: ReceiptIcon },
  { href: "/dashboard/tasks", label: "Tâches", icon: ChecksIcon },
];

export interface SidebarUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-1 flex-col gap-1">
      {LINKS.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
              active
                ? "bg-accent-soft text-accent shadow-sm"
                : "text-muted hover:bg-surface-muted hover:text-foreground"
            }`}
          >
            <Icon
              className={`size-[18px] transition-transform group-hover:scale-110 ${
                active ? "text-accent" : ""
              }`}
            />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function UserCard({ user }: { user: SidebarUser }) {
  const initial = (user.name ?? user.email ?? "?").charAt(0).toUpperCase();
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-muted/40 p-3">
      {user.image ? (
        <Image
          src={user.image}
          alt=""
          width={36}
          height={36}
          className="size-9 rounded-full border border-border object-cover"
        />
      ) : (
        <span className="bg-accent-soft flex size-9 items-center justify-center rounded-full text-sm font-semibold text-accent">
          {initial}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{user.name ?? "Vous"}</p>
        {user.email && (
          <p className="truncate text-xs text-muted">{user.email}</p>
        )}
      </div>
      <form action={signOutAction}>
        <button
          type="submit"
          aria-label="Se déconnecter"
          className="rounded-lg p-1.5 text-muted transition-colors hover:bg-surface hover:text-danger"
        >
          <XIcon className="size-4" />
        </button>
      </form>
    </div>
  );
}

/** Fixed sidebar on large screens. */
export function DashboardSidebar({ user }: { user: SidebarUser }) {
  return (
    <aside className="glass sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-6 border-r border-border px-4 py-6 lg:flex print:hidden">
      <Link href="/dashboard" className="px-2">
        <Logo />
      </Link>
      <NavList />
      <UserCard user={user} />
    </aside>
  );
}

/** Top bar + slide-in drawer for small screens. */
export function MobileTopBar({ user }: { user: SidebarUser }) {
  const [open, setOpen] = useState(false);

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  return (
    <>
      <header className="glass sticky top-0 z-30 flex items-center justify-between border-b border-border px-4 py-3 lg:hidden print:hidden">
        <Link href="/dashboard">
          <Logo />
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Ouvrir le menu"
          className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
        >
          <MenuIcon className="size-5" />
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Fermer le menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-background/70 backdrop-blur-sm"
          />
          <div className="animate-fade-up absolute right-0 top-0 flex h-full w-72 max-w-[85%] flex-col gap-6 border-l border-border bg-surface px-4 py-6 shadow-xl">
            <div className="flex items-center justify-between">
              <LogoMark className="size-8" />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fermer le menu"
                className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
              >
                <XIcon className="size-5" />
              </button>
            </div>
            <NavList onNavigate={() => setOpen(false)} />
            <UserCard user={user} />
          </div>
        </div>
      )}
    </>
  );
}
