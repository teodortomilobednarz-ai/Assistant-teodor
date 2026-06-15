"use client";

import { useState } from "react";

import { PriorityBadge } from "@/components/copilot/priority-badge";
import { ChecksIcon } from "@/components/icons";
import { createTask, deleteTask, setTaskDone } from "@/lib/actions/tasks";
import type { TaskPriority } from "@/lib/schema";

export interface TaskItem {
  id: string;
  title: string;
  priority: TaskPriority;
  dueDate: string | null;
  done: boolean;
}

interface TaskListProps {
  active: TaskItem[];
  history: TaskItem[];
}

function persistDone(id: string, done: boolean): void {
  const data = new FormData();
  data.set("taskId", id);
  data.set("done", done ? "true" : "false");
  void setTaskDone(data).catch(() => {});
}

function persistDelete(id: string): void {
  const data = new FormData();
  data.set("taskId", id);
  void deleteTask(data).catch(() => {});
}

export function TaskList({ active, history }: TaskListProps) {
  const [activeList, setActiveList] = useState(active);
  const [historyList, setHistoryList] = useState(history);
  const [exiting, setExiting] = useState<Set<string>>(new Set());
  const [showHistory, setShowHistory] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  async function add() {
    const created = await createTask(newTitle);
    if (created) {
      setActiveList((prev) => [created, ...prev]);
      setNewTitle("");
    }
  }

  function complete(task: TaskItem) {
    persistDone(task.id, true);
    setExiting((prev) => new Set(prev).add(task.id));
    window.setTimeout(() => {
      setActiveList((prev) => prev.filter((t) => t.id !== task.id));
      setHistoryList((prev) => [{ ...task, done: true }, ...prev]);
      setExiting((prev) => {
        const next = new Set(prev);
        next.delete(task.id);
        return next;
      });
    }, 250);
  }

  function reopen(task: TaskItem) {
    persistDone(task.id, false);
    setHistoryList((prev) => prev.filter((t) => t.id !== task.id));
    setActiveList((prev) => [{ ...task, done: false }, ...prev]);
  }

  function remove(id: string, from: "active" | "history") {
    persistDelete(id);
    if (from === "active") {
      setActiveList((prev) => prev.filter((t) => t.id !== id));
    } else {
      setHistoryList((prev) => prev.filter((t) => t.id !== id));
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void add();
        }}
        className="flex gap-2"
      >
        <input
          value={newTitle}
          onChange={(event) => setNewTitle(event.target.value)}
          placeholder="Ajouter une tâche…"
          className="w-full rounded-xl border border-border bg-surface p-2.5 text-sm outline-none transition-colors placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
        <button
          type="submit"
          disabled={!newTitle.trim()}
          className="bg-gradient-accent shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5 disabled:opacity-60"
        >
          Ajouter
        </button>
      </form>

      {activeList.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-surface/50 p-10 text-center">
          <span className="bg-gradient-accent flex size-12 items-center justify-center rounded-2xl text-white shadow-sm">
            <ChecksIcon className="size-6" />
          </span>
          <p className="text-sm text-muted">
            Tout est fait. Les nouvelles tâches apparaîtront ici.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {activeList.map((task) => (
            <li
              key={task.id}
              className={`flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm transition-colors hover:border-accent/40 ${
                exiting.has(task.id) ? "animate-task-out" : ""
              }`}
            >
              <button
                type="button"
                onClick={() => complete(task)}
                aria-label="Marquer comme terminée"
                className="flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-border text-transparent transition-colors hover:border-accent hover:text-accent"
              >
                <ChecksIcon className="size-3.5" />
              </button>

              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="truncate text-sm font-medium">{task.title}</span>
                <div className="flex items-center gap-2">
                  <PriorityBadge priority={task.priority} />
                  {task.dueDate && (
                    <span className="text-xs text-muted">
                      Échéance : {task.dueDate}
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => remove(task.id, "active")}
                className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted transition-colors hover:text-danger"
                aria-label={`Supprimer ${task.title}`}
              >
                Supprimer
              </button>
            </li>
          ))}
        </ul>
      )}

      {historyList.length > 0 && (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setShowHistory((value) => !value)}
            className="flex w-fit items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            Historique ({historyList.length})
            <span className="text-xs">{showHistory ? "▲" : "▼"}</span>
          </button>

          {showHistory && (
            <ul className="flex flex-col gap-2">
              {historyList.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface/60 p-4"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <span className="text-success">✓</span>
                    <span className="truncate text-sm text-muted">
                      {task.title}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => reopen(task)}
                      className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted transition-colors hover:text-foreground"
                    >
                      Rouvrir
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(task.id, "history")}
                      className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted transition-colors hover:text-danger"
                    >
                      Supprimer
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
