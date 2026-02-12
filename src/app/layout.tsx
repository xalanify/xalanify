import type { Metadata, Viewport } from "next";
import "./globals.css";
import { XalanifyProvider } from "@/context/XalanifyContext";
import Navigation from "@/components/Navigation"; // IMPORTANTE
import Player from "@/components/Player"; // IMPORTANTE

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
      <body className="bg-black text-white antialiased">
        <XalanifyProvider>
          {/* Adicionamos padding-bottom (pb-32) para o conteúdo não ficar escondido atrás das barras */}
          <main className="min-h-screen pb-32">
            {children}
          </main>
          
          {/* Componentes Fixos Globais */}
          <Player />
          <Navigation />
          
        </XalanifyProvider>
      </body>
    </html>
  );
}