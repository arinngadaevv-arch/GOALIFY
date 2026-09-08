import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isAdmin: boolean;
      hasAcceptedTerms: boolean;
      /** True once `users.plan` is anything other than "FREE" — the only
       * real "has paid" signal, set exclusively by the Lemon Squeezy
       * order_created webhook after payment is confirmed. */
      hasActivePlan: boolean;
      /** True once `users.quizCompletedAt` is set (see
       * api/user/quiz/route.ts) — an account exists from the moment the
       * quiz's very first step's sign-up panel is used, long before the
       * quiz itself is actually finished, so this is the only reliable way
       * to tell "signed up" apart from "actually finished the quiz". */
      hasCompletedQuiz: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    isAdmin?: boolean;
    hasAcceptedTerms?: boolean;
    hasActivePlan?: boolean;
    hasCompletedQuiz?: boolean;
    /** Epoch ms of the last throttled `lastActiveAt` DB write (see auth.ts). */
    lastActiveTouch?: number;
  }
}
