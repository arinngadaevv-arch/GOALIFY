"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, Loader2, Wand2, X } from "lucide-react";
import clsx from "clsx";

export interface RecommendationView {
  id: string;
  category: string;
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  problem: string;
  reason: string;
  estimatedImpact: string | null;
  aiRecommendation: string;
  productTitle?: string | null;
  automated: boolean;
  status: string;
  error?: string | null;
}

const SEVERITY_STYLES: Record<RecommendationView["severity"], string> = {
  critical: "bg-bad/15 text-bad",
  high: "bg-warn/15 text-warn",
  medium: "bg-accent-soft text-accent",
  low: "bg-surface-2 text-muted",
};

const SEVERITY_LABELS: Record<RecommendationView["severity"], string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

export function RecommendationCard({ rec }: { rec: RecommendationView }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [busy, setBusy] = useState<"apply" | "dismiss" | null>(null);
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(
    rec.status === "failed" && rec.error ? { ok: false, message: rec.error } : null
  );

  async function post(action: "apply" | "dismiss") {
    setBusy(action);
    setFeedback(null);
    try {
      const response = await fetch(`/api/recommendations/${rec.id}/${action}`, {
        method: "POST",
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? `${action} failed`);
      if (action === "apply") {
        setFeedback({ ok: true, message: body.summary ?? "Fix applied" });
      }
      router.refresh();
    } catch (e) {
      setFeedback({ ok: false, message: e instanceof Error ? e.message : `${action} failed` });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-4">
        <button
          className="flex flex-1 flex-col items-start gap-1.5 text-left"
          onClick={() => setExpanded((v) => !v)}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={clsx(
                "rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
                SEVERITY_STYLES[rec.severity]
              )}
            >
              {SEVERITY_LABELS[rec.severity]}
            </span>
            <span className="text-[11px] uppercase tracking-wide text-muted">{rec.category}</span>
            {rec.productTitle && (
              <span className="max-w-48 truncate text-[11px] text-muted">· {rec.productTitle}</span>
            )}
          </div>
          <p className="text-sm font-medium leading-snug">{rec.title}</p>
          {rec.estimatedImpact && (
            <p className="text-xs text-good">{rec.estimatedImpact}</p>
          )}
        </button>

        <div className="flex shrink-0 items-center gap-2">
          {rec.automated ? (
            <button
              onClick={() => post("apply")}
              disabled={busy !== null}
              className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {busy === "apply" ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Wand2 size={13} />
              )}
              {busy === "apply" ? "Fixing…" : "Fix it"}
            </button>
          ) : (
            <span className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted">
              Manual
            </span>
          )}
          <button
            onClick={() => post("dismiss")}
            disabled={busy !== null}
            title="Dismiss"
            className="rounded-lg border border-border p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-foreground disabled:opacity-60"
          >
            {busy === "dismiss" ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <X size={13} />
            )}
          </button>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-2"
            aria-label={expanded ? "Collapse details" : "Expand details"}
          >
            <ChevronDown
              size={14}
              className={clsx("transition-transform", expanded && "rotate-180")}
            />
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={clsx(
            "mt-3 flex items-center gap-2 rounded-lg px-3 py-2 text-xs",
            feedback.ok ? "bg-good/10 text-good" : "bg-bad/10 text-bad"
          )}
        >
          {feedback.ok && <Check size={13} />}
          {feedback.message}
        </div>
      )}

      {expanded && (
        <dl className="mt-4 grid gap-3 border-t border-border pt-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted">
              What&apos;s wrong
            </dt>
            <dd className="mt-1 text-sm leading-relaxed">{rec.problem}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted">
              Why it matters
            </dt>
            <dd className="mt-1 text-sm leading-relaxed">{rec.reason}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted">
              AI recommendation
            </dt>
            <dd className="mt-1 text-sm leading-relaxed">{rec.aiRecommendation}</dd>
          </div>
        </dl>
      )}
    </div>
  );
}
