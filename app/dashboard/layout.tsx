import Image from "next/image";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { Logo } from "@/components/brand/logo";
import { CommandPalette } from "@/components/dashboard/command-palette";
import { CommandTrigger } from "@/components/dashboard/command-trigger";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { MobileSearchButton } from "@/components/dashboard/mobile-search-button";
import { NavLinks } from "@/components/dashboard/nav-links";
import { prisma } from "@/lib/prisma";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Route protection: unauthenticated visitors are sent to the landing page.
  if (!session?.user) {
    redirect("/");
  }

  // First-run: send new users through onboarding once.
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { onboardedAt: true },
  });
  if (!dbUser?.onboardedAt) {
    redirect("/onboarding");
  }

  const { name, email, image } = session.user;
  const initial = (name ?? email ?? "?").charAt(0).toUpperCase();

  const avatar = image ? (
    <Image
      src={image}
      alt=""
      width={32}
      height={32}
      className="size-8 rounded-full border border-border object-cover"
    />
  ) : (
    <span className="bg-accent-soft flex size-8 items-center justify-center rounded-full text-sm font-semibold text-accent">
      {initial}
    </span>
  );

  return (
    <div className="flex min-h-full">
      {/* Sidebar — desktop */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-surface/40 lg:sticky lg:top-0 lg:flex lg:h-dvh print:hidden">
        <div className="px-5 py-4">
          <Logo />
        </div>
        <div className="px-3 pb-2">
          <CommandTrigger />
        </div>
        <div className="flex-1 px-3">
          <NavLinks vertical />
        </div>
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-3">
            {avatar}
            <p className="min-w-0 flex-1 truncate text-xs text-muted">{email}</p>
          </div>
          <div className="mt-2">
            <SignOutButton />
          </div>
        </div>
      </aside>

      {/* Main column */}
      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="aurora opacity-50 print:hidden" />

        {/* Top bar — mobile */}
        <header className="glass sticky top-0 z-20 flex items-center gap-3 border-b border-border px-4 py-3 lg:hidden print:hidden">
          <Logo />
          <div className="ml-auto">
            <MobileSearchButton />
          </div>
        </header>

        {/* Bottom padding reserves room for the fixed mobile tab bar. */}
        <div className="relative flex flex-1 flex-col pb-24 lg:pb-0">
          {children}
        </div>
      </div>

      <MobileNav />
      <CommandPalette />
    </div>
  );
}
