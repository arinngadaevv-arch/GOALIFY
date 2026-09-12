import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin";
import { metaCapiConfig, sendMetaTestEvent } from "@/lib/goalify/meta-capi";

// Owner-only: fires a small synthetic Purchase event straight at Meta's
// Conversions API — the fastest way to confirm NEXT_PUBLIC_META_PIXEL_ID
// and META_CONVERSIONS_API_ACCESS_TOKEN are actually wired up correctly
// without waiting for (or faking) a real payment. Pass ?testEventCode=...
// (from Events Manager > Test Events) to see it land there in real time.
export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const config = metaCapiConfig();
  if (!config.pixelId || !config.accessToken) {
    return NextResponse.json({ config, result: null });
  }

  const testEventCode =
    new URL(req.url).searchParams.get("testEventCode")?.trim() || undefined;

  try {
    const result = await sendMetaTestEvent(testEventCode);
    return NextResponse.json({ config, result });
  } catch (err) {
    console.error("[meta-capi-diagnostics] Unexpected failure:", err);
    return NextResponse.json(
      {
        config,
        error:
          err instanceof Error
            ? `${err.name}: ${err.message}`
            : "Unexpected error running diagnostics.",
      },
      { status: 500 },
    );
  }
}
