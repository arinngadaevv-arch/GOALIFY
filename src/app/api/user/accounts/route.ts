import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { accounts } from "@/lib/db/schema";

/** Which OAuth providers the signed-in user already has linked — used by
 * the Settings screen's "Connected accounts" section. */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const rows = await db
    .select({ provider: accounts.provider })
    .from(accounts)
    .where(eq(accounts.userId, session.user.id));

  const linked = new Set(rows.map((row) => row.provider));
  return NextResponse.json({ google: linked.has("google") });
}
