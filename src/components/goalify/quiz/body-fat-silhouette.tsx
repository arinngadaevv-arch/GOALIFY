/**
 * A stylised, illustrated male physique silhouette used by the body-fat
 * estimation step. Deliberately NOT photographic — there's no way to
 * verify a stock photo's actual body-fat percentage, so claiming one
 * "is" 15% would just be a fabricated label on a real person's body.
 * An illustration makes the same visual point honestly.
 *
 * All four levels share the same head/shoulder/limb geometry and only vary
 * waist width and ab-line count, so the four cards read as one consistent
 * scale rather than four unrelated drawings.
 */

const WAIST_HALF_WIDTH: Record<1 | 2 | 3 | 4, number> = {
  1: 12,
  2: 14,
  3: 17,
  4: 22,
};

const AB_LINES: Record<1 | 2 | 3 | 4, number> = {
  1: 3,
  2: 2,
  3: 0,
  4: 0,
};

export function BodyFatSilhouette({
  level,
  className,
}: {
  level: 1 | 2 | 3 | 4;
  className?: string;
}) {
  const waist = WAIST_HALF_WIDTH[level];
  const abLines = AB_LINES[level];
  const soft = level === 4;

  return (
    <svg
      viewBox="0 0 100 160"
      fill="none"
      className={className}
      aria-hidden
    >
      {/* Legs */}
      <path
        d="M38 100 L34 152 Q34 156 38 156 L44 156 Q46 156 46 152 L48 100 Z"
        fill="currentColor"
        fillOpacity={0.22}
      />
      <path
        d="M62 100 L66 152 Q66 156 62 156 L56 156 Q54 156 54 152 L52 100 Z"
        fill="currentColor"
        fillOpacity={0.22}
      />

      {/* Arms */}
      <path
        d={`M${30 - (waist - 12) * 0.3} 38 Q${20 - (waist - 12) * 0.3} 46 ${22 - (waist - 12) * 0.3} 72 Q${23 - (waist - 12) * 0.3} 80 ${29 - (waist - 12) * 0.3} 79 Q${27 - (waist - 12) * 0.3} 55 ${34 - (waist - 12) * 0.3} 40 Z`}
        fill="currentColor"
        fillOpacity={0.32}
      />
      <path
        d={`M${70 + (waist - 12) * 0.3} 38 Q${80 + (waist - 12) * 0.3} 46 ${78 + (waist - 12) * 0.3} 72 Q${77 + (waist - 12) * 0.3} 80 ${71 + (waist - 12) * 0.3} 79 Q${73 + (waist - 12) * 0.3} 55 ${66 + (waist - 12) * 0.3} 40 Z`}
        fill="currentColor"
        fillOpacity={0.32}
      />

      {/* Torso: shoulders -> chest -> waist -> hips, waist width varies by level */}
      <path
        d={`M28 36
            Q26 34 30 32
            L70 32
            Q74 34 72 36
            L${68} 62
            Q${68} 68 ${50 + waist} 74
            L${50 + waist} 92
            Q${50 + waist} 98 42 100
            L${50 - waist} 100
            Q${50 - waist} 98 ${50 - waist} 92
            L${50 - waist} 74
            Q32 68 32 62
            Z`}
        fill="currentColor"
        fillOpacity={soft ? 0.28 : 0.4}
      />

      {/* Head + neck */}
      <circle cx="50" cy="18" r="11" fill="currentColor" fillOpacity={0.4} />
      <path
        d="M44 26 L44 34 Q50 38 56 34 L56 26 Z"
        fill="currentColor"
        fillOpacity={0.4}
      />

      {/* Pec line */}
      {abLines > 0 && (
        <path
          d="M36 42 Q50 47 64 42"
          stroke="currentColor"
          strokeWidth={1.4}
          strokeLinecap="round"
          opacity={0.75}
        />
      )}

      {/* Ab definition lines — count scales with leanness */}
      {Array.from({ length: abLines }).map((_, i) => (
        <line
          key={i}
          x1={50 - waist + 6}
          x2={50 + waist - 6}
          y1={52 + i * 8}
          y2={52 + i * 8}
          stroke="currentColor"
          strokeWidth={1.2}
          strokeLinecap="round"
          opacity={0.6}
        />
      ))}
      {abLines > 0 && (
        <line
          x1="50"
          x2="50"
          y1="48"
          y2={48 + abLines * 8}
          stroke="currentColor"
          strokeWidth={1.2}
          strokeLinecap="round"
          opacity={0.6}
        />
      )}
    </svg>
  );
}
