import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { PageHeader } from "@/components/dashboard/page-header";
import { SparklesIcon } from "@/components/icons";
import { isAdminEmail } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function tally(values: (string | null)[]): [string, number][] {
  const counts = new Map<string, number>();
  for (const v of values) {
    if (!v) continue;
    counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

export default async function AdminPage() {
  const session = await auth();
  // Admin-only — return 404 to anyone else (don't reveal the page exists).
  if (!isAdminEmail(session?.user?.email)) {
    notFound();
  }

  const surveys = await prisma.onboardingSurvey.findMany({
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  const sources = tally(surveys.map((s) => s.source));
  const pains = tally(surveys.map((s) => s.painPoint));

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
      <PageHeader
        icon={SparklesIcon}
        title="Admin — réponses onboarding"
        description={`${surveys.length} réponse(s) collectée(s).`}
      />

      {/* Quick insights */}
      <div className="grid gap-4 sm:grid-cols-2">
        <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
            D&apos;où viennent-ils ? (attribution)
          </h2>
          {sources.length === 0 ? (
            <p className="text-sm text-muted">Aucune donnée pour l&apos;instant.</p>
          ) : (
            <ul className="flex flex-col gap-1.5 text-sm">
              {sources.map(([label, n]) => (
                <li key={label} className="flex justify-between">
                  <span>{label}</span>
                  <span className="font-semibold">{n}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
            Leur plus gros besoin
          </h2>
          {pains.length === 0 ? (
            <p className="text-sm text-muted">Aucune donnée pour l&apos;instant.</p>
          ) : (
            <ul className="flex flex-col gap-1.5 text-sm">
              {pains.map(([label, n]) => (
                <li key={label} className="flex justify-between">
                  <span>{label}</span>
                  <span className="font-semibold">{n}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Full table */}
      <section className="overflow-x-auto rounded-2xl border border-border bg-surface shadow-sm">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="border-b border-border text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="p-3">Utilisateur</th>
              <th className="p-3">Profil</th>
              <th className="p-3">Besoin</th>
              <th className="p-3">Motivation</th>
              <th className="p-3">Source</th>
              <th className="p-3">Emails/j</th>
              <th className="p-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {surveys.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-muted">
                  Aucune réponse pour le moment.
                </td>
              </tr>
            ) : (
              surveys.map((s) => (
                <tr key={s.id} className="border-b border-border last:border-0">
                  <td className="p-3">
                    <div className="font-medium">{s.user.name ?? "—"}</div>
                    <div className="text-xs text-muted">{s.user.email}</div>
                  </td>
                  <td className="p-3">{s.role ?? "—"}</td>
                  <td className="p-3">{s.painPoint ?? "—"}</td>
                  <td className="p-3">{s.motivation ?? "—"}</td>
                  <td className="p-3">{s.source ?? "—"}</td>
                  <td className="p-3">{s.emailVolume ?? "—"}</td>
                  <td className="p-3 text-xs text-muted">
                    {s.createdAt.toLocaleDateString("fr-FR")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}
