import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { analyzeContent } from "@/lib/copilot";
import { prisma } from "@/lib/prisma";
import { analyzeRequestSchema, type Analysis } from "@/lib/schema";
import { checkAnalysisQuota } from "@/lib/usage";

export const runtime = "nodejs";

/**
 * Persists an analysis and its tasks for a signed-in user. Best-effort: a
 * storage failure is logged but never prevents returning the analysis.
 */
async function persistAnalysis(
  userId: string,
  request: { content: string; question?: string | null },
  analysis: Analysis,
): Promise<void> {
  try {
    await prisma.analysis.create({
      data: {
        userId,
        sourceText: request.content,
        question: request.question ?? null,
        summary: analysis.summary,
        keyPoints: analysis.keyPoints,
        suggestedReply: analysis.suggestedReply,
        answer: analysis.answer,
        tasks: {
          create: analysis.tasks.map((task) => ({
            userId,
            title: task.title,
            priority: task.priority,
            dueDate: task.dueDate,
          })),
        },
      },
    });
  } catch (error) {
    console.error("[api/analyze] failed to persist analysis:", error);
  }
}

/**
 * POST /api/analyze
 *
 * Body: { content: string, question?: string | null }
 * Returns: an {@link Analysis} on success, or { error: string }.
 */
export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Corps de requête invalide (JSON attendu)." },
      { status: 400 },
    );
  }

  const parsed = analyzeRequestSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Requête invalide.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    // Require authentication — protects the AI endpoint from anonymous abuse
    // (cost/quota) and enforces the per-plan daily limit.
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json(
        { error: "Authentification requise." },
        { status: 401 },
      );
    }

    const quota = await checkAnalysisQuota(userId);
    if (!quota.allowed) {
      return NextResponse.json(
        {
          error: `Limite atteinte : ${quota.limit} analyses par jour avec le plan gratuit. Passez à un plan supérieur pour des analyses illimitées.`,
          upgrade: true,
        },
        { status: 402 },
      );
    }

    // Owner UI language (for summary/keypoints) from the browser; the draft
    // reply itself is always written in the analyzed message's language.
    const acceptLanguage = request.headers.get("accept-language") ?? "";
    const ownerLanguage =
      acceptLanguage.split(",")[0]?.split(";")[0]?.trim() || "fr";

    const analysis = await analyzeContent(parsed.data, ownerLanguage);

    await persistAnalysis(userId, parsed.data, analysis);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("[api/analyze] analysis failed:", error);

    const isMisconfigured =
      error instanceof Error && error.message.includes("GEMINI_API_KEY");

    return NextResponse.json(
      {
        error: isMisconfigured
          ? "Le service IA n'est pas configuré (clé API manquante)."
          : "Une erreur est survenue lors de l'analyse. Réessaie dans un instant.",
      },
      { status: isMisconfigured ? 503 : 502 },
    );
  }
}
