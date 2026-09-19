import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

/**
 * Mirrors a slice of the client-only Settings (see lib/goalify/store.tsx's
 * updateSettings) onto the user row — specifically just the four push
 * category toggles, since those are the only Settings fields any server
 * code (the daily-push crons) ever needs to read. Everything else in
 * Settings stays exactly where it already lived, client-side only.
 */
const patchSchema = z
  .object({
    motivation: z.boolean().optional(),
    nutrition: z.boolean().optional(),
    water: z.boolean().optional(),
    workout: z.boolean().optional(),
  })
  .refine((patch) => Object.keys(patch).length > 0, {
    message: "At least one preference is required.",
  });

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid patch." }, { status: 400 });
  }

  const { motivation, nutrition, water, workout } = parsed.data;
  await db
    .update(users)
    .set({
      ...(motivation !== undefined && { pushMotivationEnabled: motivation }),
      ...(nutrition !== undefined && { pushNutritionEnabled: nutrition }),
      ...(water !== undefined && { pushWaterEnabled: water }),
      ...(workout !== undefined && { pushWorkoutEnabled: workout }),
    })
    .where(eq(users.id, session.user.id));

  return NextResponse.json({ ok: true });
}
