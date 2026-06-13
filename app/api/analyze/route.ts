import { NextResponse } from "next/server";

import { analyzeContent } from "@/lib/copilot";
import { analyzeRequestSchema } from "@/lib/schema";

export const runtime = "nodejs";

/**
 * POST /api/analyze
 *
 * Body: { content: string, question?: string | null }
 * Returns: an {@link import("@/lib/schema").Analysis} on success, or
 *          { error: string } with an appropriate status code.
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
    const message =
      parsed.error.issues[0]?.message ?? "Requête invalide.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    const analysis = await analyzeContent(parsed.data);
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
