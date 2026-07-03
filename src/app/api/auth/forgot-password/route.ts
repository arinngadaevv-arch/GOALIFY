import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { passwordResetTokens, users } from "@/lib/db/schema";
import { generateToken } from "@/lib/tokens";
import { passwordResetEmail, sendEmail } from "@/lib/email";
import {
  getClientIp,
  rateLimit,
  retryAfterSeconds,
} from "@/lib/rate-limit";

const schema = z.object({ email: z.string().email() });

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

// Generic response used in all cases to avoid leaking which emails exist.
const GENERIC_OK = {
  message: "אם קיים חשבון עם כתובת האימייל הזו, נשלח אליו קישור לאיפוס סיסמה.",
};

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = await rateLimit("forgotPassword", ip);
  if (!rl.success) {
    return NextResponse.json(
      { error: "יותר מדי בקשות. נסו שוב בעוד מספר דקות." },
      { status: 429, headers: { "Retry-After": String(retryAfterSeconds(rl.reset)) } }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "כתובת אימייל לא תקינה" }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();

  try {
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (user) {
      // Invalidate any previous tokens for this user, then issue a fresh one.
      await db
        .delete(passwordResetTokens)
        .where(eq(passwordResetTokens.userId, user.id));

      const { raw, hash } = generateToken();
      await db.insert(passwordResetTokens).values({
        userId: user.id,
        tokenHash: hash,
        expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
      });

      const appUrl =
        process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
      const resetUrl = `${appUrl}/reset-password?token=${raw}`;
      const { subject, html, text } = passwordResetEmail(resetUrl);

      await sendEmail({ to: email, subject, html, text });
    }
  } catch (err) {
    console.error("[/api/auth/forgot-password] failed", err);
    // Still return generic OK so failures don't reveal account existence.
  }

  return NextResponse.json(GENERIC_OK);
}
