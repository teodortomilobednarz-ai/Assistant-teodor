import "server-only";

import { Type, type Schema } from "@google/genai";

import { getGeminiClient } from "./gemini";
import { analysisSchema, type AnalyzeRequest, type Analysis } from "./schema";

/**
 * Core "copilot" logic: turn a piece of text (typically an email) into a
 * structured analysis — summary, key points, a draft reply, extracted tasks,
 * and an optional answer to a user question.
 *
 * The model is constrained with a response schema (structured output) and its
 * JSON is re-validated with Zod, so callers always receive a well-formed
 * {@link Analysis} or a thrown error.
 *
 * The provider is intentionally isolated here: swapping Gemini for another LLM
 * means changing only this module and {@link getGeminiClient}.
 */

/** Free-tier eligible Gemini model. */
const MODEL = "gemini-2.5-flash";

/** Response schema handed to the model via `config.responseSchema`. */
const RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING },
    keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
    suggestedReply: { type: Type.STRING },
    tasks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          priority: { type: Type.STRING, enum: ["haute", "moyenne", "basse"] },
          dueDate: { type: Type.STRING, nullable: true },
        },
        required: ["title", "priority", "dueDate"],
        propertyOrdering: ["title", "priority", "dueDate"],
      },
    },
    answer: { type: Type.STRING, nullable: true },
  },
  required: ["summary", "keyPoints", "suggestedReply", "tasks", "answer"],
  propertyOrdering: ["summary", "keyPoints", "suggestedReply", "tasks", "answer"],
};

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

/**
 * Generic plain-text generation (e.g. day summary, document summary).
 * Returns the model's text response, in French.
 */
export async function summarize(opts: {
  instruction: string;
  content: string;
}): Promise<string> {
  const client = getGeminiClient();

  const response = await client.models.generateContent({
    model: MODEL,
    contents: opts.content,
    config: {
      systemInstruction: opts.instruction,
      temperature: 0.4,
    },
  });

  const text = response.text;
  if (!text || !text.trim()) {
    throw new Error("Réponse vide du modèle.");
  }
  return text.trim();
}

export async function analyzeContent(input: AnalyzeRequest): Promise<Analysis> {
  const client = getGeminiClient();

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

  const response = await client.models.generateContent({
    model: MODEL,
    contents: userPrompt,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
      temperature: 0.4,
    },
  });

  const raw = response.text;
  if (!raw || !raw.trim()) {
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
