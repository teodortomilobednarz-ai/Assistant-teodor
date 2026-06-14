"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function requireUserId(): Promise<string> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error("Non authentifié.");
  }
  return userId;
}

/** Marks a task done (it then leaves the active list, into "Historique"). */
export async function completeTask(taskId: string): Promise<void> {
  const userId = await requireUserId();
  // Scoped by userId so a user can only ever mutate their own tasks.
  await prisma.task.updateMany({
    where: { id: taskId, userId },
    data: { done: true },
  });
  revalidatePath("/dashboard/tasks");
  revalidatePath("/dashboard");
}

/** Re-opens a completed task (from the history back into the active list). */
export async function reopenTask(taskId: string): Promise<void> {
  const userId = await requireUserId();
  await prisma.task.updateMany({
    where: { id: taskId, userId },
    data: { done: false },
  });
  revalidatePath("/dashboard/tasks");
  revalidatePath("/dashboard");
}

/** Permanently deletes a task. */
export async function deleteTask(taskId: string): Promise<void> {
  const userId = await requireUserId();
  await prisma.task.deleteMany({
    where: { id: taskId, userId },
  });
  revalidatePath("/dashboard/tasks");
  revalidatePath("/dashboard");
}
