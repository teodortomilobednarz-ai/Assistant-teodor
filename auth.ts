import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

import { prisma } from "@/lib/prisma";

/**
 * Auth.js (NextAuth v5) configuration.
 *
 * - Google is the sole identity provider — it doubles as the gateway to the
 *   Gmail / Calendar / Drive integrations added in later milestones.
 * - Sessions are stored in the database (Prisma adapter), so OAuth tokens live
 *   in the `Account` table and can be reused server-side.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  // Trust the deployment host (Vercel / custom domain) for callback URLs.
  trustHost: true,
  session: { strategy: "database" },
  providers: [
    Google({
      authorization: {
        params: {
          // Request offline access so we receive a refresh token, needed to
          // call Google APIs on the user's behalf. `gmail.modify` covers
          // reading messages and creating drafts (never sending).
          access_type: "offline",
          prompt: "consent",
          scope: [
            "openid",
            "email",
            "profile",
            "https://www.googleapis.com/auth/gmail.modify",
            "https://www.googleapis.com/auth/calendar.events",
            "https://www.googleapis.com/auth/drive.readonly",
          ].join(" "),
        },
      },
    }),
  ],
  pages: {
    signIn: "/",
  },
  callbacks: {
    // Expose the database user id on the session so server code can scope
    // queries (tasks, analyses) to the authenticated user.
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
});
