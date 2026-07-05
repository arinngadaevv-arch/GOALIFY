"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, Clock, Copy, Loader2, Target } from "lucide-react";
import {
  CONFIDENCE_LABELS,
  MOVE_CHANNEL_LABELS,
  type ConfidenceLevel,
  type MoveChannel,
  type MoveType,
} from "@/lib/diagnosis/types";

const CONFIDENCE_CLASSES: Record<ConfidenceLevel, string> = {
  HIGH: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  MEDIUM: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  LOW: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
};

interface DecisionView {
  id: string;
  diagnosis: string;
  confidence: ConfidenceLevel;
  confidenceReasoning: string;
  evidence: string[];
  alternativesConsidered: { hypothesis: string; whyRejected: string }[];
  moveType: MoveType;
  moveChannel: MoveChannel;
  moveDescription: string;
  executionAsset: string | null;
  estimatedMinutes: number | null;
  falsificationCriteria: string;
}

export function TodaysMoveCard({
  decision,
  initialAnswered = false,
}: {
  decision: DecisionView;
  initialAnswered?: boolean;
}) {
  const router = useRouter();
  const [showEvidence, setShowEvidence] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answered, setAnswered] = useState(initialAnswered);
  const [copied, setCopied] = useState(false);

  async function copyAsset() {
    if (!decision.executionAsset) return;
    try {
      await navigator.clipboard.writeText(decision.executionAsset);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked; silently ignore - the text is still visible.
    }
  }

  const isQuiet = decision.moveChannel === "NONE";

  async function submitImmediate(
    didExecute: boolean,
    executionTime: "UNDER_10" | "TEN_TO_30" | "OVER_30" | null
  ) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/decisions/${decision.id}/outcome`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ didExecute, executionTime }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "משהו השתבש");
        setLoading(false);
        return;
      }
      setAnswered(true);
      router.refresh();
    } catch {
      setError("משהו השתבש");
      setLoading(false);
    }
  }

  if (isQuiet) {
    return (
      <div className="rounded-2xl border border-border bg-surface/60 p-6 text-center">
        <p className="text-sm text-muted">אין מהלך היום.</p>
        <p className="mt-1 font-medium">
          תעבדי כרגיל - נסמן לך ברגע שנזהה הזדמנות אמיתית.
        </p>
      </div>
    );
  }

  return (
    <div className="gradient-border glow-pink animate-materialize rounded-2xl bg-surface p-6">
      <div className="flex items-center gap-2 text-xs font-bold text-neon-pink">
        <Target className="size-3.5" />
        המהלך של היום
      </div>

      <p className="mt-3 animate-fade-in-up delay-1 text-sm leading-relaxed text-muted">
        {decision.diagnosis}
      </p>

      <div className="mt-4 animate-fade-in-up delay-2 rounded-xl bg-surface-2 p-4">
        <p className="text-sm font-medium leading-relaxed">
          {decision.moveDescription}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${CONFIDENCE_CLASSES[decision.confidence]}`}
          >
            ביטחון: {CONFIDENCE_LABELS[decision.confidence]}
          </span>
          {decision.estimatedMinutes && (
            <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 text-xs text-muted">
              <Clock className="size-3" />
              {decision.estimatedMinutes} דק&apos;
            </span>
          )}
          <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 text-xs text-muted">
            {MOVE_CHANNEL_LABELS[decision.moveChannel]}
          </span>
        </div>
      </div>

      {decision.executionAsset && (
        <div className="sheen mt-4 animate-fade-in-up delay-3 rounded-xl border border-neon-purple/30 bg-neon-purple/[0.06] p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="flex items-center gap-1.5 text-xs font-bold text-neon-purple">
              <Check className="size-3.5" />
              מוכן לך - רק להעתיק ולשלוח
            </p>
            <button
              onClick={copyAsset}
              className="flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-surface"
            >
              {copied ? (
                <>
                  <Check key="copied" className="size-3.5 animate-pop text-emerald-400" />
                  הועתק
                </>
              ) : (
                <>
                  <Copy className="size-3.5" />
                  העתקה
                </>
              )}
            </button>
          </div>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
            {decision.executionAsset}
          </p>
        </div>
      )}

      <button
        onClick={() => setShowEvidence((s) => !s)}
        className="mt-3 flex items-center gap-1 text-xs text-muted hover:text-foreground"
      >
        <ChevronDown
          className={`size-3.5 transition-transform ${showEvidence ? "rotate-180" : ""}`}
        />
        למה אנחנו חושבים ככה?
      </button>

      {showEvidence && (
        <div className="mt-3 space-y-3 rounded-xl border border-border p-4 text-xs text-muted">
          <div>
            <p className="font-bold text-foreground">סוג המהלך</p>
            <p className="mt-1">
              {decision.moveType === "EXPLOIT"
                ? "מבוסס על ידע קודם שכבר הוכיח את עצמו אצלך."
                : "זו השערה שאנחנו בודקים היום לראשונה אצלך - זה תקין, וזה בדיוק איך שנלמד להכיר את העסק שלך יותר טוב."}
            </p>
          </div>
          <div>
            <p className="font-bold text-foreground">הראיות</p>
            <ul className="mt-1 list-disc space-y-0.5 pr-4">
              {decision.evidence.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-bold text-foreground">למה לא משהו אחר</p>
            {decision.alternativesConsidered.length === 0 ? (
              <p className="mt-1">לא הייתה חלופה סבירה אחרת שקילה.</p>
            ) : (
              <ul className="mt-1 space-y-1">
                {decision.alternativesConsidered.map((alt, i) => (
                  <li key={i}>
                    <span className="text-foreground">{alt.hypothesis}</span>{" "}
                    - {alt.whyRejected}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <p className="font-bold text-foreground">למה הביטחון הזה</p>
            <p className="mt-1">{decision.confidenceReasoning}</p>
          </div>
          <div>
            <p className="font-bold text-foreground">איך נדע אם טעינו</p>
            <p className="mt-1">{decision.falsificationCriteria}</p>
          </div>
        </div>
      )}

      {!answered ? (
        <div className="mt-5 border-t border-border pt-4">
          <p className="text-sm font-medium">ביצעת את המהלך?</p>
          {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              disabled={loading}
              onClick={() => submitImmediate(false, null)}
              className="rounded-full border border-border px-4 py-2 text-sm font-semibold transition-colors hover:bg-surface disabled:opacity-60"
            >
              עדיין לא
            </button>
            {(["UNDER_10", "TEN_TO_30", "OVER_30"] as const).map((t) => (
              <button
                key={t}
                disabled={loading}
                onClick={() => submitImmediate(true, t)}
                className="flex items-center gap-1.5 rounded-full gradient-brand px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
              >
                {loading && <Loader2 className="size-3.5 animate-spin" />}
                {t === "UNDER_10" && "כן, לקח לי פחות מ-10 דק'"}
                {t === "TEN_TO_30" && "כן, 10-30 דק'"}
                {t === "OVER_30" && "כן, יותר מ-30 דק'"}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <p className="mt-5 flex items-center gap-1.5 border-t border-border pt-4 text-sm text-emerald-400">
          <Check className="size-4" />
          תודה! נחזור לשאול בעוד יומיים מה קרה.
        </p>
      )}
    </div>
  );
}
