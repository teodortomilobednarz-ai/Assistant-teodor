"use server";

import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function completeOnboarding(formData: FormData): Promise<void> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    redirect("/");
  }

  const companyName = String(formData.get("companyName") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim() || null;
  const siret = String(formData.get("siret") ?? "").trim() || null;

  if (companyName) {
    await prisma.businessProfile.upsert({
      where: { userId },
      create: { userId, companyName, address, siret },
      update: { companyName, address, siret },
    });
  }

  // Onboarding survey (audience insight + marketing attribution).
  const survey = {
    role: String(formData.get("role") ?? "").trim() || null,
    painPoint: String(formData.get("painPoint") ?? "").trim() || null,
    motivation: String(formData.get("motivation") ?? "").trim() || null,
    source: String(formData.get("source") ?? "").trim() || null,
    emailVolume: String(formData.get("emailVolume") ?? "").trim() || null,
  };
  if (Object.values(survey).some(Boolean)) {
    await prisma.onboardingSurvey
      .upsert({
        where: { userId },
        create: { userId, ...survey },
        update: survey,
      })
      .catch((error) => {
        // Never block onboarding on survey persistence.
        console.error("[completeOnboarding] survey failed:", error);
      });
  }

  await prisma.user.update({
    where: { id: userId },
    data: { onboardedAt: new Date() },
  });

  redirect("/dashboard");
}
