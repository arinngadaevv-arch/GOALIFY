import { Flame } from "lucide-react";

export function ViralityBadge({ score }: { score: number }) {
  const tier =
    score >= 80
      ? { label: "פוטנציאל גבוה", classes: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" }
      : score >= 55
        ? { label: "פוטנציאל בינוני", classes: "bg-amber-500/15 text-amber-400 border-amber-500/30" }
        : { label: "פוטנציאל נמוך", classes: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30" };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${tier.classes}`}
    >
      <Flame className="size-3.5" />
      {score}/100 · {tier.label}
    </span>
  );
}
