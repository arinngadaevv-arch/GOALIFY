import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { getClientIp, rateLimit, retryAfterSeconds } from "@/lib/rate-limit";

const registerSchema = z.object({
  name: z.string().min(2, "השם חייב להכיל לפחות 2 תווים").max(80),
  email: z.string().email("כתובת אימייל לא תקינה"),
  password: z.string().min(8, "הסיסמה חייבת להכיל לפחות 8 תווים"),
});

export async function POST(req: Request) {
  const rl = await rateLimit("register", getClientIp(req));
  if (!rl.success) {
    return NextResponse.json(
      { error: "יותר מדי ניסיונות הרשמה. נסו שוב בעוד מספר דקות." },
      { status: 429, headers: { "Retry-After": String(retryAfterSeconds(rl.reset)) } }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "קלט לא תקין" },
      { status: 400 }
    );
  }

  const { name, email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  if (existing) {
    return NextResponse.json(
      { error: "כבר קיים משתמש עם כתובת אימייל זו" },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const [user] = await db
    .insert(users)
    .values({
      name,
      email: normalizedEmail,
      passwordHash,
      plan: "FREE",
    })
    .returning({ id: users.id, email: users.email, name: users.name });

  return NextResponse.json({ user }, { status: 201 });
}
