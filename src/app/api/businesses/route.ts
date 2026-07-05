import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { businesses } from "@/lib/db/schema";
import { getUserPlan } from "@/lib/usage";
import { getPlanFeatures } from "@/lib/plan-features";

const createSchema = z.object({
  name: z.string().min(2).max(120),
  niche: z.string().min(2).max(60).default("cosmetology"),
  reachNotes: z.string().max(500).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "יש להתחבר תחילה" }, { status: 401 });
  }

  try {
    const rows = await db
      .select()
      .from(businesses)
      .where(eq(businesses.userId, session.user.id))
      .orderBy(desc(businesses.createdAt));

    return NextResponse.json({ businesses: rows });
  } catch (error) {
    console.error("[GET /api/businesses] failed", error);
    return NextResponse.json(
      { error: "טעינת העסקים נכשלה. נסו שוב בעוד רגע." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "יש להתחבר תחילה" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "קלט לא תקין" },
      { status: 400 }
    );
  }

  try {
    // Plan gate: Free manages one business; Pro/Business manage more.
    const features = getPlanFeatures(await getUserPlan(session.user.id));
    const existing = await db
      .select({ id: businesses.id })
      .from(businesses)
      .where(eq(businesses.userId, session.user.id));
    if (existing.length >= features.maxBusinesses) {
      return NextResponse.json(
        {
          error:
            "בתוכנית החינמית אפשר לנהל עסק אחד. שדרגו ל-Pro כדי לנהל כמה עסקים ומותגים.",
          upgrade: true,
        },
        { status: 403 }
      );
    }

    const [business] = await db
      .insert(businesses)
      .values({
        userId: session.user.id,
        name: parsed.data.name,
        niche: parsed.data.niche,
        reachNotes: parsed.data.reachNotes ?? null,
      })
      .returning();

    return NextResponse.json({ business }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/businesses] failed", error);
    return NextResponse.json(
      { error: "יצירת העסק נכשלה. נסו שוב בעוד רגע." },
      { status: 500 }
    );
  }
}
