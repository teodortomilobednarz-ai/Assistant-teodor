import Link from "next/link";

import { auth } from "@/auth";
import { Analyzer } from "@/components/copilot/analyzer";
import {
  ArrowRightIcon,
  CalendarIcon,
  ChecksIcon,
  FileIcon,
  MailIcon,
  SparklesIcon,
} from "@/components/icons";
import { prisma } from "@/lib/prisma";

const SHORTCUTS = [
  {
    href: "/dashboard/inbox",
    icon: MailIcon,
    title: "Boîte",
    description: "Résumez et répondez à vos emails",
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

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
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

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;
  const firstName = (session?.user?.name ?? "").split(" ")[0] ?? "";

  const [openTasks, doneTasks, analyses] = await Promise.all([
    prisma.task.count({ where: { userId, done: false } }),
    prisma.task.count({ where: { userId, done: true } }),
    prisma.analysis.count({ where: { userId } }),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-10">
      <div className="animate-fade-up">
        <h1 className="text-3xl font-semibold tracking-tight">
          Bonjour{firstName ? ` ${firstName}` : ""} 👋
        </h1>
        <p className="mt-1.5 text-muted">
          Que voulez-vous déléguer à votre copilote aujourd&apos;hui ?
        </p>
      </div>

      <div className="animate-fade-up delay-1 grid gap-4 sm:grid-cols-3">
        <StatCard label="Tâches à faire" value={openTasks} icon={ChecksIcon} />
        <StatCard label="Tâches terminées" value={doneTasks} icon={ChecksIcon} />
        <StatCard label="Analyses générées" value={analyses} icon={SparklesIcon} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SHORTCUTS.map(({ href, icon: Icon, title, description }, index) => (
          <Link
            key={href}
            href={href}
            className={`group card-glow glow-hover animate-fade-up delay-${index + 1} rounded-2xl border border-border bg-surface p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-accent/40`}
          >
            <span className="bg-gradient-accent flex size-10 items-center justify-center rounded-xl text-white shadow-sm">
              <Icon className="size-5" />
            </span>
            <h3 className="mt-3 text-sm font-semibold">{title}</h3>
            <p className="mt-0.5 text-xs leading-relaxed text-muted">
              {description}
            </p>
            <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-accent opacity-0 transition-opacity group-hover:opacity-100">
              Ouvrir
              <ArrowRightIcon className="size-3.5" />
            </span>
          </Link>
        ))}
      </div>

      <section className="animate-fade-up delay-2 rounded-3xl border border-border bg-surface p-6 shadow-sm sm:p-7">
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
