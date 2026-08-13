import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin";
import { db } from "@/lib/db";
import { reviews } from "@/lib/db/schema";

const updateSchema = z.object({ approved: z.boolean() });

/** Moderation gate — a review only ever counts toward the public
 * rating/average once an admin has explicitly approved it here (see
 * AdminDashboard's Reviews section). */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const [updated] = await db
    .update(reviews)
    .set({ approved: parsed.data.approved })
    .where(eq(reviews.id, id))
    .returning({ id: reviews.id });

  if (!updated) {
    return NextResponse.json({ error: "Review not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

/** Rejecting a spam/abusive submission outright, rather than leaving it
 * sitting in the pending list forever as `approved: false`. */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { id } = await params;
  await db.delete(reviews).where(eq(reviews.id, id));
  return NextResponse.json({ ok: true });
}
