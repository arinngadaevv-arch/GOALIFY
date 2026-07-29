import type { Metadata, Viewport } from "next";
import "../goalify.css";
import { GoalifyProvider } from "@/lib/goalify/store";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const title = "GOALIFY — Your body, engineered";
const description =
  "A personalised training and nutrition system built around your goals, your fitness level and your joints. 3D AI form coaching on every rep.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: "%s · GOALIFY",
  },
  description,
  applicationName: "GOALIFY",
  keywords: [
    "fitness app",
    "personalised workout plan",
    "home workouts",
    "knee safe training",
    "nutrition targets",
    "AI form coach",
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
  themeColor: "#FFFFFF",
  colorScheme: "light",
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
          <GoalifyProvider>{children}</GoalifyProvider>
        </div>
      </body>
    </html>
  );
}
