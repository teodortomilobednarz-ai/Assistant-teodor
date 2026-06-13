import "server-only";

import { GoogleGenAI } from "@google/genai";

import { getServerEnv } from "./env";

/**
 * Lazily-instantiated, process-wide Google Gemini client.
 *
 * A single shared instance reuses the underlying HTTP connection pool, so it is
 * preferable to constructing one per request.
 */
let client: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (client === null) {
    const { geminiApiKey } = getServerEnv();
    client = new GoogleGenAI({ apiKey: geminiApiKey });
  }

  return client;
}
