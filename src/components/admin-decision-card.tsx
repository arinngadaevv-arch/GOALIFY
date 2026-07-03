"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";
import {
  CONFIDENCE_LABELS,
  MOVE_CHANNEL_LABELS,
  type ConfidenceLevel,
  type MoveChannel,
  type MoveType,
} from "@/lib/diagnosis/types";

interface DraftDecision {
  id: string;
  diagnosis: string;
  confidence: ConfidenceLevel;
  confidenceReasoning: string;
  evidence: string[];
  alternativesConsidered: { hypothesis: string; whyRejected: string }[];
  moveType: MoveType;
  moveChannel: MoveChannel;
  moveDescription: string;
  estimatedMinutes: number | null;
  falsificationCriteria: string;
}

export function AdminDecisionCard({
  draft,
  businessName,
}: {
  draft: DraftDecision;
  businessName: string;
}) {
  const router = useRouter();
  const [fields, setFields] = useState({
    diagnosis: draft.diagnosis,
    confidence: draft.confidence,
    confidenceReasoning: draft.confidenceReasoning,
    moveType: draft.moveType,
    moveChannel: draft.moveChannel,
    moveDescription: draft.moveDescription,
    estimatedMinutes: draft.estimatedMinutes,
    falsificationCriteria: draft.falsificationCriteria,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function approve() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/decisions/${draft.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "משהו השתבש");
        setLoading(false);
        return;
      }
      router.refresh();
    } catch {
      setError("משהו השתבש");
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-surface/60 p-5">
      <p className="text-xs font-bold text-neon-purple">{businessName}</p>

      <label className="mt-3 block text-xs text-muted">אבחנה</label>
      <textarea
        value={fields.diagnosis}
        onChange={(e) => setFields((f) => ({ ...f, diagnosis: e.target.value }))}
        rows={2}
        className="mt-1 w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-neon-purple"
      />

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-muted">ביטחון</label>
          <select
            value={fields.confidence}
            onChange={(e) =>
              setFields((f) => ({
                ...f,
                confidence: e.target.value as ConfidenceLevel,
              }))
            }
            className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-neon-purple"
          >
            {Object.entries(CONFIDENCE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-muted">סוג</label>
          <select
            value={fields.moveType}
            onChange={(e) =>
              setFields((f) => ({ ...f, moveType: e.target.value as MoveType }))
            }
            className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-neon-purple"
          >
            <option value="EXPLOIT">Exploit</option>
            <option value="EXPLORE">Explore</option>
          </select>
        </div>
      </div>

      <label className="mt-3 block text-xs text-muted">נימוק הביטחון</label>
      <textarea
        value={fields.confidenceReasoning}
        onChange={(e) =>
          setFields((f) => ({ ...f, confidenceReasoning: e.target.value }))
        }
        rows={2}
        className="mt-1 w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-neon-purple"
      />

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-muted">ערוץ</label>
          <select
            value={fields.moveChannel}
            onChange={(e) =>
              setFields((f) => ({
                ...f,
                moveChannel: e.target.value as MoveChannel,
              }))
            }
            className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-neon-purple"
          >
            {Object.entries(MOVE_CHANNEL_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-muted">זמן (דק&apos;)</label>
          <input
            type="number"
            value={fields.estimatedMinutes ?? ""}
            onChange={(e) =>
              setFields((f) => ({
                ...f,
                estimatedMinutes: e.target.value ? Number(e.target.value) : null,
              }))
            }
            className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-neon-purple"
          />
        </div>
      </div>

      <label className="mt-3 block text-xs text-muted">המהלך (מה שהלקוחה תראה)</label>
      <textarea
        value={fields.moveDescription}
        onChange={(e) =>
          setFields((f) => ({ ...f, moveDescription: e.target.value }))
        }
        rows={3}
        className="mt-1 w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-neon-purple"
      />

      <label className="mt-3 block text-xs text-muted">קריטריון הפרכה</label>
      <textarea
        value={fields.falsificationCriteria}
        onChange={(e) =>
          setFields((f) => ({ ...f, falsificationCriteria: e.target.value }))
        }
        rows={2}
        className="mt-1 w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-neon-purple"
      />

      {draft.evidence.length > 0 && (
        <div className="mt-3 rounded-lg bg-surface-2 p-3 text-xs text-muted">
          <p className="font-bold text-foreground">ראיות (לקריאה בלבד)</p>
          <ul className="mt-1 list-disc space-y-0.5 pr-4">
            {draft.evidence.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      <button
        onClick={approve}
        disabled={loading}
        className="mt-4 flex items-center gap-2 rounded-full gradient-brand px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-pink-500/20 disabled:opacity-60"
      >
        {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        אישור ושליחה
      </button>
    </div>
  );
}
