"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const OPTIONS = [
  { value: "MORE_VIEWS", label: "יותר צפיות" },
  { value: "MORE_MESSAGES", label: "יותר הודעות" },
  { value: "MORE_COMMENTS", label: "יותר תגובות" },
  { value: "NOTHING", label: "כלום מיוחד" },
  { value: "OTHER", label: "משהו אחר" },
] as const;

export function FollowupPrompt({
  decisionId,
  moveDescription,
}: {
  decisionId: string;
  moveDescription: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [showNote, setShowNote] = useState(false);
  const [pendingResult, setPendingResult] = useState<
    (typeof OPTIONS)[number]["value"] | null
  >(null);

  async function submit(result: (typeof OPTIONS)[number]["value"]) {
    setLoading(result);
    setError(null);
    try {
      const res = await fetch(`/api/decisions/${decisionId}/outcome/followup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ result, resultNote: note || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "משהו השתבש");
        setLoading(null);
        return;
      }
      router.refresh();
    } catch {
      setError("משהו השתבש");
      setLoading(null);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-surface/60 p-6">
      <p className="text-sm font-bold">המהלך שלפני יומיים - מה קרה?</p>
      <p className="mt-1 text-xs text-muted">{moveDescription}</p>

      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}

      <div className="mt-4 flex flex-wrap gap-2">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            disabled={loading !== null}
            onClick={() => {
              setPendingResult(opt.value);
              setShowNote(true);
            }}
            className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-60 ${
              pendingResult === opt.value
                ? "border-neon-purple bg-neon-purple/10"
                : "border-border hover:bg-surface"
            }`}
          >
            {loading === opt.value && <Loader2 className="size-3.5 animate-spin" />}
            {opt.label}
          </button>
        ))}
      </div>

      {showNote && pendingResult && (
        <div className="mt-4">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="רוצה להוסיף משהו? (אופציונלי)"
            className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-neon-purple"
          />
          <button
            onClick={() => submit(pendingResult)}
            disabled={loading !== null}
            className="mt-3 flex items-center gap-2 rounded-full gradient-brand px-5 py-2 text-sm font-bold text-white disabled:opacity-60"
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            שליחה
          </button>
        </div>
      )}
    </div>
  );
}
