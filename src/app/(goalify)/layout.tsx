import type { Metadata, Viewport } from "next";
// Self-hosted webfonts, bundled from npm rather than fetched from Google at
// build time — next/font/google needs network access during `next build`,
// and a blocked fetch there fails the whole deploy. These ship the woff2
// files inside node_modules, so the build has no external dependency.
import "@fontsource-variable/sora";
import "@fontsource-variable/inter";
import "../goalify.css";
import { GoalifyProvider } from "@/lib/goalify/store";
import { SessionProvider } from "@/components/session-provider";
import { TermsGate } from "@/components/goalify/terms-gate";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const title = "Home Workouts for Overweight Men — No Gym | GOALIFY";
const description =
  "Overweight, out of shape, and dread the gym? GOALIFY builds a private, bodyweight-only home plan for men — 24 minutes a day, zero equipment, zero judgment.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: "%s · GOALIFY",
  },
  description,
  applicationName: "GOALIFY",
  keywords: [
    "home workout for overweight men",
    "lose weight without a gym",
    "beginner fat loss workout at home",
    "no equipment home workout for men",
    "bodyweight workout for fat loss men",
    "home workout for men who hate the gym",
    "knee friendly workout for overweight men",
    "24 minute home workout",
    "home workout for beginners",
    "home workout no equipment",
    "home workout plan for beginners",
    "bodyweight workout plan",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "GOALIFY",
    title,
    description,
    images: [
      {
        url: "/quiz/image-1786441857395.webp",
        width: 797,
        height: 442,
        alt: "A woman holding a plank at home — GOALIFY's bodyweight home coaching",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/quiz/image-1786441857395.webp"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0b0e14",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// Site-wide entity data — the one JSON-LD graph every page shares, so
// Google can resolve "GOALIFY" as a real Organization/WebSite (brand
// knowledge panel, sitelinks search box eligibility) instead of just a
// bag of unconnected pages. Deliberately does NOT include AggregateRating —
// the "4.9 stars" copy elsewhere in the app is disclosed in-code as
// illustrative placeholder, not real collected reviews, and marking that up
// as structured data would be exactly the kind of review-schema spam
// Google's guidelines explicitly penalize. Swap this in once real reviews
// exist.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "GOALIFY",
      url: siteUrl,
      logo: `${siteUrl}/icon.jpg`,
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      name: "GOALIFY",
      url: siteUrl,
      publisher: { "@id": `${siteUrl}/#organization` },
    },
  ],
};

export default function GoalifyLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" dir="ltr" className="goalify h-full antialiased">
      <body className="goalify-body min-h-full">
        <script
          type="application/ld+json"
          // Static, hand-written content — no user input ever flows into
          // this object, so no escaping/sanitization concerns.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <div className="gf-ambience" aria-hidden />
        <div className="gf-content min-h-dvh">
          <SessionProvider>
            <GoalifyProvider>
              <TermsGate>{children}</TermsGate>
            </GoalifyProvider>
          </SessionProvider>
        </div>
      </body>
    </html>
  );
}
