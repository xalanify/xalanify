"use client";
import Search from "@/components/Search";
import { useXalanify } from "@/context/XalanifyContext";
import { useState, useEffect } from "react";
import { Zap } from "lucide-react";

export default function Home() {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem("v0.13.0_seen");
    if (!hasSeen) setShowPopup(true);
  }, []);

  const closePopup = () => {
    localStorage.setItem("v0.13.0_seen", "true");
    setShowPopup(false);
  };

  return (
    <div className="space-y-8 relative">
      <header className="pt-2">
        <span className="bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full tracking-widest uppercase shadow-lg shadow-red-600/20">
          Beta
        </span>
      </header>

      <section>
        <h3 className="text-2xl font-black mb-6 tracking-tight">Explorar Música</h3>
        <Search />
      </section>

      {showPopup && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-6">
          <div className="bg-zinc-900 border border-white/10 rounded-[2.5rem] p-8 w-full max-w-xs text-center shadow-2xl">
            <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/30">
              <Zap size={32} className="text-white" fill="white" />
            </div>
            <h2 className="text-xl font-black mb-2 text-white">Versão 0.13.0</h2>
            <p className="text-zinc-400 text-xs leading-relaxed mb-6">
              Áudio corrigido, sistema de temas adicionado e novas opções de perfil.
            </p>
            <button onClick={closePopup} className="w-full py-4 bg-white text-black font-black rounded-2xl active:scale-95 transition-all">
              VAMOS TOCAR!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}