"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { signIn, useSession } from "next-auth/react";
import { ChevronLeft, Loader2, Lock, ShieldCheck } from "lucide-react";
import { Brand } from "@/components/goalify/brand";
import { GlowButton } from "@/components/goalify/ui/glow-button";

/**
 * Google/email sign-up-or-in, reused in two spots with two different
 * post-auth destinations: the welcome screen's quiet "Log in" link (for a
 * returning member skipping straight to their dashboard) and the mandatory
 * gate right before a freshly-completed quiz hands off to the paywall.
 * `onAuthenticated` fires once NextAuth's session has actually updated —
 * the caller decides where to go from there.
 */
export function AuthPanel({
  initialMode = "signup",
  heading,
  subheading,
  onAuthenticated,
  onBack,
}: {
  initialMode?: "signup" | "signin";
  heading?: string;
  subheading?: string;
  onAuthenticated: () => void;
  onBack: () => void;
}) {
  const { update } = useSession();
  const [mode, setMode] = useState<"signup" | "signin">(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogleSignIn() {
    setError(null);
    setGoogleLoading(true);
    // No callbackUrl — this app reads auth state from useSession() in
    // place, so a full-page redirect round trip isn't needed here.
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
    <div className="relative -mx-5 flex min-h-dvh flex-col overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="/quiz/goal-athletic.png"
          alt=""
          fill
          priority
          className="object-cover object-top"
        />
      </div>
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/85 to-[#0b0e14]"
        aria-hidden
      />

      <button
        type="button"
        aria-label="Back"
        onClick={onBack}
        className="gf-press relative z-10 mt-5 ml-5 grid size-9 shrink-0 place-items-center rounded-full bg-black/30 text-white"
      >
        <ChevronLeft className="size-6" strokeWidth={2.5} />
      </button>

      <div className="relative mt-auto flex flex-col px-6 pt-10 pb-10">
        <div className="mb-6 flex justify-center">
          <Brand />
        </div>

        <h1 className="gf-display text-center text-3xl leading-[1.1] font-black text-white">
          {heading ?? (mode === "signup" ? "Create your account" : "Welcome back")}
        </h1>
        {subheading && (
          <p className="mx-auto mt-2 max-w-sm text-center text-sm leading-relaxed text-white/80">
            {subheading}
          </p>
        )}

        <div className="mx-auto mt-7 w-full max-w-sm space-y-3">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className="gf-press flex w-full items-center justify-center gap-2.5 rounded-full bg-white px-4 py-3.5 text-sm font-bold text-black transition-opacity disabled:opacity-60"
          >
            {googleLoading ? (
              <Loader2 className="size-4.5 animate-spin" />
            ) : (
              <GoogleIcon className="size-4.5" />
            )}
            Continue with Google
          </button>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-white/15" />
            <span className="text-[11px] font-bold tracking-[0.1em] text-white/50 uppercase">
              or
            </span>
            <div className="h-px flex-1 bg-white/15" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === "signup" && (
              <input
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Full name"
                autoComplete="name"
                className="w-full rounded-2xl border border-white/15 bg-black/30 px-4 py-3.5 text-sm font-semibold text-white outline-none backdrop-blur-md placeholder:text-white/50 focus:border-[#FFC700]"
              />
            )}
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email address"
              autoComplete="email"
              className="w-full rounded-2xl border border-white/15 bg-black/30 px-4 py-3.5 text-sm font-semibold text-white outline-none backdrop-blur-md placeholder:text-white/50 focus:border-[#FFC700]"
            />
            <input
              required
              type="password"
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password (min. 8 characters)"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              className="w-full rounded-2xl border border-white/15 bg-black/30 px-4 py-3.5 text-sm font-semibold text-white outline-none backdrop-blur-md placeholder:text-white/50 focus:border-[#FFC700]"
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
              className="mt-1"
            >
              {loading && <Loader2 className="size-4.5 animate-spin" />}
              {mode === "signup" ? "Create account & continue" : "Sign in & continue"}
            </GlowButton>
          </form>

          <p className="text-center text-xs font-semibold text-white/70">
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

          <p className="flex items-center justify-center gap-1.5 pt-1 text-[10px] font-semibold text-white/50">
            <ShieldCheck className="size-3 shrink-0" />
            Your data is encrypted and never sold
          </p>
          <p className="flex items-center justify-center gap-1.5 text-[10px] font-semibold text-white/40">
            <Lock className="size-3 shrink-0" />
            By continuing you agree to our Terms &amp; Privacy Policy
          </p>
        </div>
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
