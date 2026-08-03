import type { Metadata, Viewport } from "next";
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
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "GOALIFY",
    title,
    description,
  },
  twitter: { card: "summary_large_image", title, description },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0b0e14",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function GoalifyLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" dir="ltr" className="goalify h-full antialiased">
      <body className="goalify-body min-h-full">
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
