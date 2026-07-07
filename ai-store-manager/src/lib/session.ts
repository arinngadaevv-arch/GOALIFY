import crypto from "crypto";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { sessions, shops } from "@/db/schema";

const SESSION_COOKIE = "asm_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const INSTALL_STATE_COOKIE = "asm_install_state";
const INSTALL_STATE_TTL_SECONDS = 10 * 60; // 10 minutes, just long enough for the OAuth redirect round-trip

export async function createSession(shopId: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await db.insert(sessions).values({ shopId, token, expiresAt });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function getSessionShop() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const [row] = await db
    .select({ shop: shops, session: sessions })
    .from(sessions)
    .innerJoin(shops, eq(sessions.shopId, shops.id))
    .where(eq(sessions.token, token))
    .limit(1);

  if (!row || row.session.expiresAt < new Date()) return null;

  return row.shop;
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.delete(sessions).where(eq(sessions.token, token));
  }
  cookieStore.delete(SESSION_COOKIE);
}

// Short-lived, httpOnly cookie carrying the CSRF `state` value across the
// redirect to Shopify and back, so the OAuth callback can verify it.
export async function setInstallState(state: string) {
  const cookieStore = await cookies();
  cookieStore.set(INSTALL_STATE_COOKIE, state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: INSTALL_STATE_TTL_SECONDS,
  });
}

export async function consumeInstallState(): Promise<string | null> {
  const cookieStore = await cookies();
  const state = cookieStore.get(INSTALL_STATE_COOKIE)?.value ?? null;
  cookieStore.delete(INSTALL_STATE_COOKIE);
  return state;
}
