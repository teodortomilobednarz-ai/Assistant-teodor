import { auth } from "@/auth";
import { CreateEventForm } from "@/components/copilot/create-event-form";
import { DaySummary } from "@/components/copilot/day-summary";
import { PageHeader } from "@/components/dashboard/page-header";
import { CalendarIcon } from "@/components/icons";
import { listUpcomingEvents, type CalendarEvent } from "@/lib/calendar";
import { getValidGoogleAccessToken } from "@/lib/google";

export const dynamic = "force-dynamic";

function formatWhen(event: CalendarEvent): string {
  if (!event.start) return "";
  const date = new Date(event.start);
  if (Number.isNaN(date.getTime())) return event.start;
  return event.allDay
    ? date.toLocaleDateString("fr-FR", {
        weekday: "short",
        day: "numeric",
        month: "short",
      })
    : date.toLocaleString("fr-FR", {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
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
    const code = error instanceof Error ? error.message : "";
    errorMessage =
      code === "NO_GOOGLE_ACCOUNT" || code === "NO_REFRESH_TOKEN"
        ? "Déconnecte-toi puis reconnecte-toi avec Google pour autoriser l'agenda."
        : "Impossible de charger l'agenda pour le moment.";
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-10">
      <PageHeader
        icon={CalendarIcon}
        title="Agenda"
        description="Vos prochains rendez-vous, un résumé, et la création d'événements."
      />

      {errorMessage ? (
        <div className="rounded-xl border border-border bg-surface p-6 text-sm text-muted">
          {errorMessage}
        </div>
      ) : (
        <>
          <DaySummary />

          <section className="rounded-xl border border-border bg-surface p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
              Prochains événements
            </h2>
            {events.length === 0 ? (
              <p className="text-sm text-muted">Aucun événement à venir.</p>
            ) : (
              <ul className="flex flex-col divide-y divide-border">
                {events.map((event) => (
                  <li
                    key={event.id}
                    className="flex items-start justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium">{event.summary}</span>
                      {event.location && (
                        <span className="text-xs text-muted">
                          {event.location}
                        </span>
                      )}
                    </div>
                    <span className="shrink-0 text-xs text-muted">
                      {formatWhen(event)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <CreateEventForm />
        </>
      )}
    </main>
  );
}
