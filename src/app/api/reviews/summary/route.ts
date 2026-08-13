import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { reviews } from "@/lib/db/schema";

/**
 * Public, unauthenticated — feeds the real rating readout on the pre-quiz
 * analyzing screen (see analyzing-screen.tsx), which used to hardcode a
 * fabricated "4.9 · 1,250+ reviews". Only ever averages `approved` rows —
 * a pending submission is invisible here until an admin publishes it.
 */
export async function GET() {
  const [row] = await db
    .select({
      count: sql<number>`count(*)`.mapWith(Number),
      average: sql<number | null>`avg(${reviews.rating})`.mapWith((v) =>
        v === null ? null : Number(v),
      ),
    })
    .from(reviews)
    .where(sql`${reviews.approved} = true`);

  return NextResponse.json({
    count: row?.count ?? 0,
    average: row?.average ?? null,
  });
}
