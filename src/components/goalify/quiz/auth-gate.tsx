"use client";

import { useState, type FormEvent } from "react";
import { signIn, useSession } from "next-auth/react";
import { ChevronLeft, Loader2, Lock, ShieldCheck } from "lucide-react";
import clsx from "clsx";
import { GlowButton } from "@/components/goalify/ui/glow-button";

/**
 * The mandatory account gate between the welcome beat and question one.
 * Nothing about the funnel continues past this screen until NextAuth
 * reports an authenticated session — Google or email/password, no guest
 * path. Successful sign-in/-up calls `update()` on the shared session
 * context (from SessionProvider higher up the tree), which is what flips
 * QuizFlow's own `useSession()` read to "authenticated" and unmounts this.
 */
export function AuthGate({ onBack }: { onBack: () => void }) {
  const { update } = useSession();
  const [mode, setMode] = useState<"signup" | "signin">("signup");
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
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-1 py-10">
      <button
        type="button"
        aria-label="Back"
        onClick={onBack}
        className="gf-press absolute top-5 left-0 grid size-9 shrink-0 place-items-center rounded-full bg-black/30 text-white"
      >
        <ChevronLeft className="size-6" strokeWidth={2.5} />
      </button>

      <div className="text-center">
        <span className="gf-glow-electric inline-grid size-12 place-items-center rounded-2xl bg-electric/15 text-electric">
          <Lock className="size-5.5" strokeWidth={2.4} />
        </span>
        <p className="mt-4 text-[11px] font-black tracking-[0.18em] text-electric uppercase">
          Save your progress
        </p>
        <h1 className="gf-display mt-2 text-3xl leading-[1.1] font-black text-ink">
          {mode === "signup" ? "Create your free account" : "Welcome back"}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-mist">
          Your plan is calculated just for you — sign{" "}
          {mode === "signup" ? "up" : "in"} to save it and unlock your
          results.
        </p>
      </div>

      <div className="mt-8 space-y-4">
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading || loading}
          className="gf-glass gf-press flex w-full items-center justify-center gap-2.5 rounded-full px-4 py-3.5 text-sm font-bold text-ink transition-colors disabled:opacity-60"
        >
          {googleLoading ? (
            <Loader2 className="size-4.5 animate-spin" />
          ) : (
            <GoogleIcon className="size-4.5" />
          )}
          Continue with Google
        </button>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-ink/10" />
          <span className="text-[11px] font-bold tracking-[0.1em] text-haze uppercase">
            or
          </span>
          <div className="h-px flex-1 bg-ink/10" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === "signup" && (
            <input
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Full name"
              autoComplete="name"
              className="w-full rounded-2xl border border-ink/12 bg-transparent px-4 py-3.5 text-sm font-semibold text-ink outline-none placeholder:text-haze focus:border-electric"
            />
          )}
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email address"
            autoComplete="email"
            className="w-full rounded-2xl border border-ink/12 bg-transparent px-4 py-3.5 text-sm font-semibold text-ink outline-none placeholder:text-haze focus:border-electric"
          />
          <input
            required
            type="password"
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password (min. 8 characters)"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            className="w-full rounded-2xl border border-ink/12 bg-transparent px-4 py-3.5 text-sm font-semibold text-ink outline-none placeholder:text-haze focus:border-electric"
          />

          {error && (
            <p className="rounded-xl bg-lime-neon/10 px-3.5 py-2.5 text-xs font-semibold text-lime-neon">
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

        <p className="text-center text-xs font-semibold text-mist">
          {mode === "signup" ? (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setError(null);
                }}
                className="font-black text-electric hover:underline"
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
                className="font-black text-electric hover:underline"
              >
                Create an account
              </button>
            </>
          )}
        </p>

        <p
          className={clsx(
            "flex items-center justify-center gap-1.5 pt-2 text-[10px] font-semibold text-haze",
          )}
        >
          <ShieldCheck className="size-3 shrink-0" />
          Your data is encrypted and never sold
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
