import Link from "next/link";

import { auth } from "@/auth";
import { Analyzer } from "@/components/copilot/analyzer";
import { DaySummary } from "@/components/copilot/day-summary";
import { PriorityBadge } from "@/components/copilot/priority-badge";
import {
  ArrowRightIcon,
  CalendarIcon,
  ChecksIcon,
  FileIcon,
  MailIcon,
  SparklesIcon,
} from "@/components/icons";
import { listUpcomingEvents } from "@/lib/calendar";
import { countMessages, listMessages, type GmailSummary } from "@/lib/gmail";
import { getValidGoogleAccessToken } from "@/lib/google";
import { prisma } from "@/lib/prisma";
import type { TaskPriority } from "@/lib/schema";

export const dynamic = "force-dynamic";

const PRIORITY_WEIGHT: Record<TaskPriority, number> = {
  haute: 0,
  moyenne: 1,
  basse: 2,
};

const SHORTCUTS = [
  {
    href: "/dashboard/inbox",
    icon: MailIcon,
    title: "Boîte",
    description: "Cherchez et répondez à vos emails",
  },
  {
    href: "/dashboard/agenda",
    icon: CalendarIcon,
    title: "Agenda",
    description: "Vos RDV et le résumé du jour",
  },
  {
    href: "/dashboard/docs",
    icon: FileIcon,
    title: "Documents",
    description: "Cherchez et résumez vos docs",
  },
  {
    href: "/dashboard/tasks",
    icon: ChecksIcon,
    title: "Tâches",
    description: "Suivez vos actions à faire",
  },
];

