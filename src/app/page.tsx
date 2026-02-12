"use client";
import Search from "@/components/Search";
import { useState, useEffect } from "react";

export default function Home() {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const lastV = localStorage.getItem("xalanify_v_track");
    if (lastV !== "0.16.0") setShowPopup(true);
  }, []);

  const confirmUpdate = () => {
    localStorage.setItem("xalanify_v_track", "0.16.0");
    setShowPopup(false);
  };

  return (
    <div className="space-y-8 relative">
      <header className="pt-2">
        <span className="bg-red-600 text-white text-[9px] font-black px-3 py-1 rounded-full tracking-[0.2em] uppercase">Beta</span>
      </header>

      <section><h3 className="text-2xl font-black mb-6 tracking-tight">Explorar Música</h3><Search /></section>

      {showPopup && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[100] flex items-center justify-center p-6 animate-in fade-in duration-500">
          <div className="bg-zinc-900 border border-white/10 rounded-[2.5rem] p-8 w-full max-w-xs text-center shadow-2xl">
            <h2 className="text-xl font-black mb-2 text-white">Update 0.16.0 🚀</h2>
            <p className="text-zinc-400 text-xs mb-6">Correção profunda no extrator de áudio e histórico de versões acumulado.</p>
            <button onClick={confirmUpdate} className="w-full py-4 bg-white text-black font-black rounded-2xl">VAMOS TOCAR!</button>
          </div>
        </div>
      )}
    </div>
  );
}