import type { TaskPriority } from "@/lib/schema";

const STYLES: Record<TaskPriority, string> = {
  haute: "bg-priority-high-surface text-priority-high ring-priority-high-border",
  moyenne:
    "bg-priority-medium-surface text-priority-medium ring-priority-medium-border",
  basse: "bg-priority-low-surface text-priority-low ring-priority-low-border",
};

const LABELS: Record<TaskPriority, string> = {
  haute: "Haute",
  moyenne: "Moyenne",
  basse: "Basse",
};

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${STYLES[priority]}`}
    >
      {LABELS[priority]}
    </span>
  );
}
