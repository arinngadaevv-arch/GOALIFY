"use client";

import { useEffect, useRef } from "react";

/**
 * Reveal-on-scroll for a whole subtree: every element carrying `.gf-reveal`
 * inside the returned ref gets `.gf-reveal-in` added the first time it
 * scrolls into view, with a small stagger between siblings that appear
 * together.
 *
 * One shared IntersectionObserver over the container rather than a hook per
 * card — the dashboard has a dozen-plus animated blocks, and an observer
 * each would be wasteful. Unobserves on reveal so nothing re-animates when
 * scrolling back up (a card that re-fades every pass reads as a glitch).
 *
 * Elements already in view on first paint still animate: they're revealed
 * on the observer's initial callback, which fires immediately.
 */
export function useRevealOnScroll<T extends HTMLElement>(
  /** Re-bind when this changes — pass the route so a tab switch, which
   * swaps the entire subtree for fresh nodes, re-observes the new cards
   * instead of leaving them stuck at their hidden starting state. */
  resetKey?: string,
) {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const targets = root.querySelectorAll<HTMLElement>(".gf-reveal");
    if (targets.length === 0) return;

    // Honour the OS setting directly — the CSS already no-ops the
    // transition, but skipping the observer entirely avoids leaving
    // anything stuck at opacity 0 if the stylesheet ever changes.
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      targets.forEach((el) => el.classList.add("gf-reveal-in"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        let batch = 0;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          // Stagger only within a single callback, so a group entering
          // together cascades but a lone card mid-scroll appears at once.
          el.style.transitionDelay = `${batch * 70}ms`;
          batch += 1;
          el.classList.add("gf-reveal-in");
          observer.unobserve(el);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.06 },
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [resetKey]);

  return containerRef;
}
