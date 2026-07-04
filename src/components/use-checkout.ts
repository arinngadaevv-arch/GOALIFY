"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export type CheckoutPlan = "PRO" | "BUSINESS";

export function useCheckout() {
  const { status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState<CheckoutPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout(plan: CheckoutPlan) {
    setError(null);

    if (status !== "authenticated") {
      router.push(
        `/sign-up?callbackUrl=${encodeURIComponent(`/dashboard/account?checkout=${plan}`)}`
      );
      return;
    }

    setLoading(plan);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();

      if (!res.ok || !data.url) {
        setError(data.error ?? "משהו השתבש, נסו שוב");
        setLoading(null);
        return;
      }

      window.location.href = data.url;
    } catch {
      setError("משהו השתבש, נסו שוב");
      setLoading(null);
    }
  }

  return { startCheckout, loading, error, isAuthenticated: status === "authenticated" };
}
