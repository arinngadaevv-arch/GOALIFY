"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";

const MODES = [
  {
    value: "suggest_only",
    label: "Suggest Only",
    description: "The AI only suggests. You review and apply every change yourself.",
  },
  {
    value: "approve",
    label: "Approve Mode",
    description: "The AI prepares each change; you approve it with one click before it goes live.",
  },
  {
    value: "auto",
    label: "Auto Mode",
    description:
      "The AI automatically applies safe improvements in categories you trust. Critical actions always ask first.",
  },
] as const;

export function AutomationModePicker({ current }: { current: string }) {
  const router = useRouter();
  const [selected, setSelected] = useState(current);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function select(mode: string) {
    const previous = selected;
    setSelected(mode);
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ automationMode: mode }),
      });
      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.error ?? "Failed to save");
      }
      router.refresh();
    } catch (e) {
      setSelected(previous);
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {MODES.map((mode) => (
        <button
          key={mode.value}
          onClick={() => select(mode.value)}
          disabled={saving}
          className={clsx(
            "flex flex-col items-start gap-1 rounded-xl border p-4 text-left transition-colors",
            selected === mode.value
              ? "border-accent bg-accent-soft"
              : "border-border bg-surface hover:bg-surface-2"
          )}
        >
          <span className="text-sm font-medium">{mode.label}</span>
          <span className="text-xs text-muted">{mode.description}</span>
        </button>
      ))}
      {error && <p className="text-xs text-bad">{error}</p>}
    </div>
  );
}
