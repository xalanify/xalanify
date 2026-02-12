import "./globals.css";
import { XalanifyProvider } from "@/context/XalanifyContext";
import Navigation from "@/components/Navigation";
import Player from "@/components/Player";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body className="bg-black text-white antialiased overflow-hidden">
        <XalanifyProvider>
          {/* Contentor principal que trava o ecrã no tamanho do telemóvel */}
          <div className="flex flex-col h-[100dvh] w-full max-w-md mx-auto relative overflow-hidden bg-black">
            
            {/* Onde o conteúdo rola (Início, Search, Library) */}
            <main className="flex-1 overflow-y-auto p-4 pb-48 no-scrollbar">
              {children}
            </main>
            
            {/* PLAYER E NAV: Fixos no fundo absoluto do contentor */}
            <div className="absolute bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black via-black/95 to-transparent">
              <Player />
              <Navigation />
            </div>

          </div>
        </XalanifyProvider>
      </body>
    </html>
  );
}