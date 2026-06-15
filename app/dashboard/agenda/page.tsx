import { auth } from "@/auth";
import { CreateEventForm } from "@/components/copilot/create-event-form";
import { DaySummary } from "@/components/copilot/day-summary";
import { PageHeader } from "@/components/dashboard/page-header";
import { CalendarIcon } from "@/components/icons";
import { listUpcomingEvents, type CalendarEvent } from "@/lib/calendar";
import { getValidGoogleAccessToken, isReconnectError } from "@/lib/google";

export const dynamic = "force-dynamic";

function timeLabel(event: CalendarEvent): string {
  if (event.allDay) return "Journée";
  const date = new Date(event.start);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function dayLabel(dateStr: string): string {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  if (date.toDateString() === today.toDateString()) return "Aujourd'hui";
  if (date.toDateString() === tomorrow.toDateString()) return "Demain";
  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

interface DayGroup {
  key: string;
  label: string;
  events: CalendarEvent[];
}

function groupByDay(events: CalendarEvent[]): DayGroup[] {
  const groups: DayGroup[] = [];
  for (const event of events) {
    const date = new Date(event.start);
    const key = Number.isNaN(date.getTime()) ? event.start : date.toDateString();
    let group = groups.find((g) => g.key === key);
    if (!group) {
      group = { key, label: dayLabel(event.start), events: [] };
      groups.push(group);
    }
    group.events.push(event);
  }
  return groups;
}

export default async function AgendaPage() {
  const session = await auth();
  const userId = session!.user.id;

  let events: CalendarEvent[] = [];
  let errorMessage: string | null = null;

  try {
    const accessToken = await getValidGoogleAccessToken(userId);
    events = await listUpcomingEvents(accessToken);
  } catch (error) {
    console.error("[agenda] failed to load:", error);
    errorMessage = isReconnectError(error)
      ? "Reconnecte-toi avec Google (déconnexion → reconnexion) pour autoriser l'accès à ton agenda."
      : "Impossible de charger l'agenda pour le moment.";
  }

  const groups = groupByDay(events);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-10">
      <PageHeader
        icon={CalendarIcon}
        title="Agenda"
        description="Vos prochains rendez-vous, un résumé, et la création d'événements."
      />

      {errorMessage ? (
        <div className="rounded-2xl border border-border bg-surface p-6 text-sm text-muted">
          {errorMessage}
        </div>
      ) : (
        <>
          <DaySummary />

          <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
              Prochains événements
            </h2>
            {groups.length === 0 ? (
              <p className="text-sm text-muted">Aucun événement à venir.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {groups.map((group) => (
                  <div key={group.key}>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-accent">
                      {group.label}
                    </p>
                    <ul className="flex flex-col divide-y divide-border">
                      {group.events.map((event) => (
                        <li
                          key={event.id}
                          className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                        >
                          <div className="flex min-w-0 flex-col gap-0.5">
                            <span className="truncate text-sm font-medium">
                              {event.summary}
                            </span>
                            {event.location && (
                              <span className="truncate text-xs text-muted">
                                {event.location}
                              </span>
                            )}
                          </div>
                          <span className="shrink-0 text-xs text-muted">
                            {timeLabel(event)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </section>

          <CreateEventForm />
        </>
      )}
    </main>
  );
}
