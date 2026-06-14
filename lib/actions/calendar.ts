"use server";

import { auth } from "@/auth";
import { createEvent, listUpcomingEvents } from "@/lib/calendar";
import { summarize } from "@/lib/copilot";
import { getValidGoogleAccessToken, isReconnectError } from "@/lib/google";

export interface EventActionState {
  ok: boolean;
  message: string;
}

async function requireToken(): Promise<string> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("NOT_AUTHENTICATED");
  return getValidGoogleAccessToken(userId);
}

/** Generates a short, friendly summary of the user's upcoming agenda. */
export async function summarizeDay(): Promise<string> {
  const accessToken = await requireToken();
  const events = await listUpcomingEvents(accessToken, 10);

  if (events.length === 0) {
    return "Aucun événement à venir dans votre agenda.";
  }

  const content = events
    .map(
      (event) =>
        `- ${event.summary} (${event.allDay ? "journée" : event.start}${
          event.location ? `, ${event.location}` : ""
        })`,
    )
    .join("\n");

  return summarize({
    instruction:
      "Tu es un assistant pour dirigeant de PME. Résume l'agenda à venir en 2-3 phrases claires et utiles, en français. Mets en avant ce qui est important et propose une priorité si pertinent. Sois concis.",
    content: `Voici les prochains événements :\n${content}`,
  });
}

/** Creates a calendar event from the form (the user triggers this). */
export async function createCalendarEvent(
  _prevState: EventActionState,
  formData: FormData,
): Promise<EventActionState> {
  const summaryText = String(formData.get("summary") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const startTime = String(formData.get("startTime") ?? "").trim();
  const endTime = String(formData.get("endTime") ?? "").trim();

  if (!summaryText || !date || !startTime || !endTime) {
    return { ok: false, message: "Tous les champs sont requis." };
  }

  try {
    const accessToken = await requireToken();
    await createEvent(accessToken, {
      summary: summaryText,
      startDateTime: `${date}T${startTime}:00`,
      endDateTime: `${date}T${endTime}:00`,
    });
    return { ok: true, message: "Événement créé dans Google Agenda." };
  } catch (error) {
    console.error("[createCalendarEvent] failed:", error);
    if (isReconnectError(error)) {
      return {
        ok: false,
        message: "Reconnecte-toi avec Google pour autoriser l'agenda.",
      };
    }
    return {
      ok: false,
      message: "Impossible de créer l'événement. Réessaie dans un instant.",
    };
  }
}
