"use client";

import { useState, useTransition } from "react";

import { PriorityBadge } from "@/components/copilot/priority-badge";
import {
  CheckIcon,
  ChecksIcon,
  ChevronDownIcon,
  ClockIcon,
  TrashIcon,
} from "@/components/icons";
import { completeTask, deleteTask, reopenTask } from "@/lib/actions/tasks";
import type { TaskPriority } from "@/lib/schema";

export interface TaskItem {
  id: string;
  title: string;
  priority: TaskPriority;
  dueDate: string | null;
  done: boolean;
}

interface TaskListProps {
  tasks: TaskItem[];
}

export function TaskList({ tasks }: TaskListProps) {
  const [active, setActive] = useState<TaskItem[]>(
    tasks.filter((task) => !task.done),
  );
  const [history, setHistory] = useState<TaskItem[]>(
    tasks.filter((task) => task.done),
  );
  // Ids currently playing their exit animation (kept until it finishes).
  const [leaving, setLeaving] = useState<Set<string>>(new Set());
  const [showHistory, setShowHistory] = useState(false);
  const [, startTransition] = useTransition();

  function markLeaving(id: string) {
    setLeaving((prev) => new Set(prev).add(id));
  }

  function complete(task: TaskItem) {
    markLeaving(task.id);
    startTransition(() => void completeTask(task.id));
    // Remove after the exit animation, then file into history.
    window.setTimeout(() => {
      setActive((prev) => prev.filter((t) => t.id !== task.id));
      setHistory((prev) => [{ ...task, done: true }, ...prev]);
      setLeaving((prev) => {
        const next = new Set(prev);
        next.delete(task.id);
        return next;
      });
    }, 420);
  }

  function remove(task: TaskItem, from: "active" | "history") {
    markLeaving(task.id);
    startTransition(() => void deleteTask(task.id));
    window.setTimeout(() => {
      if (from === "active") {
        setActive((prev) => prev.filter((t) => t.id !== task.id));
      } else {
        setHistory((prev) => prev.filter((t) => t.id !== task.id));
      }
      setLeaving((prev) => {
        const next = new Set(prev);
        next.delete(task.id);
        return next;
      });
    }, 420);
  }

  function reopen(task: TaskItem) {
    markLeaving(task.id);
    startTransition(() => void reopenTask(task.id));
    window.setTimeout(() => {
      setHistory((prev) => prev.filter((t) => t.id !== task.id));
      setActive((prev) => [{ ...task, done: false }, ...prev]);
      setLeaving((prev) => {
        const next = new Set(prev);
        next.delete(task.id);
        return next;
      });
    }, 420);
  }

  if (active.length === 0 && history.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-surface/50 p-10 text-center">
        <span className="bg-accent-soft flex size-12 items-center justify-center rounded-2xl text-accent">
          <ChecksIcon className="size-6" />
        </span>
        <p className="text-sm text-muted">
          Les tâches détectées lors d&apos;une analyse apparaîtront ici.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {active.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-surface/50 p-8 text-center">
          <span className="text-2xl">🎉</span>
          <p className="text-sm text-muted">
            Tout est fait. Aucune tâche en cours.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {active.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              leaving={leaving.has(task.id)}
              onComplete={() => complete(task)}
              onDelete={() => remove(task, "active")}
            />
          ))}
        </ul>
      )}

      {history.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setShowHistory((value) => !value)}
            className="flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            <ChevronDownIcon
              className={`size-4 transition-transform ${
                showHistory ? "rotate-180" : ""
              }`}
            />
            Historique des tâches ({history.length})
          </button>

          {showHistory && (
            <ul className="mt-3 flex flex-col gap-2">
              {history.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  done
                  leaving={leaving.has(task.id)}
                  onReopen={() => reopen(task)}
                  onDelete={() => remove(task, "history")}
                />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

interface TaskRowProps {
  task: TaskItem;
  done?: boolean;
  leaving: boolean;
  onComplete?: () => void;
  onReopen?: () => void;
  onDelete: () => void;
}

function TaskRow({
  task,
  done = false,
  leaving,
  onComplete,
  onReopen,
  onDelete,
}: TaskRowProps) {
  return (
    <li
      className={`flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm transition-colors hover:border-accent/40 ${
        leaving ? "animate-task-leave" : "animate-fade-up"
      } ${done ? "opacity-70" : ""}`}
    >
      <div className="flex min-w-0 items-center gap-3">
        {!done && onComplete && (
          <button
            type="button"
            onClick={onComplete}
            aria-label={`Marquer « ${task.title} » comme faite`}
            className="group flex size-6 shrink-0 items-center justify-center rounded-full border border-border text-transparent transition-colors hover:border-success hover:bg-success/10 hover:text-success"
          >
            <CheckIcon className="size-3.5" />
          </button>
        )}
        {done && (
          <span className="bg-success/15 flex size-6 shrink-0 items-center justify-center rounded-full text-success">
            <CheckIcon className="size-3.5" />
          </span>
        )}
        <div className="flex min-w-0 flex-col gap-1">
          {/* No strike-through — completed tasks simply read muted. */}
          <span
            className={`truncate text-sm font-medium ${
              done ? "text-muted" : ""
            }`}
          >
            {task.title}
          </span>
          <div className="flex items-center gap-2">
            <PriorityBadge priority={task.priority} />
            {task.dueDate && (
              <span className="inline-flex items-center gap-1 text-xs text-muted">
                <ClockIcon className="size-3.5" />
                {task.dueDate}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {done && onReopen && (
          <button
            type="button"
            onClick={onReopen}
            className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted transition-colors hover:text-foreground"
          >
            Rouvrir
          </button>
        )}
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Supprimer la tâche ${task.title}`}
          className="flex size-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-danger-surface hover:text-danger"
        >
          <TrashIcon className="size-4" />
        </button>
      </div>
    </li>
  );
}
