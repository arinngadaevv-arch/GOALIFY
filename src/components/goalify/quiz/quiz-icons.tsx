import clsx from "clsx";
import {
  Award,
  BatteryLow,
  BicepsFlexed,
  Calendar,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Crown,
  Dumbbell,
  Flame,
  Gauge,
  HeartPulse,
  HelpCircle,
  Hourglass,
  Mars,
  RefreshCw,
  Rocket,
  RotateCcw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Sprout,
  Target,
  ThumbsUp,
  Timer,
  Trophy,
  Utensils,
  Venus,
  Zap,
  type LucideIcon,
} from "lucide-react";

/**
 * Every glyph a quiz answer can carry, mapped to a proper icon component.
 * Replaces raw emoji characters — every "icon" value below must exist here.
 */
export const QUIZ_ICONS = {
  flame: Flame,
  dumbbell: Dumbbell,
  sparkles: Sparkles,
  zap: Zap,
  hourglass: Hourglass,
  batteryLow: BatteryLow,
  helpCircle: HelpCircle,
  heartPulse: HeartPulse,
  rotateCcw: RotateCcw,
  crown: Crown,
  biceps: BicepsFlexed,
  trophy: Trophy,
  sprout: Sprout,
  refresh: RefreshCw,
  award: Award,
  checkCircle: CheckCircle2,
  shieldCheck: ShieldCheck,
  shield: Shield,
  shieldAlert: ShieldAlert,
  timer: Timer,
  calendar: Calendar,
  calendarCheck: CalendarCheck,
  calendarClock: CalendarClock,
  calendarDays: CalendarDays,
  venus: Venus,
  mars: Mars,
  thumbsUp: ThumbsUp,
  gauge: Gauge,
  target: Target,
  rocket: Rocket,
  utensils: Utensils,
} as const satisfies Record<string, LucideIcon>;

export type QuizIconKey = keyof typeof QUIZ_ICONS;

const SIZE_CLASSES = {
  xs: "size-5 rounded-lg",
  sm: "size-9 rounded-xl",
  md: "size-12 rounded-2xl",
  lg: "size-16 rounded-2xl",
} as const;

/**
 * A glossy, gradient-lit icon badge — the premium replacement for emoji
 * glyphs. Cyan-to-purple-to-orange rim to match the quiz's neon treatment,
 * with a soft outer glow that intensifies once the card is selected.
 */
export function QuizIconBadge({
  icon,
  size = "md",
  active = false,
  className,
}: {
  icon: QuizIconKey;
  size?: "xs" | "sm" | "md" | "lg";
  active?: boolean;
  className?: string;
}) {
  const Icon = QUIZ_ICONS[icon];

  return (
    <span
      className={clsx(
        "gf-icon-badge relative grid shrink-0 place-items-center",
        SIZE_CLASSES[size],
        active && "gf-icon-badge-active",
        className,
      )}
      aria-hidden
    >
      <Icon
        className={clsx(
          "relative z-10 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)]",
          size === "xs" && "size-3",
          size === "sm" && "size-4",
          size === "md" && "size-6",
          size === "lg" && "size-8",
        )}
        strokeWidth={2.4}
      />
    </span>
  );
}
