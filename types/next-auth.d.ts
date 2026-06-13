import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Augments the session so `session.user.id` (the database user id) is typed.
   * Populated by the `session` callback in `auth.ts`.
   */
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}
