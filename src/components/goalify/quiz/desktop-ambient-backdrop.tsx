/**
 * Every funnel screen except the welcome hero keeps its content in a
 * narrow, centered column on purpose — a single question, option grid, or
 * form reads better as one focused column than stretched full-bleed. But
 * on a real desktop monitor that column sits in a plain, unstyled black
 * void on both sides, which reads as unfinished rather than intentional.
 *
 * Dropped as a sibling immediately before that column's own `<main>`,
 * this fills just the empty space with the same ambient glow
 * `.gf-cyber-scope`'s own `::before` already paints (see goalify.css) —
 * but `fixed` to the viewport instead of scoped to the narrow box, so it
 * sits behind the column's own opaque background rather than under it.
 * `lg:block` only — on narrower viewports the column already fills the
 * screen, so there's no void for this to fill.
 */
export function DesktopAmbientBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 hidden lg:block"
      style={{
        background:
          "radial-gradient(ellipse 60% 40% at 15% 10%, rgba(232,179,44,0.12), transparent 60%), radial-gradient(ellipse 55% 40% at 88% 85%, rgba(255,59,59,0.09), transparent 60%), #0b0e14",
      }}
    />
  );
}
