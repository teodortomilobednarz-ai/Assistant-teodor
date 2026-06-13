import "server-only";

/**
 * Server-side environment access.
 *
 * Reads are validated lazily (at call time) rather than at module load so the
 * app can still build and render pages that don't need the Anthropic API.
 */
export interface ServerEnv {
  readonly anthropicApiKey: string;
}

export function getServerEnv(): ServerEnv {
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY;

  if (!anthropicApiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Copy .env.example to .env.local and add your Anthropic API key.",
    );
  }

  return { anthropicApiKey };
}
