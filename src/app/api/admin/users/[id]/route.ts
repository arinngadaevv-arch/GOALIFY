import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin";
import { db } from "@/lib/db";
import { planEnum, users } from "@/lib/db/schema";

const updateSchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  plan: z.enum(planEnum.enumValues).optional(),
});

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
  if (!parsed.success || Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const [updated] = await db
    .update(users)
    .set(parsed.data)
    .where(eq(users.id, id))
    .returning({ id: users.id, name: users.name, plan: users.plan });

  if (!updated) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  return NextResponse.json({ user: updated });
}