/** "Camille Durand <x@y.com>" → "Camille Durand". */
function senderName(from: string): string {
  return from.replace(/<[^>]+>/, "").replace(/"/g, "").trim() || from;
}

interface GoogleSnapshot {
  unreadCount: number;
  todayEvents: number;
  importantEmails: GmailSummary[];
  connected: boolean;
}

/** Pulls a lightweight Google snapshot; never throws (dashboard must render). */
async function getGoogleSnapshot(userId: string): Promise<GoogleSnapshot> {
  const empty: GoogleSnapshot = {
    unreadCount: 0,
    todayEvents: 0,
    importantEmails: [],
    connected: false,
  };

  let accessToken: string;
  try {
    accessToken = await getValidGoogleAccessToken(userId);
  } catch {
    return empty;
  }

  const [unread, unreadList, events] = await Promise.allSettled([
    countMessages(accessToken, "is:unread in:inbox"),
    listMessages(accessToken, { q: "is:unread in:inbox", maxResults: 4 }),
    listUpcomingEvents(accessToken, 10),
  ]);

  const now = new Date();
  const todayEvents =
    events.status === "fulfilled"
      ? events.value.filter((event) => {
          const date = new Date(event.start);
          return (
            !Number.isNaN(date.getTime()) &&
            date.toDateString() === now.toDateString()
          );
        }).length
      : 0;

  return {
    connected: true,
    unreadCount: unread.status === "fulfilled" ? unread.value : 0,
    todayEvents,
    importantEmails:
      unreadList.status === "fulfilled" ? unreadList.value.messages : [],
  };
}

function StatCard({
  label,
  value,
  icon: Icon,
  href,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
}) {
  const body = (
    <div className="glow-hover card-glow h-full rounded-2xl border border-border bg-surface p-5 shadow-sm transition-all hover:-translate-y-0.5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted">{label}</span>
        <span className="bg-accent-soft flex size-8 items-center justify-center rounded-lg text-accent">
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
    </div>
  );
  return href ? (
    <Link href={href} className="block h-full">
      {body}
    </Link>
  ) : (
    body
  );
}

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;
  const firstName = (session?.user?.name ?? "").split(" ")[0] ?? "";

  const [openTasks, analyses, priorityTasks, google] = await Promise.all([
    prisma.task.count({ where: { userId, done: false } }),
    prisma.analysis.count({ where: { userId } }),
    prisma.task.findMany({
      where: { userId, done: false },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
    getGoogleSnapshot(userId),
  ]);

  const topTasks = [...priorityTasks]
    .sort((a, b) => PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority])
    .slice(0, 4);

  // Smart suggestions, derived from the live snapshot.
  const suggestions: string[] = [];
  if (google.unreadCount > 0) {
    suggestions.push(
      `Vous avez ${google.unreadCount} email${
        google.unreadCount > 1 ? "s" : ""
      } non lu${google.unreadCount > 1 ? "s" : ""} — traitez les plus urgents.`,
    );
  }
  if (google.todayEvents > 0) {
    suggestions.push(
      `${google.todayEvents} rendez-vous aujourd'hui — générez le résumé de votre journée.`,
    );
  }
  if (openTasks > 0) {
    suggestions.push(
      `${openTasks} tâche${openTasks > 1 ? "s" : ""} à faire — commencez par les prioritaires.`,
    );
  }
  if (suggestions.length === 0) {
    suggestions.push("Tout est sous contrôle. Collez un email pour démarrer.");
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-10">
      <div className="animate-fade-up">
        <h1 className="text-3xl font-semibold tracking-tight">
          Bonjour{firstName ? ` ${firstName}` : ""} 👋
        </h1>
        <p className="mt-1.5 text-muted">
          Votre centre de contrôle — emails, agenda et tâches en un coup d&apos;œil.
        </p>
      </div>

      {/* Live stats */}
      <div className="animate-fade-up delay-1 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Emails non lus"
          value={google.unreadCount}
          icon={MailIcon}
          href="/dashboard/inbox"
        />
        <StatCard
          label="RDV aujourd'hui"
          value={google.todayEvents}
          icon={CalendarIcon}
          href="/dashboard/agenda"
        />
        <StatCard
          label="Tâches à faire"
          value={openTasks}
          icon={ChecksIcon}
          href="/dashboard/tasks"
        />
        <StatCard
          label="Analyses générées"
          value={analyses}
          icon={SparklesIcon}
        />
      </div>

      {/* Suggestions + AI day summary */}
      <div className="animate-fade-up delay-2 grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2.5">
            <span className="bg-gradient-accent flex size-8 items-center justify-center rounded-lg text-white">
              <SparklesIcon className="size-4" />
            </span>
            <h2 className="text-base font-semibold">Suggestions</h2>
          </div>
          <ul className="flex flex-col gap-2.5">
            {suggestions.map((suggestion) => (
              <li
                key={suggestion}
                className="flex items-start gap-2.5 text-sm text-muted"
              >
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
                {suggestion}
              </li>
            ))}
          </ul>
        </section>

        <DaySummary />
      </div>

      {/* Previews: important emails + priority tasks */}
      <div className="animate-fade-up delay-3 grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold">Emails importants</h2>
            <Link
              href="/dashboard/inbox"
              className="inline-flex items-center gap-1 text-xs font-medium text-accent transition-opacity hover:opacity-80"
            >
              Tout voir
              <ArrowRightIcon className="size-3.5" />
            </Link>
          </div>
          {google.importantEmails.length === 0 ? (
            <p className="text-sm text-muted">
              {google.connected
                ? "Aucun email non lu. Boîte à zéro 🎉"
                : "Connectez Google pour voir vos emails."}
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {google.importantEmails.map((email) => (
                <li key={email.id}>
                  <Link
                    href={`/dashboard/inbox/${email.id}`}
                    className="flex items-start gap-3 rounded-xl border border-border bg-surface-muted/40 p-3 transition-colors hover:border-accent/40"
                  >
                    <span className="bg-gradient-accent mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white">
                      {senderName(email.from).charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {senderName(email.from)}
                      </p>
                      <p className="truncate text-xs text-muted">
                        {email.subject || "(sans objet)"}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold">Tâches prioritaires</h2>
            <Link
              href="/dashboard/tasks"
              className="inline-flex items-center gap-1 text-xs font-medium text-accent transition-opacity hover:opacity-80"
            >
              Tout voir
              <ArrowRightIcon className="size-3.5" />
            </Link>
          </div>
          {topTasks.length === 0 ? (
            <p className="text-sm text-muted">Aucune tâche en cours 🎉</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {topTasks.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface-muted/40 p-3"
                >
                  <span className="truncate text-sm font-medium">
                    {task.title}
                  </span>
                  <PriorityBadge priority={task.priority} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Quick actions */}
      <div className="animate-fade-up delay-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SHORTCUTS.map(({ href, icon: Icon, title, description }) => (
          <Link
            key={href}
            href={href}
            className="group card-glow glow-hover rounded-2xl border border-border bg-surface p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-accent/40"
          >
            <span className="bg-gradient-accent flex size-10 items-center justify-center rounded-xl text-white shadow-sm">
              <Icon className="size-5" />
            </span>
            <h3 className="mt-3 text-sm font-semibold">{title}</h3>
            <p className="mt-0.5 text-xs leading-relaxed text-muted">
              {description}
            </p>
          </Link>
        ))}
      </div>

      {/* Copilot */}
      <section className="animate-fade-up delay-4 rounded-3xl border border-border bg-surface p-6 shadow-sm sm:p-7">
        <div className="mb-6 flex items-center gap-3">
          <span className="bg-gradient-accent flex size-11 items-center justify-center rounded-2xl text-white shadow-sm">
            <SparklesIcon className="size-5" />
          </span>
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Copilote</h2>
            <p className="text-sm text-muted">
              Collez un email ou un texte — résumé, brouillon et tâches générés en
              quelques secondes.
            </p>
          </div>
        </div>
        <Analyzer />
      </section>
    </main>
  );
}
