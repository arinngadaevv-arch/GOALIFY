import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Everything past the GOALIFY quiz's mandatory sign-up gate — the main
// dashboard and every screen a paying member reaches. `/quiz` itself is
// deliberately not listed here: it self-gates client-side (nothing past
// its entry screen renders without a session), and it doubles as the
// landing spot below for anyone bounced off one of these routes.
const GOALIFY_PROTECTED = [
  "/home",
  "/plan",
  "/nutrition",
  "/progress",
  "/settings",
  "/notifications",
  "/workouts",
  "/workout",
  "/success",
];

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/dashboard") && !isLoggedIn) {
    const signInUrl = new URL("/sign-in", req.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  const isGoalifyProtected = GOALIFY_PROTECTED.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
  if (isGoalifyProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL("/quiz", req.nextUrl.origin));
  }
});

export const config = {
  matcher: [
    "/dashboard/:path*",
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
