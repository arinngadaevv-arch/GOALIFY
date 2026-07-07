import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Store Manager",
  description: "The AI employee that runs your Shopify store's growth 24/7.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        {children}
      </body>
    </html>
  );
}
