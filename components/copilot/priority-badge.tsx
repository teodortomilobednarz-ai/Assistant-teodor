import type { TaskPriority } from "@/lib/schema";

const STYLES: Record<TaskPriority, string> = {
  haute: "bg-red-50 text-red-700 ring-red-600/20",
  moyenne: "bg-amber-50 text-amber-700 ring-amber-600/20",
  basse: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
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
