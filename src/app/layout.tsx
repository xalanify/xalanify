import type { Metadata, Viewport } from "next";
import "./globals.css";
import { XalanifyProvider } from "@/context/XalanifyContext";
import Navigation from "@/components/Navigation";
import Player from "@/components/Player";

export const metadata: Metadata = {
  title: "Xalanify",
  description: "Music App Premium",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#000000",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="bg-black text-white antialiased overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <XalanifyProvider>
          <main className="h-screen overflow-y-auto custom-scroll pb-40">
            {children}
          </main>
          <Player />
          <Navigation />
        </XalanifyProvider>
      </body>
    </html>
  );
}