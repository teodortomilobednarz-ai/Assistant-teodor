import "server-only";

import { prisma } from "@/lib/prisma";

/**
 * True when the failure means the user must (re)connect Google or grant more
 * scopes — no Google account, no refresh token, or an insufficient-scope 403.
 */
export function isReconnectError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : "";
  return (
    message === "NO_GOOGLE_ACCOUNT" ||
    message === "NO_REFRESH_TOKEN" ||
    message.includes("error 403") ||
    message.toLowerCase().includes("insufficient")
  );
}

/**
 * Returns a valid Google OAuth access token for the given user, refreshing it
 * via the stored refresh token when it is missing or about to expire.
 *
 * Throws if the user has no connected Google account, or if no refresh token is
 * available and the access token has expired (the user must re-connect).
 */
export async function getValidGoogleAccessToken(userId: string): Promise<string> {
  const account = await prisma.account.findFirst({
    where: { userId, provider: "google" },
  });

  if (!account) {
    throw new Error("NO_GOOGLE_ACCOUNT");
  }

  const now = Math.floor(Date.now() / 1000);
  const expiresAt = account.expires_at ?? 0;
  const stillValid = account.access_token && expiresAt - 60 > now;

  if (stillValid) {
    return account.access_token as string;
  }

  if (!account.refresh_token) {
    throw new Error("NO_REFRESH_TOKEN");
  }

  const clientId = process.env.AUTH_GOOGLE_ID;
  const clientSecret = process.env.AUTH_GOOGLE_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth credentials are not configured.");
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
      refresh_token: account.refresh_token,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to refresh Google token (${response.status}).`);
  }

  const data = (await response.json()) as {
    access_token: string;
    expires_in: number;
    refresh_token?: string;
  };

  await prisma.account.update({
    where: { id: account.id },
    data: {
      access_token: data.access_token,
      expires_at: now + data.expires_in,
      // Google only returns a new refresh token occasionally; keep the old one.
      refresh_token: data.refresh_token ?? account.refresh_token,
    },
  });

  return data.access_token;
}
