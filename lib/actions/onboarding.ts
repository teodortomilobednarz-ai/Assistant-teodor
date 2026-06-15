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

  await prisma.user.update({
    where: { id: userId },
    data: { onboardedAt: new Date() },
  });

  redirect("/dashboard");
}
