import { Sparkles } from "lucide-react";
import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`flex items-center gap-2 font-bold text-lg ${className}`}
    >
      <span className="grid place-items-center size-8 rounded-xl gradient-brand shrink-0">
        <Sparkles className="size-4 text-white" strokeWidth={2.5} />
      </span>
      <span>
        Trend<span className="gradient-text">Spark</span> AI
      </span>
    </Link>
  );
}
