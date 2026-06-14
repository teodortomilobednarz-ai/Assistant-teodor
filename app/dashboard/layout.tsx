import Image from "next/image";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { LogoMark } from "@/components/brand/logo";
import { NavLinks } from "@/components/dashboard/nav-links";

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

  const { name, email, image } = session.user;
  const initial = (name ?? email ?? "?").charAt(0).toUpperCase();

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-20 border-b border-border bg-surface/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-3">
          <div className="flex items-center gap-4">
            <LogoMark className="size-8" />
            <NavLinks />
          </div>
          <div className="flex items-center gap-3">
            {image ? (
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
            )}
            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="relative flex flex-1 flex-col overflow-hidden">
        <div className="aurora opacity-50" />
        <div className="relative flex flex-1 flex-col">{children}</div>
      </div>
    </div>
  );
}
