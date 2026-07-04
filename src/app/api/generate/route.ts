import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generatedContent, projects } from "@/lib/db/schema";
import { generateContentIdeas } from "@/lib/ai/generate";
import { assertCanGenerate, getUserPlan, logGeneration, UsageLimitError } from "@/lib/usage";
import { rateLimit, retryAfterSeconds } from "@/lib/rate-limit";

const businessInputSchema = z.object({
  businessType: z.string().min(2).max(120),
  description: z.string().min(5).max(1500),
  targetAudience: z.string().min(2).max(300),
  tone: z.enum(["FUNNY", "LUXURY", "PROFESSIONAL", "TRENDY"]),
  platform: z.enum(["TIKTOK", "INSTAGRAM", "BOTH"]),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "יש להתחבר תחילה" }, { status: 401 });
  }

  // Burst protection per user (the daily plan quota is enforced separately below).
  const rl = await rateLimit("generate", session.user.id);
  if (!rl.success) {
    return NextResponse.json(
      { error: "יותר מדי בקשות יצירה ברצף. המתינו רגע ונסו שוב." },
      { status: 429, headers: { "Retry-After": String(retryAfterSeconds(rl.reset)) } }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = businessInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "קלט לא תקין" },
      { status: 400 }
    );
  }

  const userId = session.user.id;

  try {
    const plan = await getUserPlan(userId);
    await assertCanGenerate(userId, plan);

    const input = parsed.data;
    const result = await generateContentIdeas(input);

    const [project] = await db
      .insert(projects)
      .values({
        userId,
        businessType: input.businessType,
        description: input.description,
        targetAudience: input.targetAudience,
        tone: input.tone,
        platform: input.platform,
        title: input.businessType,
      })
      .returning();

    await db.insert(generatedContent).values({
      projectId: project.id,
      ideas: result,
    });

    await logGeneration(userId);

    return NextResponse.json({ project, content: result }, { status: 201 });
  } catch (error) {
    if (error instanceof UsageLimitError) {
      return NextResponse.json({ error: error.message }, { status: 402 });
    }
    console.error("[/api/generate] failed", error);
    return NextResponse.json(
      { error: "יצירת התוכן נכשלה. נסה שוב בעוד רגע." },
      { status: 500 }
    );
  }
}
