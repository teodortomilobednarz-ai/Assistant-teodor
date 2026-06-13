import "server-only";

import { PrismaClient } from "@prisma/client";

/**
 * Process-wide Prisma client.
 *
 * In development, Next.js hot-reloading would otherwise create a new client on
 * every reload and exhaust the database connection pool, so the instance is
 * cached on `globalThis`.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
