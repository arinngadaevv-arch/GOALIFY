import { TRAINER, TrainerCard } from "./trainer-card";

/**
 * The landing hero's coach showcase. GOALIFY has exactly one coach — this
 * renders Coach Atlas statically, with no rotation, no dot indicators, and
 * no swipe/scroll between coaches (there used to be a multi-coach carousel
 * here; it's gone along with the roster it cycled through).
 */
export function CoachHeroCard({ className }: { className?: string }) {
  return <TrainerCard trainer={TRAINER} className={className} />;
}
