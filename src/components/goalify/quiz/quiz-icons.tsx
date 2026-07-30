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
import { IconBadge } from "../ui/icon-badge";

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

/** Thin wrapper over the shared IconBadge, resolving a quiz data key to its icon. */
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
  return (
    <IconBadge icon={QUIZ_ICONS[icon]} size={size} active={active} className={className} />
  );
}
