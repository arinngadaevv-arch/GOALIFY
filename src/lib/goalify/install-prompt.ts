/**
 * Set at the exact moment a brand-new account is created (both the
 * credentials signup form and the Google new-signup branch call this —
 * see auth-panel.tsx and quiz-flow.tsx), read once by InstallAppPrompt
 * on its next mount to decide whether to surface the "install as app"
 * banner. Not a general "show the banner" toggle — the component itself
 * still checks it isn't already running standalone before honoring it.
 */
const INSTALL_PROMPT_PENDING_KEY = "gf_install_prompt_pending";

export function markInstallPromptPending() {
  try {
    window.localStorage.setItem(INSTALL_PROMPT_PENDING_KEY, "1");
  } catch {
    // Private browsing / storage disabled — the banner just never shows.
  }
}

export function consumeInstallPromptPending(): boolean {
  try {
    const pending =
      window.localStorage.getItem(INSTALL_PROMPT_PENDING_KEY) === "1";
    window.localStorage.removeItem(INSTALL_PROMPT_PENDING_KEY);
    return pending;
  } catch {
    return false;
  }
}
