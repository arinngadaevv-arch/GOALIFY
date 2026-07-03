import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { businesses, decisions } from "@/lib/db/schema";
import { isUserAdmin } from "@/lib/admin";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "יש להתחבר תחילה" }, { status: 401 });
  }
  if (!(await isUserAdmin(session.user.id))) {
    return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });
  }

  const rows = await db
    .select({
      decision: decisions,
      businessName: businesses.name,
      businessNiche: businesses.niche,
    })
    .from(decisions)
    .innerJoin(businesses, eq(decisions.businessId, businesses.id))
    .where(eq(decisions.status, "DRAFT"))
    .orderBy(asc(decisions.createdAt));

  return NextResponse.json({ drafts: rows });
}
