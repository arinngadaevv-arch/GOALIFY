import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, accounts, sessions, verificationTokens } from "@/lib/db/schema";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

const providers: Provider[] = [
  Credentials({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials, request) {
      const email = credentials?.email as string | undefined;
      const password = credentials?.password as string | undefined;
      if (!email || !password) return null;

      // Throttle login attempts per IP to blunt credential-stuffing/brute force.
      const ip = request ? getClientIp(request as Request) : "unknown";
      const rl = await rateLimit("login", ip);
      if (!rl.success) return null;

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email.toLowerCase()))
        .limit(1);

      if (!user?.passwordHash) return null;

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) return null;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      };
    },
  }),
];

// Vercel deployments have historically been set up under a few different
// naming conventions for the same two secrets — our own docs/.env.example
// say GOOGLE_CLIENT_ID/SECRET, Auth.js v5's own auto-detection convention is
// AUTH_GOOGLE_ID/SECRET, and some setups just use GOOGLE_ID/SECRET. Checking
// all three means a real, correctly-set credential is never silently
// ignored just because it landed under a name this file didn't expect.
const GOOGLE_ID_ENV_KEYS = ["GOOGLE_CLIENT_ID", "AUTH_GOOGLE_ID", "GOOGLE_ID"] as const;
const GOOGLE_SECRET_ENV_KEYS = [
  "GOOGLE_CLIENT_SECRET",
  "AUTH_GOOGLE_SECRET",
  "GOOGLE_SECRET",
] as const;

function firstEnv(
  keys: readonly string[]
): { key: string; value: string; hadWhitespace: boolean } | null {
  for (const key of keys) {
    const raw = process.env[key];
    if (!raw) continue;
    // A pasted secret with a trailing newline/space (very easy to pick up
    // copying out of a terminal or a .env file) is byte-for-byte different
    // from the real one to Google's token endpoint, and surfaces there as
    // exactly "invalid_client: the provided client secret is invalid" —
    // indistinguishable from a genuinely wrong secret unless this is
    // stripped and flagged.
    const value = raw.trim();
    if (!value) continue;
    return { key, value, hadWhitespace: value !== raw };
  }
  return null;
}

const googleId = firstEnv(GOOGLE_ID_ENV_KEYS);
const googleSecret = firstEnv(GOOGLE_SECRET_ENV_KEYS);

// Explicit, unconditional truthy check for every candidate name, printed on
// every boot regardless of which branch below ends up firing — grep Vercel's
// Function Logs for "[auth] Google env check" to see exactly what this
// deployment's process.env actually contains, without exposing any secret
// values.
console.log(
  "[auth] Google env check —",
  Object.fromEntries(
    [...GOOGLE_ID_ENV_KEYS, ...GOOGLE_SECRET_ENV_KEYS].map((key) => [
      key,
      Boolean(process.env[key]),
    ])
  )
);

