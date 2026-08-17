import { Apple, House, TrendingUp, type LucideIcon } from "lucide-react";

/** Shared between BottomDock (mobile) and Sidebar (desktop) so the two
 * never drift out of sync. Settings uses the literal ⚙️ emoji glyph
 * instead of a Lucide icon, on request — the other tabs stay vector
 * icons, hence `Icon: null` there. */
export const NAV_ITEMS: readonly {
  href: string;
  label: string;
  Icon: LucideIcon | null;
}[] = [
  { href: "/home", label: "Home", Icon: House },
  { href: "/nutrition", label: "Nutrition", Icon: Apple },
  { href: "/progress", label: "Progress", Icon: TrendingUp },
  { href: "/settings", label: "Settings", Icon: null },
];
