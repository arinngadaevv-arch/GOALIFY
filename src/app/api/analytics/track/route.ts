import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { analyticsEvents } from "@/lib/db/schema";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

const VISITOR_COOKIE = "gf_vid";
const VISITOR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

const KINDS = new Set(["LANDING_VIEW", "QUIZ_STEP", "QUIZ_COMPLETE"]);

/**
 * Fire-and-forget visitor/funnel tracking — deliberately no auth required,
 * since most of the funnel this feeds (landing view, every quiz step) is
 * reached by people who don't have an account yet. Identity is a random,
 * anonymous first-party cookie, not anything personal; see analytics_event
 * in db/schema.ts for why this exists separately from users.quizCompletedAt.
 * Always returns 200 even on a bad body — a tracking ping is never worth
 * surfacing an error to the caller over.
 */
export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = await rateLimit("analyticsTrack", ip);
  if (!rl.success) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const kind = typeof body?.kind === "string" ? body.kind : null;
  if (!kind || !KINDS.has(kind)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const stepId = typeof body?.stepId === "string" ? body.stepId : null;
  const stepIndex = Number.isInteger(body?.stepIndex) ? body.stepIndex : null;
  const path = typeof body?.path === "string" ? body.path.slice(0, 200) : null;

  const existingVisitorId = request.cookies.get(VISITOR_COOKIE)?.value;
  const visitorId = existingVisitorId || crypto.randomUUID();

  const userAgent = request.headers.get("user-agent") ?? "";
  const device = /mobi|android|iphone|ipad|ipod/i.test(userAgent)
    ? "MOBILE"
    : "DESKTOP";

  // Vercel's edge network sets this on every production request — no geo-IP
  // lookup needed, and nothing to fall back to when it's absent (local dev,
  // other hosts), so it just stays null there.
  const country = request.headers.get("x-vercel-ip-country");

  // Best-effort — a signed-in visitor's events get tagged with their
  // userId purely so an admin can cross-reference later; nothing in the
  // funnel math (all of it keyed on visitorId) depends on this being set.
  const session = await auth().catch(() => null);
  const userId = session?.user?.id ?? null;

  try {
    await db.insert(analyticsEvents).values({
      visitorId,
      userId,
      kind: kind as "LANDING_VIEW" | "QUIZ_STEP" | "QUIZ_COMPLETE",
      stepId,
      stepIndex,
      device,
      path,
      country,
    });
  } catch {
    // Never let a tracking failure surface to the caller.
  }

  const res = NextResponse.json({ ok: true });
  if (!existingVisitorId) {
    res.cookies.set(VISITOR_COOKIE, visitorId, {
      maxAge: VISITOR_COOKIE_MAX_AGE,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
  }
  return res;
}
