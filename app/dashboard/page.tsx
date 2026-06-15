import Link from "next/link";

import { auth } from "@/auth";
import { Analyzer } from "@/components/copilot/analyzer";
import { DaySummary } from "@/components/copilot/day-summary";
import { DailyBrief } from "@/components/dashboard/daily-brief";
import { PriorityBadge } from "@/components/copilot/priority-badge";
import {
  ArrowRightIcon,
  CalendarIcon,
  ChecksIcon,
  MailIcon,
  ReceiptIcon,
  SparklesIcon,
} from "@/components/icons";
import { listUpcomingEvents } from "@/lib/calendar";
import { countMessages, listMessages } from "@/lib/gmail";
import { getValidGoogleAccessToken } from "@/lib/google";
import { prisma } from "@/lib/prisma";

const QUICK_ACTIONS = [
  { href: "/dashboard/inbox", icon: MailIcon, label: "Traiter mes emails" },
  { href: "/dashboard/billing", icon: ReceiptIcon, label: "Nouveau devis" },
  { href: "/dashboard/agenda", icon: CalendarIcon, label: "Voir l'agenda" },
  { href: "/dashboard/tasks", icon: ChecksIcon, label: "Mes tâches" },
];

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="glow-hover rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted">{label}</span>
        <span className="bg-accent-soft flex size-8 items-center justify-center rounded-lg text-accent">
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}

function senderName(from: string): string {
  return from.replace(/<[^>]+>/, "").replace(/"/g, "").trim() || from;
}

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;
  const firstName = (session?.user?.name ?? "").split(" ")[0] ?? "";

  const [openTasks, analyses, priorityTasks] = await Promise.all([
    prisma.task.count({ where: { userId, done: false } }),
    prisma.analysis.count({ where: { userId } }),
    prisma.task.findMany({
      where: { userId, done: false },
      orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
      take: 5,
    }),
  ]);

  let unreadCount: number | string = "—";
  let todayEvents: number | string = "—";
  let unreadPreview: { id: string; name: string; subject: string }[] = [];
  let googleConnected = true;

  try {
    const token = await getValidGoogleAccessToken(userId);
    const [unread, page, events] = await Promise.all([
      countMessages(token, "is:unread"),
      listMessages(token, { q: "is:unread", maxResults: 3 }),
      listUpcomingEvents(token, 20),
    ]);
    unreadCount = unread;
    unreadPreview = page.messages.map((m) => ({
      id: m.id,
      name: senderName(m.from),
      subject: m.subject || "(sans objet)",
    }));
    const today = new Date().toDateString();
    todayEvents = events.filter(
      (e) => e.start && new Date(e.start).toDateString() === today,
    ).length;
  } catch {
    googleConnected = false;
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10">
      <div className="animate-fade-up">
        <h1 className="text-3xl font-semibold tracking-tight">
          Bonjour{firstName ? ` ${firstName}` : ""} 👋
        </h1>
        <p className="mt-1.5 text-muted">
          Voici votre centre de contrôle. Que voulez-vous déléguer aujourd&apos;hui ?
        </p>
      </div>

      {/* AI morning brief */}
      <div className="animate-fade-up delay-1">
        <DailyBrief />
      </div>

      {/* Stats */}
      <div className="animate-fade-up delay-1 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Mails non lus" value={unreadCount} icon={MailIcon} />
        <StatCard label="RDV aujourd'hui" value={todayEvents} icon={CalendarIcon} />
        <StatCard label="Tâches à faire" value={openTasks} icon={ChecksIcon} />
        <StatCard label="Analyses" value={analyses} icon={SparklesIcon} />
      </div>

      {/* Quick actions */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {QUICK_ACTIONS.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className="group card-glow glow-hover flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm transition-all active:scale-[0.98] hover:-translate-y-0.5"
          >
            <span className="bg-gradient-accent flex size-9 items-center justify-center rounded-xl text-white shadow-sm">
              <Icon className="size-4" />
            </span>
            <span className="text-sm font-medium">{label}</span>
            <ArrowRightIcon className="ml-auto size-4 text-muted opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
        ))}
      </div>

      {/* Overview grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        <DaySummary />

        <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
            Tâches prioritaires
          </h2>
          {priorityTasks.length === 0 ? (
            <p className="text-sm text-muted">Aucune tâche en cours.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {priorityTasks.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                >
                  <span className="truncate text-sm">{task.title}</span>
                  <PriorityBadge priority={task.priority} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {googleConnected && unreadPreview.length > 0 && (
        <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Emails non lus
            </h2>
            <Link
              href="/dashboard/inbox"
              className="text-xs font-medium text-accent hover:text-accent-hover"
            >
              Tout voir →
            </Link>
          </div>
          <ul className="flex flex-col divide-y divide-border">
            {unreadPreview.map((mail) => (
              <li key={mail.id}>
                <Link
                  href={`/dashboard/inbox/${mail.id}`}
                  className="flex items-center justify-between gap-3 py-2.5 transition-colors first:pt-0 last:pb-0 hover:text-accent"
                >
                  <span className="truncate text-sm font-medium">{mail.name}</span>
                  <span className="hidden truncate text-xs text-muted sm:block">
                    {mail.subject}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Copilot */}
      <section className="animate-fade-up rounded-3xl border border-border bg-surface p-6 shadow-sm sm:p-7">
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
