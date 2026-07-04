import { NextResponse } from "next/server";
import { and, eq, gt } from "drizzle-orm";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { passwordResetTokens, users } from "@/lib/db/schema";
import { hashToken } from "@/lib/tokens";
import {
  getClientIp,
  rateLimit,
  retryAfterSeconds,
} from "@/lib/rate-limit";

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "הסיסמה חייבת להכיל לפחות 8 תווים"),
});

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = await rateLimit("resetPassword", ip);
  if (!rl.success) {
    return NextResponse.json(
      { error: "יותר מדי בקשות. נסו שוב בעוד מספר דקות." },
      { status: 429, headers: { "Retry-After": String(retryAfterSeconds(rl.reset)) } }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "קלט לא תקין" },
      { status: 400 }
    );
  }

  const { token, password } = parsed.data;
  const tokenHash = hashToken(token);

  try {
    const [record] = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.tokenHash, tokenHash),
          gt(passwordResetTokens.expiresAt, new Date())
        )
      )
      .limit(1);

    if (!record) {
      return NextResponse.json(
        { error: "קישור האיפוס אינו תקין או שפג תוקפו. בקשו קישור חדש." },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await db
      .update(users)
      .set({ passwordHash })
      .where(eq(users.id, record.userId));

    // Single-use: remove all reset tokens for this user.
    await db
      .delete(passwordResetTokens)
      .where(eq(passwordResetTokens.userId, record.userId));

    return NextResponse.json({ message: "הסיסמה עודכנה בהצלחה." });
  } catch (err) {
    console.error("[/api/auth/reset-password] failed", err);
    return NextResponse.json(
      { error: "משהו השתבש. נסו שוב בעוד רגע." },
      { status: 500 }
    );
  }
}
