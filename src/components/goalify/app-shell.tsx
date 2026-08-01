import clsx from "clsx";
import { BottomDock } from "./bottom-dock";
import { TopBar } from "./top-bar";
import { FloatingStreakBadge } from "./ui/floating-streak-badge";

/**
 * Frame for the four core app screens: top bar, scrollable content that
 * clears the floating dock, and the dock itself.
 *
 * `dark` opts a screen into the obsidian/gold cyber scope. It wraps the
 * whole fragment (not just the scrollable content) so the fixed BottomDock
 * — a layout sibling, not a DOM descendant of the content div — still
 * inherits the scope's CSS custom properties; `position: fixed` only
 * escapes the containing block for layout, not variable inheritance.
 *
 * `hideStreakBadge` opts a screen out of the permanent floating streak
 * counter — Dashboard already has its own prominent streak badge plus
 * TopBar's inline chip, so a third indicator there would be redundant.
 */
export function AppShell({
  children,
  title,
  subtitle,
  showTopBar = true,
  dark = false,
  hideStreakBadge = false,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showTopBar?: boolean;
  dark?: boolean;
  hideStreakBadge?: boolean;
}) {
  return (
    <div className={clsx(dark && "gf-cyber-scope")}>
      <div className="mx-auto w-full max-w-lg px-5 pt-6 pb-36">
        {showTopBar && <TopBar title={title} subtitle={subtitle} />}
        {children}
      </div>
      {!hideStreakBadge && <FloatingStreakBadge />}
      <BottomDock />
    </div>
  );
}
