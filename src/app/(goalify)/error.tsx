"use client";

import { useEffect } from "react";
import { RotateCw } from "lucide-react";
import { Brand } from "@/components/goalify/brand";
import { GlowButton, GlowLink } from "@/components/goalify/ui/glow-button";

export default function GoalifyError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center px-5 text-center">
      <Brand />
      <p className="mt-10 text-6xl" aria-hidden>
        😵‍💫
      </p>
      <h1 className="gf-display mt-4 text-2xl font-extrabold text-ink">
        Something went sideways
      </h1>
      <p className="mt-2 max-w-sm text-sm text-mist">
        That&apos;s on us, not on you. Try again — your progress is safe on this
        device.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <GlowButton size="lg" onClick={reset}>
          <RotateCw className="size-4" />
          Try again
        </GlowButton>
        <GlowLink href="/home" variant="glass" size="lg">
          Go to dashboard
        </GlowLink>
      </div>
    </main>
  );
}
