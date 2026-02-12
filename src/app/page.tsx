"use client";
import Search from "@/components/Search";
import { useState, useEffect } from "react";

export default function Home() {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const lastV = localStorage.getItem("xalanify_v_track");
    if (lastV !== "0.15.0") {
      setShowPopup(true);
    }
  }, []);

  const confirmUpdate = () => {
    localStorage.setItem("xalanify_v_track", "0.15.0");
    setShowPopup(false);
  };

  return (
    <div className="space-y-8 relative">
      <header className="pt-2">
        <span className="bg-red-600 text-white text-[9px] font-black px-3 py-1 rounded-full tracking-[0.2em] uppercase shadow-lg shadow-red-600/20">Beta</span>
      </header>

      <section><h3 className="text-2xl font-black mb-6 tracking-tight">Explorar Música</h3><Search /></section>

      {showPopup && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[100] flex items-center justify-center p-6 animate-in zoom-in-95 duration-300">
          <div className="bg-zinc-900 border border-white/10 rounded-[2.5rem] p-8 w-full max-w-xs text-center shadow-2xl">
            <h2 className="text-xl font-black mb-2 text-white">Versão 0.15.0 🔥</h2>
            <p className="text-zinc-400 text-xs mb-6">Correção final do áudio e histórico de versões completo.</p>
            <button onClick={confirmUpdate} className="w-full py-4 bg-white text-black font-black rounded-2xl active:scale-95 transition-transform">VAMOS TOCAR!</button>
          </div>
        </div>
      )}
    </div>
  );
}