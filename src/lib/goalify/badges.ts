import { Crown, Flame, Gem, Medal, Star, Trophy, type LucideIcon } from "lucide-react";

/**
 * Shared with live-player.tsx's CompletionScreen (which detects a badge
 * newly crossed by the session that just finished) and progress.tsx's
 * trophy shelf (which shows all of them, earned or not) — one list so a
 * badge's name/icon/threshold can't drift between the two places it shows.
 */
export const BADGES: {
  id: string;
  name: string;
  icon: LucideIcon;
  requirement: number;
}[] = [
  { id: "first", name: "First Rep", icon: Medal, requirement: 1 },
  { id: "three", name: "Hat-Trick", icon: Flame, requirement: 3 },
  { id: "week", name: "Week One", icon: Star, requirement: 7 },
  { id: "fortnight", name: "Fortnight", icon: Gem, requirement: 14 },
  { id: "month", name: "Month Strong", icon: Trophy, requirement: 30 },
  { id: "legend", name: "Legend", icon: Crown, requirement: 60 },
];
