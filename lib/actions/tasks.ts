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

export async function setTaskDone(formData: FormData): Promise<void> {
  const userId = await requireUserId();
  const taskId = String(formData.get("taskId") ?? "");
  const done = formData.get("done") === "true";

  // Scoped by userId so a user can only ever mutate their own tasks.
  await prisma.task.updateMany({
    where: { id: taskId, userId },
    data: { done },
  });

  revalidatePath("/dashboard/tasks");
}

export async function deleteTask(formData: FormData): Promise<void> {
  const userId = await requireUserId();
  const taskId = String(formData.get("taskId") ?? "");

  await prisma.task.deleteMany({
    where: { id: taskId, userId },
  });

  revalidatePath("/dashboard/tasks");
}

export interface CreatedTask {
  id: string;
  title: string;
  priority: "haute" | "moyenne" | "basse";
  dueDate: string | null;
  done: boolean;
}

export async function createTask(title: string): Promise<CreatedTask | null> {
  const userId = await requireUserId();
  const trimmed = title.trim();
  if (!trimmed) return null;

  const task = await prisma.task.create({
    data: { userId, title: trimmed, priority: "moyenne" },
  });

  revalidatePath("/dashboard/tasks");
  return {
    id: task.id,
    title: task.title,
    priority: task.priority,
    dueDate: task.dueDate,
    done: task.done,
  };
}
