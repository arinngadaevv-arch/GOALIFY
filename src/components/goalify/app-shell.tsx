import clsx from "clsx";
import { BottomDock } from "./bottom-dock";
import { TopBar } from "./top-bar";

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
 * No FloatingStreakBadge here — every AppShell screen already renders
 * TopBar, which has its own streak chip. The floating badge is reserved for
 * screens with no TopBar at all (quiz, launchpad, live-player).
 */
export function AppShell({
  children,
  title,
  subtitle,
  showTopBar = true,
  dark = false,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showTopBar?: boolean;
  dark?: boolean;
}) {
  return (
    <div className={clsx(dark && "gf-cyber-scope")}>
      <div className="mx-auto w-full max-w-lg px-5 pt-6 pb-36">
        {showTopBar && <TopBar title={title} subtitle={subtitle} />}
        {children}
      </div>
      <BottomDock />
    </div>
  );
}
