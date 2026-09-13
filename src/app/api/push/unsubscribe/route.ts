import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { pushSubscriptions } from "@/lib/db/schema";

const unsubscribeSchema = z.object({ endpoint: z.string().url() });

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = unsubscribeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  // No ownership check beyond matching endpoint — a push subscription
  // endpoint is an unguessable per-browser secret URL, the same trust
  // model the Push API itself relies on, so knowing it is proof enough
  // this request comes from that same browser.
  await db
    .delete(pushSubscriptions)
    .where(eq(pushSubscriptions.endpoint, parsed.data.endpoint));

  return NextResponse.json({ ok: true });
}
