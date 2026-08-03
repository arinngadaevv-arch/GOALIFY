import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Routes that only require being signed in — deliberately NOT gated on
// `hasActivePlan`, since a signed-in-but-unpaid user must still be able to
// reach the paywall itself (/plan) to pay, land on Lemon Squeezy's redirect
// target (/success) right after checkout — before the order_created webhook
// has necessarily landed — and manage their account (/settings) either way.
const LOGIN_ONLY_ROUTES = ["/plan", "/success", "/settings"];

// The real app — every screen that should only ever be reachable by an
// account whose `users.plan` is something other than "FREE" (see
// `hasActivePlan` on the session, derived in auth.ts from the one place
// that's actually true: the Lemon Squeezy order_created webhook). This is
// the authoritative, server-side half of the payment gate — it holds even
// if a client-side routing bug ever again tries to send someone here early.
const REQUIRES_PLAN_ROUTES = [
  "/home",
  "/nutrition",
  "/progress",
  "/notifications",
  "/workouts",
  "/workout",
];

function matches(pathname: string, routes: string[]) {
  return routes.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const hasActivePlan = Boolean(req.auth?.user?.hasActivePlan);
  const { pathname } = req.nextUrl;

  const requiresLogin = matches(pathname, LOGIN_ONLY_ROUTES);
  const requiresPlan = matches(pathname, REQUIRES_PLAN_ROUTES);

  if ((requiresLogin || requiresPlan) && !isLoggedIn) {
    return NextResponse.redirect(new URL("/quiz", req.nextUrl.origin));
  }
  if (requiresPlan && !hasActivePlan) {
    return NextResponse.redirect(new URL("/plan", req.nextUrl.origin));
  }
});

export const config = {
  matcher: [
    "/home",
    "/plan",
    "/nutrition",
    "/nutrition/:path*",
    "/progress",
    "/settings",
    "/notifications",
    "/workouts",
    "/workouts/:path*",
    "/workout",
    "/workout/:path*",
    "/success",
  ],
};
