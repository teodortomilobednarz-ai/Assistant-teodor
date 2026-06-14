import { auth } from "@/auth";
import { TaskList, type TaskItem } from "@/components/copilot/task-list";
import { PageHeader } from "@/components/dashboard/page-header";
import { ChecksIcon } from "@/components/icons";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const session = await auth();
  const userId = session!.user.id;

  const rows = await prisma.task.findMany({
    where: { userId },
    orderBy: [{ done: "asc" }, { createdAt: "desc" }],
  });

  const tasks: TaskItem[] = rows.map((task) => ({
    id: task.id,
    title: task.title,
    priority: task.priority,
    dueDate: task.dueDate,
    done: task.done,
  }));

  const openCount = tasks.filter((task) => !task.done).length;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-10">
      <PageHeader
        icon={ChecksIcon}
        title="Tâches"
        description={
          openCount > 0
            ? `${openCount} tâche${openCount > 1 ? "s" : ""} à faire.`
            : "Aucune tâche en cours."
        }
      />
      <TaskList tasks={tasks} />
    </main>
  );
}
