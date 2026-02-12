"use client";
import Search from "@/components/Search";
import { useXalanify } from "@/context/XalanifyContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

export default function Home() {
  const { user } = useXalanify();
  const router = useRouter();
  const [showUpdate, setShowUpdate] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else {
      // Mostrar Pop-up de atualização 0.13.0
      const lastSeen = localStorage.getItem("xalanify_v");
      if (lastSeen !== "0.13.0") {
        setShowUpdate(true);
      }
    }
  }, [user, router]);

  const closeUpdate = () => {
    localStorage.setItem("xalanify_v", "0.13.0");
    setShowUpdate(false);
  };

  if (!user) return null;

  return (
    <div className="space-y-8 relative">
      <header className="flex justify-between items-center pt-2">
        <div className="bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full tracking-[0.2em] uppercase shadow-lg shadow-red-600/20">
          Beta
        </div>
      </header>

      <section>
        <h3 className="text-2xl font-black mb-6 tracking-tight">Explorar Música</h3>
        <Search />
      </section>

      {/* Pop-up de Atualização */}
      {showUpdate && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-[#1c1c1e] border border-white/10 rounded-[2.5rem] p-8 w-full max-w-xs shadow-2xl relative">
            <div className="bg-blue-500 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
              <Zap className="text-white" size={24} />
            </div>
            <h2 className="text-xl font-black mb-2">Update 0.13.0</h2>
            <p className="text-zinc-400 text-xs leading-relaxed mb-6">
              Músicas a tocar agora! Corrigimos o motor de áudio, limpámos o visual e adicionámos os logs de sistema.
            </p>
            <button 
              onClick={closeUpdate}
              className="w-full py-4 bg-white text-black font-black rounded-2xl active:scale-95 transition-all text-sm"
            >
              OK, VAMOS LÁ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper para o ícone do pop-up
function Zap({ size, className, color }: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>;
}