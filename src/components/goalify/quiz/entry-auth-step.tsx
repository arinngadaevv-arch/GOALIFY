"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { signIn, useSession } from "next-auth/react";
import { ChevronLeft, Loader2, Mail, ShieldCheck } from "lucide-react";
import { Brand } from "@/components/goalify/brand";
import { GlowButton } from "@/components/goalify/ui/glow-button";

/**
 * The mandatory front door of the entire app — nothing past this screen
 * (not question one, not the dashboard) renders until NextAuth reports an
 * authenticated session. Google and email/password are the only two paths
 * in; there is no guest/skip option. Successful sign-in/-up calls
 * `update()` on the shared session context (from SessionProvider higher up
 * the tree), which is what flips the caller's own `useSession()` read to
 * "authenticated" and unmounts this screen.
 */
export function EntryAuthStep() {
  const { update } = useSession();
  const [emailMode, setEmailMode] = useState(false);
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
        className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/80 to-[#0b0e14]"
        aria-hidden
      />

      <div className="relative flex flex-1 flex-col justify-end px-6 pt-16 pb-10">
        <div className="mb-8 flex justify-center">
          <Brand />
        </div>

        <h1 className="gf-display text-center text-4xl leading-[1.08] font-black text-white sm:text-5xl">
          {emailMode
            ? mode === "signup"
              ? "Create your account"
              : "Welcome back"
            : "Start Your Transformation"}
        </h1>
        {!emailMode && (
          <p className="mx-auto mt-3 max-w-sm text-center text-sm leading-relaxed text-white/80">
            Sign up free to build your personalised 30-day home training and
            nutrition plan.
          </p>
        )}

        <div className="mx-auto mt-8 w-full max-w-sm">
          {emailMode ? (
            <>
              <button
                type="button"
                aria-label="Back"
                onClick={() => {
                  setEmailMode(false);
                  setError(null);
                }}
                className="gf-press mb-5 grid size-9 shrink-0 place-items-center rounded-full bg-black/30 text-white"
              >
                <ChevronLeft className="size-5" strokeWidth={2.5} />
              </button>

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

              <p className="mt-4 text-center text-xs font-semibold text-white/70">
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
            <div className="space-y-3">
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
                className="gf-press flex w-full items-center justify-center gap-2.5 rounded-full border-2 border-[#FFC700]/70 bg-black/30 px-4 py-3.5 text-sm font-bold text-[#FFC700] backdrop-blur-md transition-colors disabled:opacity-60"
              >
                <Mail className="size-4.5" strokeWidth={2.4} />
                Continue with Email
              </button>
            </div>
          )}

          <p className="mt-5 text-center text-[11px] leading-relaxed text-white/55">
            By continuing you agree to our Terms &amp; Privacy Policy.
          </p>
          <p className="mt-2 flex items-center justify-center gap-1.5 text-[10px] font-semibold text-white/40">
            <ShieldCheck className="size-3 shrink-0" />
            Your data is encrypted and never sold
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
