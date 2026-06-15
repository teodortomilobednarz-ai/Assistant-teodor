import { auth } from "@/auth";
import { PageHeader } from "@/components/dashboard/page-header";
import { ChecksIcon } from "@/components/icons";
import { TaskList } from "@/components/tasks/task-list";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [active, history] = await Promise.all([
    prisma.task.findMany({
      where: { userId, done: false },
      orderBy: { createdAt: "desc" },
    }),
    prisma.task.findMany({
      where: { userId, done: true },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
      <PageHeader
        icon={ChecksIcon}
        title="Tâches"
        description={
          active.length > 0
            ? `${active.length} tâche${active.length > 1 ? "s" : ""} en cours`
            : "Aucune tâche en cours"
        }
      />

      <TaskList
        active={active.map((task) => ({
          id: task.id,
          title: task.title,
          priority: task.priority,
          dueDate: task.dueDate,
          done: task.done,
        }))}
        history={history.map((task) => ({
          id: task.id,
          title: task.title,
          priority: task.priority,
          dueDate: task.dueDate,
          done: task.done,
        }))}
      />
    </main>
  );
}
