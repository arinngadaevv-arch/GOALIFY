import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/session-provider";

export const metadata: Metadata = {
  title: "TrendSpark AI - מחולל תוכן ויראלי לעסקים קטנים",
  description:
    "צרו רעיונות, תסריטים וקאפשנים ויראליים לטיקטוק ואינסטגרם תוך שניות, מותאמים אישית לעסק שלכם.",
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
