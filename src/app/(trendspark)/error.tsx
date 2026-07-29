"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCw } from "lucide-react";

export default function Error({
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
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-background px-4 py-20 text-center">
      <p className="text-6xl">😵‍💫</p>
      <h1 className="mt-6 text-xl font-bold">משהו השתבש</h1>
      <p className="mt-2 max-w-sm text-sm text-muted">
        אירעה שגיאה בלתי צפויה. נסו שוב, ואם הבעיה נמשכת חזרו אלינו בעוד רגע.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 rounded-full gradient-brand px-6 py-3 text-sm font-bold text-white shadow-lg shadow-pink-500/20 transition-transform hover:scale-105"
        >
          <RotateCw className="size-4" />
          נסו שוב
        </button>
        <Link
          href="/dashboard"
          className="rounded-full border border-border px-6 py-3 text-sm font-semibold transition-colors hover:bg-surface"
        >
          חזרה לדשבורד
        </Link>
      </div>
    </div>
  );
}
