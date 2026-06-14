"use client";

import { useActionState } from "react";

import {
  createCalendarEvent,
  type EventActionState,
} from "@/lib/actions/calendar";

const initialState: EventActionState = { ok: false, message: "" };

const inputClass =
  "w-full rounded-lg border border-border bg-surface p-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20";

export function CreateEventForm() {
  const [state, action, pending] = useActionState(
    createCalendarEvent,
    initialState,
  );

  return (
    <section className="rounded-xl border border-border bg-surface p-5 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
        Créer un événement
      </h2>

      <form action={action} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="summary" className="text-sm font-medium">
            Titre
          </label>
          <input id="summary" name="summary" type="text" className={inputClass} />
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="date" className="text-sm font-medium">
              Date
            </label>
            <input id="date" name="date" type="date" className={inputClass} />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="startTime" className="text-sm font-medium">
              Début
            </label>
            <input
              id="startTime"
              name="startTime"
              type="time"
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="endTime" className="text-sm font-medium">
              Fin
            </label>
            <input
              id="endTime"
              name="endTime"
              type="time"
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center justify-center rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground shadow-sm transition-colors hover:bg-accent-hover disabled:opacity-50"
          >
            {pending ? "Création…" : "Créer l'événement"}
          </button>
          {state.message && (
            <span
              className={`text-sm ${state.ok ? "text-success" : "text-danger"}`}
            >
              {state.message}
            </span>
          )}
        </div>
      </form>
    </section>
  );
}
