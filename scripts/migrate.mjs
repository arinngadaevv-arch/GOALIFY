import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

/**
 * Applies any pending SQL files in ./drizzle against DATABASE_URL. Drizzle
 * tracks which migrations already ran in a `__drizzle_migrations` table it
 * creates itself, so re-running this against an up-to-date database is a
 * safe no-op — this is meant to run on every deploy (see the `vercel-build`
 * script), not just once by hand.
 */
const url = process.env.DATABASE_URL;
if (!url) {
  console.error("[migrate] DATABASE_URL is not set — cannot run migrations.");
  process.exit(1);
}

const sql = postgres(url, { max: 1 });
const db = drizzle(sql);

console.log(`[migrate] Applying pending migrations from ./drizzle to ${new URL(url).host}...`);
await migrate(db, { migrationsFolder: "./drizzle" });
console.log("[migrate] Done.");

await sql.end();
