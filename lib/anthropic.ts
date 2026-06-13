import "server-only";

import Anthropic from "@anthropic-ai/sdk";

import { getServerEnv } from "./env";

/**
 * Lazily-instantiated, process-wide Anthropic client.
 *
 * The SDK is cheap to keep around and reuses its HTTP connection pool, so a
 * single shared instance is preferable to constructing one per request.
 */
let client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (client === null) {
    const { anthropicApiKey } = getServerEnv();
    client = new Anthropic({ apiKey: anthropicApiKey });
  }

  return client;
}
