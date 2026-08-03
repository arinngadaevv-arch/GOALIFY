import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isAdmin: boolean;
      hasAcceptedTerms: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    isAdmin?: boolean;
    hasAcceptedTerms?: boolean;
    /** Epoch ms of the last throttled `lastActiveAt` DB write (see auth.ts). */
    lastActiveTouch?: number;
  }
}
