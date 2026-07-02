"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Settings, Sparkles } from "lucide-react";
import { useCheckout } from "@/components/use-checkout";
import type { Plan } from "@/lib/usage";

export function SubscriptionActions({
  currentPlan,
  hasStripeCustomer,
}: {
  currentPlan: Plan;
  hasStripeCustomer: boolean;
}) {
  const { startCheckout, loading, error } = useCheckout();
  const searchParams = useSearchParams();
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);
  const triggered = useRef(false);

  useEffect(() => {
    const requestedPlan = searchParams.get("checkout");
    if (
      !triggered.current &&
      (requestedPlan === "PRO" || requestedPlan === "BUSINESS") &&
      requestedPlan !== currentPlan
    ) {
      triggered.current = true;
      startCheckout(requestedPlan);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, currentPlan]);

  async function openPortal() {
    setPortalError(null);
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setPortalError(data.error ?? "משהו השתבש, נסו שוב");
        setPortalLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setPortalError("משהו השתבש, נסו שוב");
      setPortalLoading(false);
    }
  }

  const isAutoRedirecting =
    (searchParams.get("checkout") === "PRO" ||
      searchParams.get("checkout") === "BUSINESS") &&
    loading !== null;

  return (
    <div className="mt-6 space-y-3">
      {isAutoRedirecting && (
        <p className="flex items-center gap-2 rounded-lg bg-surface-2 px-3 py-2 text-sm text-muted">
          <Loader2 className="size-4 animate-spin" />
          מעבירים אתכם לתשלום מאובטח...
        </p>
      )}

      {(error || portalError) && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error || portalError}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        {currentPlan !== "PRO" && currentPlan !== "BUSINESS" && (
          <button
            onClick={() => startCheckout("PRO")}
            disabled={loading !== null}
            className="flex items-center gap-2 rounded-full gradient-brand px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-pink-500/20 disabled:opacity-60"
          >
            {loading === "PRO" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            שדרוג לפרו
          </button>
        )}
        {currentPlan !== "BUSINESS" && (
          <button
            onClick={() => startCheckout("BUSINESS")}
            disabled={loading !== null}
            className="flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-surface disabled:opacity-60"
          >
            {loading === "BUSINESS" && <Loader2 className="size-4 animate-spin" />}
            שדרוג לעסקי
          </button>
        )}
        {hasStripeCustomer && (
          <button
            onClick={openPortal}
            disabled={portalLoading}
            className="flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-surface disabled:opacity-60"
          >
            {portalLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Settings className="size-4" />
            )}
            ניהול מנוי וחיוב
          </button>
        )}
      </div>
    </div>
  );
}
