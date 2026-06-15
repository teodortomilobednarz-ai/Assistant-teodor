// Conditionally syncs the Prisma schema to the database during build.
//
// Runs `prisma db push` only when DATABASE_URL is configured (e.g. on Vercel),
// so production deploys create their tables automatically. Local builds without
// a database simply skip this step. A sync failure never blocks the build — the
// app degrades gracefully — so a transient DB hiccup can't take the whole site
// down.
import { execSync } from "node:child_process";

if (!process.env.DATABASE_URL) {
  console.log("[db-push] DATABASE_URL not set — skipping schema sync.");
  process.exit(0);
}

console.log("[db-push] Syncing database schema…");
try {
  execSync("prisma db push --skip-generate --accept-data-loss", {
    stdio: "inherit",
  });
  console.log("[db-push] Schema synced.");
} catch (error) {
  console.warn(
    "[db-push] Schema sync failed — continuing build:",
    error?.message ?? error,
  );
  process.exit(0);
}
