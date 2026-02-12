import "./globals.css";
import { XalanifyProvider } from "@/context/XalanifyContext";
import Navigation from "@/components/Navigation";
import Player from "@/components/Player";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body className="antialiased">
        <XalanifyProvider>
          {/* CONTENTOR MESTRE: Ocupa exatamente 100% da altura do ecrã */}
          <div className="flex flex-col h-[100dvh] w-full max-w-md mx-auto bg-black relative overflow-hidden">
            
            {/* ÁREA DE CONTEÚDO (SCROLLABLE): Onde as páginas aparecem */}
            {/* O padding-bottom (pb-40) garante que o conteúdo não fica atrás do player */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 pb-40 scroll-smooth no-scrollbar">
              {children}
            </main>
            
            {/* ZONA FLUTUANTE: Player e Menu sempre por cima do conteúdo */}
            <div className="absolute bottom-0 left-0 right-0 z-50">
              <Player />
              <Navigation />
            </div>

          </div>
        </XalanifyProvider>
      </body>
    </html>
  );
}