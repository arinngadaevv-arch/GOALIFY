/**
 * A minimal inline info strip below the CTA — three facts, no cards, no
 * borders. Deliberately plain text: this is supporting detail, not
 * something that should compete for attention with the hero or the CTA.
 */
export function WorkoutMeta({
  exerciseCount,
  durationMinutes,
  intensity,
}: {
  exerciseCount: number;
  durationMinutes: number;
  intensity: string;
}) {
  return (
    <div className="flex items-center justify-center gap-4 text-xs font-semibold tracking-[0.05em] text-mist uppercase lg:justify-start">
      <span>{exerciseCount} exercises</span>
      <span className="text-haze">·</span>
      <span>~{durationMinutes} min</span>
      <span className="text-haze">·</span>
      <span>{intensity}</span>
    </div>
  );
}
