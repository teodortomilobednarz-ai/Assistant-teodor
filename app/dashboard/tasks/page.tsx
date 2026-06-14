import { auth } from "@/auth";
import { PriorityBadge } from "@/components/copilot/priority-badge";
import { PageHeader } from "@/components/dashboard/page-header";
import { ChecksIcon } from "@/components/icons";
import { deleteTask, setTaskDone } from "@/lib/actions/tasks";
import { prisma } from "@/lib/prisma";

export default async function TasksPage() {
  const session = await auth();
  const userId = session!.user.id;

  const tasks = await prisma.task.findMany({
    where: { userId },
    orderBy: [{ done: "asc" }, { createdAt: "desc" }],
  });

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

      {tasks.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-surface/50 p-10 text-center">
          <span className="bg-accent-soft flex size-12 items-center justify-center rounded-2xl text-accent">
            <ChecksIcon className="size-6" />
          </span>
          <p className="text-sm text-muted">
            Les tâches détectées lors d&apos;une analyse apparaîtront ici.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm transition-colors hover:border-accent/40"
            >
              <div className="flex min-w-0 flex-col gap-1">
                <span
                  className={`truncate text-sm font-medium ${
                    task.done ? "text-muted line-through" : ""
                  }`}
                >
                  {task.title}
                </span>
                <div className="flex items-center gap-2">
                  <PriorityBadge priority={task.priority} />
                  {task.dueDate && (
                    <span className="text-xs text-muted">
                      Échéance : {task.dueDate}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <form action={setTaskDone}>
                  <input type="hidden" name="taskId" value={task.id} />
                  <input
                    type="hidden"
                    name="done"
                    value={task.done ? "false" : "true"}
                  />
                  <button
                    type="submit"
                    className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted transition-colors hover:text-foreground"
                  >
                    {task.done ? "Rouvrir" : "Fait"}
                  </button>
                </form>
                <form action={deleteTask}>
                  <input type="hidden" name="taskId" value={task.id} />
                  <button
                    type="submit"
                    className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted transition-colors hover:text-danger"
                    aria-label={`Supprimer la tâche ${task.title}`}
                  >
                    Supprimer
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
