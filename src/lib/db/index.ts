import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

declare global {
  var __trendsparkSql: ReturnType<typeof postgres> | undefined;
}

function createClient() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Add it to .env (see .env.example)."
    );
  }
  return postgres(url, { max: 10 });
}

const sql = global.__trendsparkSql ?? createClient();
if (process.env.NODE_ENV !== "production") {
  global.__trendsparkSql = sql;
}

export const db = drizzle(sql, { schema });
