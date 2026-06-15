"use server";

import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * Permanently deletes the signed-in user and all their data. Thanks to the
 * `onDelete: Cascade` relations, removing the User row also removes their
 * Google tokens (Account), sessions, tasks, analyses, business profile and
 * invoices. Required by Google's API Services User Data Policy.
 */
export async function deleteAccount(): Promise<void> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return;

  await prisma.user.delete({ where: { id: userId } }).catch((error) => {
    console.error("[deleteAccount] failed:", error);
    throw error;
  });

  await signOut({ redirectTo: "/" });
}
