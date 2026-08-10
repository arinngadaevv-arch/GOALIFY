/**
 * Client-side fire-and-forget ping to /api/analytics/track — same
 * "never blocks, never throws" convention as the paywall-view ping (see
 * paywall.tsx). Failures are silent; a dropped analytics event is never
 * worth surfacing to the visitor.
 */
export function trackVisit(
  kind: "LANDING_VIEW" | "QUIZ_STEP" | "QUIZ_COMPLETE",
  extra?: { stepId?: string; stepIndex?: number },
) {
  fetch("/api/analytics/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      kind,
      path: typeof window !== "undefined" ? window.location.pathname : undefined,
      ...extra,
    }),
  }).catch(() => {});
}
