import { z } from "zod";

/**
 * Shared schemas and types for the copilot's analysis feature.
 *
 * These are imported by both the server (request validation, model output
 * validation) and the client (typed rendering), so this module must stay free
 * of any server-only dependencies.
 */

export const TASK_PRIORITIES = ["haute", "moyenne", "basse"] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const taskSchema = z.object({
  /** Short, actionable task title. */
  title: z.string(),
  priority: z.enum(TASK_PRIORITIES),
  /** ISO 8601 date (YYYY-MM-DD) when a deadline is stated, otherwise null. */
  dueDate: z.string().nullable(),
});

export const analysisSchema = z.object({
  /** A few sentences capturing the essentials. */
  summary: z.string(),
  /** Bullet-point highlights. */
  keyPoints: z.array(z.string()),
  /** A ready-to-edit draft reply, written in the analyzed message's language. */
  suggestedReply: z.string(),
  /** Actionable tasks extracted from the content. */
  tasks: z.array(taskSchema),
  /** Answer to the user's optional question, or null if none was asked. */
  answer: z.string().nullable(),
});

export type Task = z.infer<typeof taskSchema>;
export type Analysis = z.infer<typeof analysisSchema>;

export const analyzeRequestSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Le texte à analyser est vide.")
    .max(20_000, "Le texte dépasse la limite de 20 000 caractères."),
  question: z.string().trim().max(2_000).nullish(),
});

export type AnalyzeRequest = z.infer<typeof analyzeRequestSchema>;
