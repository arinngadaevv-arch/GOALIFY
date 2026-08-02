"use client";

import { useEffect, useState, type FormEvent } from "react";
import { signIn, useSession } from "next-auth/react";
import { ChevronLeft, Loader2, Mail, X } from "lucide-react";
import { GlowButton } from "@/components/goalify/ui/glow-button";

/**
 * The welcome screen's CTA opens this instead of navigating straight into
 * the quiz — sign-up happens in place, over a dimmed/blurred backdrop, and
 * only a successful `onAuthenticated()` actually advances into question
 * one. Closing (X, backdrop, Escape) just dismisses it; the welcome screen
 * underneath is untouched so the CTA can be tried again.
 */
export function AuthModal({
  onClose,
  onAuthenticated,
  initialMode = "signup",
  heading = "Create Your Account to Start",
  subheading = "Save your progress and access your tailored plan.",
}: {
  onClose: () => void;
  onAuthenticated: () => void;
  initialMode?: "signup" | "signin";
  heading?: string;
  subheading?: string;
}) {
  const { update } = useSession();
  const [emailMode, setEmailMode] = useState(false);
  const [mode, setMode] = useState<"signup" | "signin">(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    // Locks page scroll behind the modal for the duration it's open.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  async function handleGoogleSignIn() {
    setError(null);
    setGoogleLoading(true);
    await signIn("google", { redirect: false });
    await update();
    setGoogleLoading(false);
    onAuthenticated();
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        if (!res.ok) {
          setError(
            res.status === 409
              ? "An account with that email already exists — try signing in instead."
              : "That didn't work. Check your details and try again.",
          );
          setLoading(false);
          return;
        }
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Incorrect email or password.");
        setLoading(false);
        return;
      }

      await update();
      onAuthenticated();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4">
      {/* Backdrop — dim + blur, click to dismiss. */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-hidden
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-heading"
        className="gf-anim-rise relative w-full max-w-md rounded-t-3xl border border-white/10 bg-[#12151d] p-6 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] shadow-[0_-20px_60px_-20px_rgba(0,0,0,0.8)] sm:rounded-3xl sm:pb-6 sm:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]"
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="gf-press absolute top-4 right-4 grid size-8 place-items-center rounded-full bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
        >
          <X className="size-4.5" strokeWidth={2.5} />
        </button>

        {emailMode && (
          <button
            type="button"
            aria-label="Back"
            onClick={() => {
              setEmailMode(false);
              setError(null);
            }}
            className="gf-press mb-3 grid size-8 place-items-center rounded-full bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
          >
            <ChevronLeft className="size-4.5" strokeWidth={2.5} />
          </button>
        )}

        <h2
          id="auth-modal-heading"
          className="gf-display pr-10 text-2xl leading-tight font-black text-white"
        >
          {emailMode
            ? mode === "signup"
              ? "Create your account"
              : "Welcome back"
            : heading}
        </h2>
        <p className="mt-2 pr-10 text-sm leading-relaxed text-white/65">
          {emailMode
            ? mode === "signup"
              ? "A few details and your plan is saved for good."
              : "Sign in to pick up right where you left off."
            : subheading}
        </p>

        {emailMode ? (
          <>
            <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
              {mode === "signup" && (
                <input
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Full name"
                  autoComplete="name"
                  className="w-full rounded-2xl border border-white/12 bg-white/5 px-4 py-3.5 text-sm font-semibold text-white outline-none placeholder:text-white/40 focus:border-[#FFC700]"
                />
              )}
              <input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email address"
                autoComplete="email"
                className="w-full rounded-2xl border border-white/12 bg-white/5 px-4 py-3.5 text-sm font-semibold text-white outline-none placeholder:text-white/40 focus:border-[#FFC700]"
              />
              <input
                required
                type="password"
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password (min. 8 characters)"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                className="w-full rounded-2xl border border-white/12 bg-white/5 px-4 py-3.5 text-sm font-semibold text-white outline-none placeholder:text-white/40 focus:border-[#FFC700]"
              />

              {error && (
                <p className="rounded-xl bg-red-500/15 px-3.5 py-2.5 text-xs font-semibold text-red-300">
                  {error}
                </p>
              )}

              <GlowButton
                type="submit"
                variant="cyber"
                size="lg"
                fullWidth
                disabled={loading || googleLoading}
              >
                {loading && <Loader2 className="size-4.5 animate-spin" />}
                {mode === "signup" ? "Create account & continue" : "Sign in & continue"}
              </GlowButton>
            </form>

            <p className="mt-4 text-center text-xs font-semibold text-white/60">
              {mode === "signup" ? (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signin");
                      setError(null);
                    }}
                    className="font-black text-[#FFC700] hover:underline"
                  >
                    Sign in
                  </button>
                </>
              ) : (
                <>
                  New here?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signup");
                      setError(null);
                    }}
                    className="font-black text-[#FFC700] hover:underline"
                  >
                    Create an account
                  </button>
                </>
              )}
            </p>
          </>
        ) : (
          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="gf-press flex w-full items-center justify-center gap-2.5 rounded-full bg-white px-4 py-3.5 text-sm font-bold text-black transition-opacity disabled:opacity-60"
            >
              {googleLoading ? (
                <Loader2 className="size-4.5 animate-spin" />
              ) : (
                <GoogleIcon className="size-4.5" />
              )}
              Continue with Google
            </button>

            <button
              type="button"
              onClick={() => setEmailMode(true)}
              disabled={googleLoading}
              className="gf-press flex w-full items-center justify-center gap-2.5 rounded-full border border-white/15 bg-white/5 px-4 py-3.5 text-sm font-bold text-white transition-colors hover:bg-white/10 disabled:opacity-60"
            >
              <Mail className="size-4.5" strokeWidth={2.4} />
              Continue with Email
            </button>
          </div>
        )}

        <p className="mt-5 text-center text-[11px] leading-relaxed text-white/40">
          By continuing you agree to our Terms &amp; Privacy Policy.
        </p>
      </div>
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.87c2.27-2.09 3.58-5.17 3.58-8.82Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.87-3c-1.07.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.11A11.99 11.99 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28V6.61H1.27A11.99 11.99 0 0 0 0 12c0 1.94.46 3.77 1.27 5.39l4-3.11Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.27 6.61l4 3.11C6.22 6.86 8.87 4.75 12 4.75Z"
      />
    </svg>
  );
}
