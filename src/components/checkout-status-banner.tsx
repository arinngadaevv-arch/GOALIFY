"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Info, X } from "lucide-react";

/**
 * Reads the `?checkout=success|cancelled` query param set by Stripe redirect URLs
 * and shows a friendly banner. On success it refreshes the route a couple of times
 * so the (async) webhook-driven plan update is reflected without a manual reload,
 * then strips the query param from the URL.
 */
export function CheckoutStatusBanner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const status = searchParams.get("checkout");
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (status !== "success") return;
    const timers = [
      setTimeout(() => router.refresh(), 1500),
      setTimeout(() => router.refresh(), 4000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [status, router]);

  if (dismissed || (status !== "success" && status !== "cancelled")) {
    return null;
  }

  function close() {
    setDismissed(true);
    router.replace(pathname, { scroll: false });
  }

  if (status === "success") {
    return (
      <div className="mb-6 flex items-start justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
        <span className="flex items-center gap-2">
          <CheckCircle2 className="size-4 shrink-0" />
          התשלום התקבל בהצלחה! המנוי שלכם מתעדכן ברגעים אלה.
        </span>
        <button onClick={close} aria-label="סגירה" className="text-emerald-300/70 hover:text-emerald-200">
          <X className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="mb-6 flex items-start justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-muted">
      <span className="flex items-center gap-2">
        <Info className="size-4 shrink-0" />
        התשלום בוטל - לא בוצע כל חיוב. אתם מוזמנים לנסות שוב בכל עת.
      </span>
      <button onClick={close} aria-label="סגירה" className="text-muted hover:text-foreground">
        <X className="size-4" />
      </button>
    </div>
  );
}
