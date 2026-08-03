/**
 * NextAuth's own error codes for a failed Google round trip (see
 * `pages.error` in auth.ts) — mapped to copy a user can actually act on.
 * Anything unlisted falls back to a generic retry message. Shared between
 * QuizFlow (parses the code off the `?error=` redirect) and AuthModal
 * (reacts to the specific "account exists, confirm password to link"
 * case with a dedicated form instead of just this text).
 */
export const GOOGLE_ERROR_MESSAGES: Record<string, string> = {
  AccessDenied: "Google sign-in was cancelled.",
  OAuthAccountNotLinked:
    "That email already has a password-based account — confirm your password below to link Google to it.",
  Configuration: "Google sign-in isn't available right now — try email instead.",
};

export function friendlyAuthError(code: string): string {
  return GOOGLE_ERROR_MESSAGES[code] ?? "Google sign-in failed. Please try again.";
}
