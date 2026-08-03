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

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
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
    async jwt({ token, user }) {
      if (user?.id) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
