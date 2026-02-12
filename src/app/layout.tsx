import type { Metadata } from "next";
// Substitui o corpo do layout anterior por este
import { XalanifyProvider } from "@/context/XalanifyContext";
import Player from "@/components/Player";
import { Inter } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Xalanify",
  description: "Minimalist Music Experience",
  manifest: "/manifest.json",
  themeColor: "#0a0908",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body className={`${inter.className} bg-background text-white min-h-screen pb-24`}>
        <XalanifyProvider>
          <div className="fixed top-0 left-1/2 -translate-x-1/2 bg-accent text-white text-[10px] font-bold px-3 py-1 rounded-b-md z-50 shadow-lg">
            BETA
          </div>
          
          <main className="p-4 pt-10">{children}</main>

          <Player />
          <BottomNav />
        </XalanifyProvider>
      </body>
    </html>
  );

}