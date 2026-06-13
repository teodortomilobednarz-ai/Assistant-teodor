import "server-only";

/**
 * Server-side environment access.
 *
 * Reads are validated lazily (at call time) rather than at module load so the
 * app can still build and render pages that don't need the AI provider.
 */
export interface ServerEnv {
  readonly geminiApiKey: string;
}

export function getServerEnv(): ServerEnv {
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (!geminiApiKey) {
    throw new Error(
      "GEMINI_API_KEY is not set. Copy .env.example to .env.local and add your Google Gemini API key.",
    );
  }

  return { geminiApiKey };
}
