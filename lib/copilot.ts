import "server-only";

import type Anthropic from "@anthropic-ai/sdk";

import { getAnthropicClient } from "./anthropic";
import { analysisSchema, type AnalyzeRequest, type Analysis } from "./schema";

/**
 * Core "copilot" logic: turn a piece of text (typically an email) into a
 * structured analysis — summary, key points, a draft reply, extracted tasks,
 * and an optional answer to a user question.
 *
 * The model is constrained with a JSON schema (structured outputs) and its
 * response is re-validated with Zod, so callers always receive a well-formed
 * {@link Analysis} or a thrown error.
 */

const MODEL = "claude-opus-4-8";
const MAX_TOKENS = 8_000;

/** JSON schema handed to the model via `output_config.format`. */
const RESPONSE_JSON_SCHEMA = {
  type: "object",
  properties: {
    summary: { type: "string" },
    keyPoints: { type: "array", items: { type: "string" } },
    suggestedReply: { type: "string" },
    tasks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          priority: { type: "string", enum: ["haute", "moyenne", "basse"] },
          dueDate: { type: ["string", "null"] },
        },
        required: ["title", "priority", "dueDate"],
        additionalProperties: false,
      },
    },
    answer: { type: ["string", "null"] },
  },
  required: ["summary", "keyPoints", "suggestedReply", "tasks", "answer"],
  additionalProperties: false,
} as const;

const SYSTEM_PROMPT = `Tu es un copilote IA pour dirigeants de PME et indépendants.
À partir d'un texte fourni (le plus souvent un email reçu), tu produis une analyse claire et directement exploitable.

Règles :
- Réponds toujours en français, dans un style clair, simple et professionnel.
- "summary" : 2 à 4 phrases qui capturent l'essentiel.
- "keyPoints" : les points importants, sous forme de courtes puces.
- "suggestedReply" : un brouillon de réponse prêt à être édité et envoyé. Ton professionnel et courtois. N'invente jamais d'engagement, de prix ou de date que le texte ne mentionne pas ; en cas d'information manquante, laisse un court champ entre crochets (ex. [à compléter]).
- "tasks" : les actions concrètes à faire. Pour chaque tâche : un titre court et actionnable, une priorité ("haute", "moyenne" ou "basse"), et "dueDate" au format AAAA-MM-JJ si une échéance est explicitement mentionnée, sinon null. S'il n'y a aucune tâche, renvoie une liste vide.
- "answer" : si une question est posée par l'utilisateur, réponds-y en t'appuyant uniquement sur le texte fourni ; sinon null. Si la réponse n'est pas dans le texte, dis-le clairement.

Tu ne fais que préparer et proposer : tu n'envoies rien et ne prends aucune action externe.`;

/** Extracts the concatenated text content from a model response. */
function extractText(message: Anthropic.Message): string {
  return message.content
    .filter(
      (block): block is Anthropic.TextBlock => block.type === "text",
    )
    .map((block) => block.text)
    .join("");
}

export async function analyzeContent(input: AnalyzeRequest): Promise<Analysis> {
  const client = getAnthropicClient();

  const question = input.question?.trim();
  const userPrompt = [
    question
      ? `Question de l'utilisateur : ${question}`
      : "Aucune question spécifique n'est posée — renvoie answer = null.",
    "",
    "Texte à analyser :",
    '"""',
    input.content,
    '"""',
  ].join("\n");

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    thinking: { type: "adaptive" },
    output_config: {
      effort: "medium",
      format: { type: "json_schema", schema: RESPONSE_JSON_SCHEMA },
    },
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  if (message.stop_reason === "refusal") {
    throw new Error("La demande a été refusée par le modèle.");
  }

  const raw = extractText(message);
  if (!raw.trim()) {
    throw new Error("Réponse vide du modèle.");
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(raw);
  } catch {
    throw new Error("Le modèle n'a pas renvoyé un JSON valide.");
  }

  return analysisSchema.parse(parsedJson);
}
