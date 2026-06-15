"use server";

import { headers } from "next/headers";

import { auth } from "@/auth";
import { listUpcomingEvents } from "@/lib/calendar";
import { summarize } from "@/lib/copilot";
import { countMessages, findFollowUps, listMessages } from "@/lib/gmail";
import { getValidGoogleAccessToken } from "@/lib/google";
import { prisma } from "@/lib/prisma";

export interface BriefStats {
  unread: number;
  events: number;
  followups: number;
  tasks: number;
}

export interface DailyBriefResult {
  ok: boolean;
  brief?: string;
  stats?: BriefStats;
  googleConnected?: boolean;
  error?: string;
}

function senderName(from: string): string {
  return from.replace(/<[^>]+>/, "").replace(/"/g, "").trim() || from;
}

async function ownerLanguage(): Promise<string> {
  const h = await headers();
  const accept = h.get("accept-language") ?? "";
  return accept.split(",")[0]?.split(";")[0]?.trim() || "fr";
}

/**
 * Builds a short, friendly "morning brief" that combines unread email, today's
 * agenda, pending follow-ups and priority tasks into a single AI narrative —
 * the first thing the user sees, written in their language.
 */
export async function getDailyBrief(): Promise<DailyBriefResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, error: "Non authentifié." };

  const priorityTasks = await prisma.task.findMany({
    where: { userId, done: false },
    orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
    take: 5,
  });

  let unread = 0;
  let eventsToday: { summary: string; start: string | null; allDay: boolean }[] =
    [];
  let followupsCount = 0;
  let topUnread: string[] = [];
  let googleConnected = true;

  try {
    const token = await getValidGoogleAccessToken(userId);
    const [unreadCount, page, events, followups] = await Promise.all([
      countMessages(token, "is:unread"),
      listMessages(token, { q: "is:unread", maxResults: 5 }),
      listUpcomingEvents(token, 20),
      findFollowUps(token, session.user?.email ?? "").catch(() => []),
    ]);

    unread = unreadCount;
    topUnread = page.messages.map(
      (m) => `${senderName(m.from)} — ${m.subject || "(sans objet)"}`,
    );
    const today = new Date().toDateString();
    eventsToday = events
      .filter((e) => e.start && new Date(e.start).toDateString() === today)
      .map((e) => ({ summary: e.summary, start: e.start, allDay: e.allDay }));
    followupsCount = followups.length;
  } catch {
    googleConnected = false;
  }

  const stats: BriefStats = {
    unread,
    events: eventsToday.length,
    followups: followupsCount,
    tasks: priorityTasks.length,
  };

  const lines: string[] = [
    `Emails non lus : ${unread}`,
    topUnread.length
      ? `Expéditeurs non lus :\n${topUnread.map((s) => `- ${s}`).join("\n")}`
      : "",
    `Rendez-vous aujourd'hui : ${eventsToday.length}`,
    eventsToday.length
      ? eventsToday
          .map((e) => `- ${e.summary} (${e.allDay ? "journée" : e.start})`)
          .join("\n")
      : "",
    `Relances en attente : ${followupsCount}`,
    `Tâches prioritaires : ${priorityTasks.length}`,
    priorityTasks.length
      ? priorityTasks.map((t) => `- ${t.title} [${t.priority}]`).join("\n")
      : "",
  ].filter(Boolean);

  try {
    const lang = await ownerLanguage();
    const brief = await summarize({
      instruction: `Tu es l'assistant personnel d'un dirigeant de PME. À partir des données du jour ci-dessous, rédige un brief matinal court (3 à 4 phrases maximum), chaleureux et orienté action, dans la langue dont le code est "${lang}" (français si indéterminé). Mets en avant LA priorité du jour. Écris un petit paragraphe fluide (pas de liste à puces). Ne réinvente aucune donnée.`,
      content: lines.join("\n"),
    });
    return { ok: true, brief, stats, googleConnected };
  } catch {
    return {
      ok: true,
      brief:
        "Voici votre journée en un coup d'œil. Consultez vos emails, votre agenda et vos tâches ci-dessous.",
      stats,
      googleConnected,
    };
  }
}
