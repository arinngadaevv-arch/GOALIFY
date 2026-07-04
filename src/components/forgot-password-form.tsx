"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2 } from "lucide-react";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "משהו השתבש, נסו שוב");
        setLoading(false);
        return;
      }
      setDone(true);
    } catch {
      setError("משהו השתבש, נסו שוב");
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="text-center">
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-emerald-500/10">
          <CheckCircle2 className="size-6 text-emerald-400" />
        </div>
        <h2 className="mt-4 font-bold">בדקו את תיבת האימייל</h2>
        <p className="mt-2 text-sm text-muted">
          אם קיים חשבון עם כתובת האימייל הזו, שלחנו אליו קישור לאיפוס הסיסמה.
          הקישור בתוקף לשעה אחת.
        </p>
        <Link
          href="/sign-in"
          className="mt-6 inline-block text-sm font-medium text-foreground hover:underline"
        >
          חזרה להתחברות
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-muted">
        הזינו את כתובת האימייל שלכם ונשלח לכם קישור לאיפוס הסיסמה.
      </p>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-muted">
          אימייל
        </label>
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 outline-none focus:border-neon-purple"
          placeholder="you@example.com"
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-full gradient-brand px-4 py-3 text-sm font-bold text-white shadow-lg shadow-pink-500/20 transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {loading && <Loader2 className="size-4 animate-spin" />}
        שליחת קישור לאיפוס
      </button>

      <p className="text-center text-sm text-muted">
        <Link href="/sign-in" className="font-medium text-foreground hover:underline">
          חזרה להתחברות
        </Link>
      </p>
    </form>
  );
}
