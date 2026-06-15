"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export interface ProfileState {
  ok: boolean;
  message: string;
}

export async function saveProfile(
  _prevState: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return { ok: false, message: "Non authentifié." };
  }

  const companyName = String(formData.get("companyName") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim() || null;
  const siret = String(formData.get("siret") ?? "").trim() || null;

  if (!companyName) {
    return { ok: false, message: "Le nom de l'entreprise est requis." };
  }

  await prisma.businessProfile.upsert({
    where: { userId },
    create: { userId, companyName, address, siret },
    update: { companyName, address, siret },
  });

  revalidatePath("/dashboard/settings");
  return { ok: true, message: "Réglages enregistrés." };
}
