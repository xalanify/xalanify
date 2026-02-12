import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Xalanify",
  description: "Xalana's Music Experience",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt">
      <head>
        {/* Nova tag recomendada pelo Chrome/iOS */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#000000" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body className="bg-black text-white antialiased selection:bg-purple-500/30">
        {children}
      </body>
    </html>
  );
}