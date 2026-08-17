import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { resolveTrafficSource } from "@/lib/goalify/attribution";

// First-touch attribution — set once, on whichever request is actually the
// visitor's first (never overwritten by later internal navigation), then
// read back at signup time (register route / auth.ts's createUser event)
// so the admin table can show "how did this account find us" per user.
const SOURCE_COOKIE = "gf_src";
const SOURCE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

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

// The marketing landing page and the quiz's own welcome step — both are
// the "come sign up" front door for a brand-new visitor. A signed-in
// account can only ever reach either one by explicitly navigating back
// (or via the Google OAuth round trip's callback URL, which lands here
// too — see auth-panel.tsx / welcome-cta-step.tsx), and since the account
// gate only ever fires *after* a real quiz completion, any signed-in
// session on these routes necessarily already has a finished quiz behind
// it. Sending them through the whole quiz again would be pure friction —
// straight to /home (or /plan to finish paying) is the same place their
// own post-quiz/post-checkout client code would send them anyway, just
// without the detour through quiz UI they don't need to see again.
const SKIP_QUIZ_IF_LOGGED_IN_ROUTES = ["/", "/quiz"];

function matches(pathname: string, routes: string[]) {
  return routes.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const hasActivePlan = Boolean(req.auth?.user?.hasActivePlan);
  const { pathname } = req.nextUrl;

  const requiresLogin = matches(pathname, LOGIN_ONLY_ROUTES);
  const requiresPlan = matches(pathname, REQUIRES_PLAN_ROUTES);
  const skipQuizIfLoggedIn = matches(pathname, SKIP_QUIZ_IF_LOGGED_IN_ROUTES);

  let response: NextResponse;
  if ((requiresLogin || requiresPlan) && !isLoggedIn) {
    response = NextResponse.redirect(new URL("/quiz", req.nextUrl.origin));
  } else if (requiresPlan && !hasActivePlan) {
    response = NextResponse.redirect(new URL("/plan", req.nextUrl.origin));
  } else if (skipQuizIfLoggedIn && isLoggedIn) {
    response = NextResponse.redirect(
      new URL(hasActivePlan ? "/home" : "/plan", req.nextUrl.origin),
    );
  } else {
    response = NextResponse.next();
  }

  if (!req.cookies.get(SOURCE_COOKIE)) {
    const source = resolveTrafficSource(
      req.headers.get("referer"),
      req.nextUrl.searchParams,
    );
    response.cookies.set(SOURCE_COOKIE, source, {
      maxAge: SOURCE_COOKIE_MAX_AGE,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
  }

  return response;
});

export const config = {
  matcher: [
    "/",
    "/quiz",
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
