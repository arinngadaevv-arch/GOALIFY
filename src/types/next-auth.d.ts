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
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    isAdmin?: boolean;
    hasAcceptedTerms?: boolean;
    hasActivePlan?: boolean;
    /** Epoch ms of the last throttled `lastActiveAt` DB write (see auth.ts). */
    lastActiveTouch?: number;
  }
}
