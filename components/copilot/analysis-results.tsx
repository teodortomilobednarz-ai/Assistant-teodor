import type { Analysis } from "@/lib/schema";

import { CopyButton } from "./copy-button";
import { PriorityBadge } from "./priority-badge";

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-surface p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
          {title}
        </h3>
        {action}
      </div>
      {children}
    </section>
  );
}

export function AnalysisResults({ analysis }: { analysis: Analysis }) {
  const { summary, keyPoints, suggestedReply, tasks, answer } = analysis;

  return (
    <div className="flex flex-col gap-4">
      {answer && (
        <Section title="Réponse à votre question">
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{answer}</p>
        </Section>
      )}

      <Section title="Résumé">
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{summary}</p>
      </Section>

      {keyPoints.length > 0 && (
        <Section title="Points clés">
          <ul className="flex flex-col gap-2">
            {keyPoints.map((point, index) => (
              <li key={index} className="flex gap-2 text-sm leading-relaxed">
                <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section
        title="Brouillon de réponse"
        action={<CopyButton value={suggestedReply} />}
      >
        <p className="whitespace-pre-wrap rounded-lg bg-surface-muted p-4 text-sm leading-relaxed">
          {suggestedReply}
        </p>
      </Section>

      <Section title={`Tâches${tasks.length ? ` (${tasks.length})` : ""}`}>
        {tasks.length === 0 ? (
          <p className="text-sm text-muted">Aucune tâche détectée.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {tasks.map((task, index) => (
              <li
                key={index}
                className="flex items-start justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">{task.title}</span>
                  {task.dueDate && (
                    <span className="text-xs text-muted">
                      Échéance : {task.dueDate}
                    </span>
                  )}
                </div>
                <PriorityBadge priority={task.priority} />
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}
