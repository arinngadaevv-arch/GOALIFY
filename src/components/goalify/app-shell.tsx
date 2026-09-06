"use client";

import clsx from "clsx";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useRevealOnScroll } from "@/lib/goalify/use-reveal";
import { BottomDock } from "./bottom-dock";
import { SidebarNav } from "./sidebar-nav";
import { TopBar } from "./top-bar";

/**
 * Frame for the four core app screens: top bar, scrollable content that
 * clears the floating dock, and the dock itself.
 *
 * `dark` opts a screen into the elite scope — the post-login app's deep
 * charcoal, single-gold-accent skin (independent from the pre-purchase
 * funnel's gold/crimson `.gf-cyber-scope`, see goalify.css). It wraps the
 * whole fragment (not just the scrollable content) so the fixed BottomDock
 * — a layout sibling, not a DOM descendant of the content div — still
 * inherits the scope's CSS custom properties; `position: fixed` only
 * escapes the containing block for layout, not variable inheritance.
 *
 * No FloatingStreakBadge here — every AppShell screen already renders
 * TopBar, which has its own streak chip. The floating badge is reserved for
 * screens with no TopBar at all (quiz, launchpad, live-player).
 *
 * At `lg+`, BottomDock gives way to SidebarNav (a persistent left rail)
 * and the content column widens from a phone-width card to something that
 * actually uses a desktop viewport — each screen decides for itself how to
 * spread its own content across that width (see dashboard.tsx etc.'s
 * `lg:grid lg:grid-cols-2` sections — an explicit two-column grouping, not
 * CSS multicol, which balances by raw total height and reliably left one
 * column visibly shorter than the other).
 *
 * The content (header + body) is keyed by pathname inside AnimatePresence
 * so switching tabs (Home/Coach/Nutrition/Progress/Settings) fades and
 * lifts rather than hard-cutting — BottomDock/SidebarNav sit outside this,
 * as layout chrome that shouldn't itself re-animate on every navigation.
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
  const pathname = usePathname();
  // Keyed by pathname so the observer re-binds after a tab change swaps
  // the whole subtree out — otherwise the new screen's cards would stay
  // stuck at their hidden starting state.
  const revealRef = useRevealOnScroll<HTMLDivElement>(pathname);

  return (
    <div className={clsx(dark && "gf-elite-scope")}>
      <div className="lg:flex">
        <SidebarNav />
        <div className="mx-auto w-full max-w-lg px-5 pt-6 pb-36 lg:max-w-5xl lg:px-12 lg:pt-10 lg:pb-16 xl:max-w-6xl 2xl:max-w-7xl">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={pathname}
              ref={revealRef}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              {showTopBar && <TopBar title={title} subtitle={subtitle} />}
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <BottomDock />
    </div>
  );
}
