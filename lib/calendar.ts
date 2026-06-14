import "server-only";

/**
 * Minimal Google Calendar REST client (fetch + user access token).
 * Reads upcoming events and creates events (the user triggers creation).
 */

const CALENDAR_API = "https://www.googleapis.com/calendar/v3";

export interface CalendarEvent {
  id: string;
  summary: string;
  start: string;
  end: string;
  location: string;
  allDay: boolean;
}

interface RawEvent {
  id: string;
  summary?: string;
  location?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
}

async function calendarFetch<T>(
  accessToken: string,
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${CALENDAR_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Calendar API error ${response.status}: ${detail}`);
  }

  return response.json() as Promise<T>;
}

export async function listUpcomingEvents(
  accessToken: string,
  maxResults = 10,
): Promise<CalendarEvent[]> {
  const timeMin = new Date().toISOString();
  const params = new URLSearchParams({
    timeMin,
    maxResults: String(maxResults),
    singleEvents: "true",
    orderBy: "startTime",
  });

  const data = await calendarFetch<{ items?: RawEvent[] }>(
    accessToken,
    `/calendars/primary/events?${params.toString()}`,
  );

  return (data.items ?? []).map((event) => {
    const allDay = Boolean(event.start?.date && !event.start?.dateTime);
    return {
      id: event.id,
      summary: event.summary ?? "(sans titre)",
      start: event.start?.dateTime ?? event.start?.date ?? "",
      end: event.end?.dateTime ?? event.end?.date ?? "",
      location: event.location ?? "",
      allDay,
    };
  });
}

export async function createEvent(
  accessToken: string,
  event: {
    summary: string;
    description?: string;
    startDateTime: string;
    endDateTime: string;
    timeZone?: string;
  },
): Promise<{ id: string }> {
  const timeZone = event.timeZone ?? "Europe/Paris";
  const result = await calendarFetch<{ id: string }>(
    accessToken,
    "/calendars/primary/events",
    {
      method: "POST",
      body: JSON.stringify({
        summary: event.summary,
        description: event.description,
        start: { dateTime: event.startDateTime, timeZone },
        end: { dateTime: event.endDateTime, timeZone },
      }),
    },
  );

  return { id: result.id };
}