if (googleId && googleSecret) {
  providers.push(
    Google({
      clientId: googleId.value,
      clientSecret: googleSecret.value,
    })
  );
  // Lengths only, never the values — but enough to catch the classic
  // "invalid_client: provided client secret is invalid" cause of a
  // trailing newline or space that snuck in when the secret was pasted
  // into Vercel, which trimming above silently fixes unless flagged here.
  console.log(
    `[auth] Google OAuth enabled — using ${googleId.key} (${googleId.value.length} chars) / ${googleSecret.key} (${googleSecret.value.length} chars).` +
      (googleId.hadWhitespace || googleSecret.hadWhitespace
        ? ` Stripped surrounding whitespace from ${[
            googleId.hadWhitespace && googleId.key,
            googleSecret.hadWhitespace && googleSecret.key,
          ]
            .filter(Boolean)
            .join(" and ")} — if Google still rejects this as invalid_client, re-copy the value directly from Google Cloud Console into Vercel rather than relying on this trim.`
        : "")
  );

  // Every real Google OAuth client ID ends in this suffix; a value that
  // doesn't is either the wrong credential entirely or has the ID/secret
  // fields swapped — both produce exactly "invalid_client" at Google's
  // token endpoint with no more specific signal than that, so this is
  // checked and named explicitly rather than left for the user to guess.
  const GOOGLE_CLIENT_ID_SUFFIX = ".apps.googleusercontent.com";
  if (!googleId.value.endsWith(GOOGLE_CLIENT_ID_SUFFIX)) {
    console.error(
      `[auth] ${googleId.key} doesn't end in "${GOOGLE_CLIENT_ID_SUFFIX}", which every real Google OAuth client ID does. Check that ${googleId.key} in Vercel actually holds the Client ID (from Google Cloud Console → APIs & Services → Credentials) and not the Client Secret or a stale/truncated value.`
    );
  }
  if (googleSecret.value.endsWith(GOOGLE_CLIENT_ID_SUFFIX)) {
    console.error(
      `[auth] ${googleSecret.key} ends in "${GOOGLE_CLIENT_ID_SUFFIX}", which means it holds a Client ID, not a Client Secret. ${googleSecret.key} and ${googleId.key} are almost certainly swapped in Vercel.`
    );
  }
} else if (googleId || googleSecret) {
  // Exactly one of the two is set — almost always a typo'd env var name on
  // the host rather than an intentional "Google is off" state, so this is
  // loud (error, not warn) and never silently disables in a way that's hard
  // to notice from the Vercel dashboard's function logs.
  console.error(
    `[auth] Google OAuth misconfigured: found ${
      googleId ? `a client ID (${googleId.key})` : "no client ID"
    } but ${
      googleSecret ? `a client secret (${googleSecret.key})` : "no client secret"
    }. Both are required — checked ${GOOGLE_ID_ENV_KEYS.join(", ")} for the ID and ${GOOGLE_SECRET_ENV_KEYS.join(", ")} for the secret. "Continue with Google" will be unavailable until both are set to matching values in Vercel.`
  );
} else {
  console.warn(
    `[auth] Google OAuth not configured — checked ${GOOGLE_ID_ENV_KEYS.join(", ")} for a client ID and ${GOOGLE_SECRET_ENV_KEYS.join(", ")} for a client secret, found neither. Running with the credentials (email/password) provider only.`
  );
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  // Trust the deployment host. Auto-enabled on Vercel via the VERCEL env var,
  // but set explicitly so login also works on any other host (Docker, other clouds).
  trustHost: true,
  session: { strategy: "jwt" },
  // GOALIFY is the only app this instance serves now, so both pages point
  // at its own front door. This matters specifically for Google: OAuth is
  // a real cross-site round trip (the browser leaves for accounts.google.com
  // and comes back), and on any failure there — denied consent, callback
  // error, a misconfigured provider — Auth.js hard-redirects here with an
  // `?error=` code and no memory of which screen started the attempt.
  // Landing on `/quiz` means that's always a real, correctly-branded page,
  // never a broken or generic one; QuizFlow reads the `error` param on
  // mount and surfaces it inline in the auth modal.
  pages: {
    signIn: "/quiz",
    error: "/quiz",
  },
  providers,
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user?.id) token.id = user.id;
      if (!token.id) return token;

      // Two independent reasons to touch the DB, each throttled on its own:
      // a fresh profile fetch (new sign-in, or an explicit `update()` call
      // after e.g. accepting the terms waiver) and a "last seen" touch for
      // the admin dashboard's active-user count, capped to once per window
      // so routine page loads don't hammer the DB.
      const needsProfileRefresh = trigger === "update" || token.isAdmin === undefined;
      const lastTouch =
        typeof token.lastActiveTouch === "number" ? token.lastActiveTouch : 0;
      const activityStale = Date.now() - lastTouch > 15 * 60 * 1000;

      if (activityStale) {
        const now = new Date();
        await db
          .update(users)
          .set({ lastActiveAt: now })
          .where(eq(users.id, token.id as string));
        token.lastActiveTouch = now.getTime();
      }

      if (needsProfileRefresh) {
        const [dbUser] = await db
          .select({ isAdmin: users.isAdmin, hasAcceptedTerms: users.hasAcceptedTerms })
          .from(users)
          .where(eq(users.id, token.id as string))
          .limit(1);
        if (dbUser) {
          token.isAdmin = dbUser.isAdmin;
          token.hasAcceptedTerms = dbUser.hasAcceptedTerms;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.isAdmin = Boolean(token.isAdmin);
        session.user.hasAcceptedTerms = Boolean(token.hasAcceptedTerms);
      }
      return session;
    },
  },
});
