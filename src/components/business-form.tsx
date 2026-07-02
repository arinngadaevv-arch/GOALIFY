"use client";

import { useState, type FormEvent } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { PLATFORM_LABELS, TONE_LABELS } from "@/lib/ai/types";
import type { BusinessInput } from "@/lib/ai/types";

const TONES = Object.entries(TONE_LABELS) as [BusinessInput["tone"], string][];
const PLATFORMS = Object.entries(PLATFORM_LABELS) as [
  BusinessInput["platform"],
  string,
][];

export function BusinessForm({
  onSuccess,
}: {
  onSuccess: (data: { project: { id: string } }) => void;
}) {
  const [businessType, setBusinessType] = useState("");
  const [description, setDescription] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [tone, setTone] = useState<BusinessInput["tone"]>("TRENDY");
  const [platform, setPlatform] = useState<BusinessInput["platform"]>("BOTH");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessType,
          description,
          targetAudience,
          tone,
          platform,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "משהו השתבש, נסו שוב");
        setLoading(false);
        return;
      }

      onSuccess(data);
    } catch {
      setError("משהו השתבש, נסו שוב");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-muted">
          סוג העסק
        </label>
        <input
          required
          value={businessType}
          onChange={(e) => setBusinessType(e.target.value)}
          placeholder="לדוגמה: בית קפה בוטיק, סטודיו קוסמטיקה, חדר כושר"
          className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 outline-none focus:border-neon-purple"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-muted">
          תיאור המוצר / השירות
        </label>
        <textarea
          required
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="ספרו לנו מה מייחד את העסק שלכם, מה אתם מוכרים ומה הופך אתכם לשונים"
          className="w-full resize-none rounded-xl border border-border bg-surface px-4 py-2.5 outline-none focus:border-neon-purple"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-muted">
          קהל היעד
        </label>
        <input
          required
          value={targetAudience}
          onChange={(e) => setTargetAudience(e.target.value)}
          placeholder="לדוגמה: נשים 25-40 בתל אביב שמתעניינות בטיפוח"
          className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 outline-none focus:border-neon-purple"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-muted">
            סגנון כתיבה
          </label>
          <div className="grid grid-cols-2 gap-2">
            {TONES.map(([value, label]) => (
              <button
                type="button"
                key={value}
                onClick={() => setTone(value)}
                className={`rounded-xl border px-3 py-2 text-sm transition-colors ${
                  tone === value
                    ? "border-neon-purple bg-neon-purple/10 text-foreground"
                    : "border-border text-muted hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-muted">
            פלטפורמה
          </label>
          <div className="grid grid-cols-1 gap-2">
            {PLATFORMS.map(([value, label]) => (
              <button
                type="button"
                key={value}
                onClick={() => setPlatform(value)}
                className={`rounded-xl border px-3 py-2 text-sm transition-colors ${
                  platform === value
                    ? "border-neon-blue bg-neon-blue/10 text-foreground"
                    : "border-border text-muted hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-full gradient-brand px-6 py-4 text-base font-bold text-white shadow-xl shadow-pink-500/25 transition-transform hover:scale-[1.01] disabled:opacity-60 disabled:hover:scale-100"
      >
        {loading ? (
          <>
            <Loader2 className="size-5 animate-spin" />
            יוצר תוכן ויראלי בשבילכם...
          </>
        ) : (
          <>
            <Sparkles className="size-5" />
            צרו לי תוכן עכשיו
          </>
        )}
      </button>
    </form>
  );
}
