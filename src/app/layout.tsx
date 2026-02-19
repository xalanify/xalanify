import type { Metadata } from "next";
import "./globals.css";
import { XalanifyProvider } from "@/context/XalanifyContext";
import Player from "@/components/Player";

export const metadata: Metadata = {
  title: "Xalanify",
  description: "Music Streaming Experience",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt">
      <body className="bg-black text-white overflow-hidden">
        <XalanifyProvider>
          <main className="h-screen flex flex-col">
            <div className="flex flex-1 gap-4 p-4 overflow-hidden">
              {children}
            </div>
            <Player />
          </main>
        </XalanifyProvider>
      </body>
    </html>
  );
}