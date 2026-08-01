/**
 * NOVA's face — a hand-drawn human trainer bust, not a bot glyph. Built to
 * the same 24x24 stroke-icon convention as the lucide set it replaces
 * (round caps/joins, currentColor stroke) so it drops into every existing
 * icon slot at any size. A rounded head, a light smile, and shoulders wide
 * enough to read as "athletic" even at badge-size.
 */
export function CoachAvatarIcon({
  className,
  strokeWidth = 2.4,
}: {
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle cx="12" cy="7.5" r="4" />
      <path d="M9.3 8.1c.6.9 1.7 1.5 2.7 1.5s2.1-.6 2.7-1.5" />
      <path d="M3.5 20.5c0-4.4 3.6-7.5 8.5-7.5s8.5 3.1 8.5 7.5" />
    </svg>
  );
}
