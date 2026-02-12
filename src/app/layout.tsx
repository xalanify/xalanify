import "./globals.css";
import { XalanifyProvider } from "@/context/XalanifyContext";
import Navigation from "@/components/Navigation";
import Player from "@/components/Player";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body className="antialiased">
        <XalanifyProvider>
          {/* Centraliza o conteúdo e evita que as capas fiquem gigantes no PC */}
          <div className="max-w-md mx-auto min-h-screen flex flex-col relative">
            <main className="flex-1 p-5 pb-40">
              {children}
            </main>
            
            {/* Componentes sempre visíveis no sítio certo */}
            <Player />
            <Navigation />
          </div>
        </XalanifyProvider>
      </body>
    </html>
  );
}