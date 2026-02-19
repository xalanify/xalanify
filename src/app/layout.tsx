import "./globals.css";
import { XalanifyProvider } from "@/context/XalanifyContext";
import Player from "@/components/Player";
import Navigation from "@/components/Navigation";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body className="bg-black text-white overflow-hidden">
        <XalanifyProvider>
          <div className="h-screen flex flex-col">
            <main className="flex-1 overflow-y-auto custom-scroll pb-32 p-4">
              {children}
            </main>
            <div className="fixed bottom-0 left-0 right-0 z-50">
              <Player />
              <Navigation />
            </div>
          </div>
        </XalanifyProvider>
      </body>
    </html>
  );
}