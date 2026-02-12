import "./globals.css";
import { XalanifyProvider } from "@/context/XalanifyContext";
import Navigation from "@/components/Navigation";
import Player from "@/components/Player";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body className="bg-black text-white antialiased overflow-hidden">
        <XalanifyProvider>
          {/* Contentor Principal: Altura total do ecrã, sem scroll na janela principal */}
          <div className="h-screen flex flex-col w-full max-w-md mx-auto relative bg-black">
            
            {/* Área de Conteúdo com Scroll Próprio */}
            {/* O pb-40 garante que o último item da lista não fica escondido atrás do player */}
            <main className="flex-1 overflow-y-auto p-4 pb-40 scroll-smooth no-scrollbar">
              {children}
            </main>
            
            {/* Componentes Flutuantes (Fixos em baixo) */}
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