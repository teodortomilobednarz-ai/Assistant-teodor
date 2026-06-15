import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/");
  }
  const userId = session.user.id;

  const [user, profile] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { onboardedAt: true },
    }),
    prisma.businessProfile.findUnique({ where: { userId } }),
  ]);

  if (user?.onboardedAt) {
    redirect("/dashboard");
  }

  return (
    <OnboardingFlow
      firstName={(session.user.name ?? "").split(" ")[0] ?? ""}
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
  );
}
