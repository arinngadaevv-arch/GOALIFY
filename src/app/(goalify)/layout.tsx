import type { Metadata, Viewport } from "next";
import Script from "next/script";
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

// Deliberately absent (not empty-string) in any environment that hasn't
// been given a real dataset ID — local dev and preview deploys included —
// so the pixel never fires against the production ad account by accident.
// meta-pixel.ts's trackMetaEvent is a no-op wherever this script didn't
// render, rather than throwing, so nothing downstream needs to check this
// separately.
const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

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
        {metaPixelId && (
          <>
            {/* afterInteractive (not beforeInteractive): PageView doesn't
                need to beat first paint, and loading it off the critical
                rendering path matters more for a marketing funnel's
                load-time conversion rate than a few ms of event delay. */}
            <Script id="meta-pixel-base" strategy="afterInteractive">
              {`
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${metaPixelId}');
                fbq('track', 'PageView');
              `}
            </Script>
            <noscript>
              {/* A plain <img>, not next/image, is Meta's own spec here —
                  next/image needs client JS to render, which would defeat
                  the entire point of a noscript fallback. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                height="1"
                width="1"
                style={{ display: "none" }}
                src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`}
                alt=""
              />
            </noscript>
          </>
        )}
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
