"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard/new";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "sign-up") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "משהו השתבש, נסו שוב");
          setLoading(false);
          return;
        }
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("אימייל או סיסמה שגויים");
        setLoading(false);
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("משהו השתבש, נסו שוב");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {mode === "sign-up" && (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-muted">
            שם מלא
          </label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 outline-none focus:border-neon-purple"
            placeholder="ישראל ישראלי"
          />
        </div>
      )}
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
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className="block text-sm font-medium text-muted">סיסמה</label>
          {mode === "sign-in" && (
            <Link
              href="/forgot-password"
              className="text-xs text-muted hover:text-foreground hover:underline"
            >
              שכחתם סיסמה?
            </Link>
          )}
        </div>
        <input
          required
          type="password"
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 outline-none focus:border-neon-purple"
          placeholder="לפחות 8 תווים"
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
        {mode === "sign-up" ? "יצירת חשבון" : "התחברות"}
      </button>

      <p className="text-center text-sm text-muted">
        {mode === "sign-up" ? (
          <>
            כבר יש לכם חשבון?{" "}
            <Link href="/sign-in" className="font-medium text-foreground hover:underline">
              התחברות
            </Link>
          </>
        ) : (
          <>
            אין לכם חשבון?{" "}
            <Link href="/sign-up" className="font-medium text-foreground hover:underline">
              הרשמה בחינם
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
