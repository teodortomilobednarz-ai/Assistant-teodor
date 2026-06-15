import Image from "next/image";

import { auth } from "@/auth";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { PageHeader } from "@/components/dashboard/page-header";
import { GearIcon, MailIcon } from "@/components/icons";
import { DeleteAccount } from "@/components/settings/delete-account";
import { ProfileForm } from "@/components/settings/profile-form";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default async function SettingsPage() {
  const session = await auth();
  const userId = session!.user.id;
  const { name, email, image } = session!.user;

  const profile = await prisma.businessProfile.findUnique({
    where: { userId },
  });

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
      <PageHeader
        icon={GearIcon}
        title="Réglages"
        description="Votre compte, votre entreprise et vos connexions."
      />

      <Card title="Compte">
        <div className="flex items-center gap-4">
          {image ? (
            <Image
              src={image}
              alt=""
              width={48}
              height={48}
              className="size-12 rounded-full border border-border object-cover"
            />
          ) : (
            <span className="bg-accent-soft flex size-12 items-center justify-center rounded-full text-lg font-semibold text-accent">
              {(name ?? email ?? "?").charAt(0).toUpperCase()}
            </span>
          )}
          <div className="min-w-0">
            {name && <p className="font-medium">{name}</p>}
            <p className="truncate text-sm text-muted">{email}</p>
          </div>
        </div>
      </Card>

      <Card title="Entreprise">
        <ProfileForm
          profile={
            profile
              ? {
                  companyName: profile.companyName,
                  address: profile.address,
                  siret: profile.siret,
                }
              : null
          }
        />
      </Card>

      <Card title="Connexions">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="bg-accent-soft flex size-9 items-center justify-center rounded-lg text-accent">
              <MailIcon className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium">Google</p>
              <p className="truncate text-xs text-muted">
                Connecté · {email}
              </p>
            </div>
          </div>
          <p className="text-xs text-muted">
            Pour rafraîchir les autorisations (Agenda, Drive), déconnectez-vous
            puis reconnectez-vous une fois.
          </p>
          <div>
            <SignOutButton />
          </div>
        </div>
      </Card>

      <Card title="Confidentialité & données">
        <DeleteAccount />
      </Card>
    </main>
  );
}
