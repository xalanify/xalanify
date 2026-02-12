import type { Metadata, Viewport } from "next";
import "./globals.css";
import { XalanifyProvider } from "@/context/XalanifyContext";

export const metadata: Metadata = {
  title: "Xalanify",
  description: "Xalana's Music Experience",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt">
      <head>
        {/* Correção para o aviso do console sobre apple-mobile-web-app-capable */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="bg-black text-white antialiased selection:bg-purple-500/30">
        <XalanifyProvider>
          {children}
        </XalanifyProvider>
      </body>
    </html>
  );
}