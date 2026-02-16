import type { Metadata, Viewport } from "next";
import "./globals.css";
import { XalanifyProvider } from "@/context/XalanifyContext";
import Navigation from "@/components/Navigation";
import Player from "@/components/Player";
import ExpandedPlayer from "@/components/ExpandedPlayer"; // NOVO

export const metadata: Metadata = {
  title: "Xalanify",
  description: "Music App",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="bg-black text-white antialiased overflow-hidden">
        <XalanifyProvider>
          <main className="h-screen overflow-y-auto custom-scroll pb-40">
            {children}
          </main>
          
          {/* Interface de Reprodução */}
          <Player />
          <ExpandedPlayer /> {/* Agora integrado sem conflitos */}
          
          {/* Navegação */}
          <Navigation />
        </XalanifyProvider>
      </body>
    </html>
  );
}