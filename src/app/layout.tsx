import type { Metadata, Viewport } from "next";
import "./globals.css";
import { XalanifyProvider } from "@/context/XalanifyContext";
import Navigation from "@/components/Navigation";
import Player from "@/components/Player";
import ExpandedPlayer from "@/components/ExpandedPlayer";

export const metadata: Metadata = {
  title: "Xalanify",
  description: "Xalana Music Experience",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Xalanify",
  },
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
        {/* Link para o ícone que enviaste (deve estar em public/XALANIFY.png) */}
        <link rel="apple-touch-icon" href="/XALANIFY.png" />
        <link rel="shortcut icon" href="/XALANIFY.png" />
      </head>
      <body className="bg-black text-white antialiased overflow-hidden font-jakarta">
        <XalanifyProvider>
          <main className="h-screen overflow-y-auto custom-scroll pb-40">
            {children}
          </main>
          <Player />
          <ExpandedPlayer />
          <Navigation />
        </XalanifyProvider>
      </body>
    </html>
  );
}