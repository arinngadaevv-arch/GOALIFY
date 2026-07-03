"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function BusinessSetupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [reachNotes, setReachNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, niche: "cosmetology", reachNotes }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "משהו השתבש, נסו שוב");
        setLoading(false);
        return;
      }
      router.push(`/dashboard/business/${data.business.id}`);
    } catch {
      setError("משהו השתבש, נסו שוב");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-muted">
          שם העסק
        </label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="לדוגמה: קליניקת יופי - שם + עיר"
          className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 outline-none focus:border-neon-purple"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-muted">
          איך את יוצרת קשר עם לקוחות קיימים?
        </label>
        <textarea
          rows={2}
          value={reachNotes}
          onChange={(e) => setReachNotes(e.target.value)}
          placeholder="לדוגמה: יש לי רשימת וואטסאפ, או: רק דרך אינסטגרם"
          className="w-full resize-none rounded-xl border border-border bg-surface px-4 py-2.5 outline-none focus:border-neon-purple"
        />
        <p className="mt-1.5 text-xs text-muted">
          חשוב לדעת מראש - חלק מהמהלכים דורשים גישה ללקוחות קיימים.
        </p>
      </div>

      {error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-full gradient-brand px-6 py-3.5 text-base font-bold text-white shadow-xl shadow-pink-500/25 transition-transform hover:scale-[1.01] disabled:opacity-60"
      >
        {loading && <Loader2 className="size-4 animate-spin" />}
        המשך
      </button>
    </form>
  );
}
