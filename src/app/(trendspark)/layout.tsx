import type { Metadata, Viewport } from "next";
import "../globals.css";
import { SessionProvider } from "@/components/session-provider";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const title = "TrendSpark AI - תפסיקו לנחש מה יעבוד השבוע";
const description =
  "מערכת קבלת החלטות לעסקים קטנים: כל שבוע אנחנו מאבחנים את צוואר הבקבוק שלכם ונותנים מהלך אחד ברור - עם ביטחון כנה ושקיפות מלאה, מאושר בידי אדם לפני שהוא מגיע אליכם.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: "%s · TrendSpark AI",
  },
  description,
  applicationName: "TrendSpark AI",
  keywords: [
    "קבלת החלטות לעסקים קטנים",
    "קוסמטיקאית",
    "אסתטיקאית",
    "AI",
    "בינה מלאכותית",
    "אבחון עסקי",
    "שיווק לעסקים קטנים",
  ],
  authors: [{ name: "TrendSpark AI" }],
  alternates: { canonical: "/trendspark" },
  openGraph: {
    type: "website",
    locale: "he_IL",
    url: siteUrl,
    siteName: "TrendSpark AI",
    title,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a12",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
