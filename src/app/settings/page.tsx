"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { Palette, Moon, Sun, Layout } from "lucide-react";

export default function SettingsPage() {
  const { themeColor, setThemeColor, bgMode, setBgMode, logout } = useXalanify();

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-6xl font-black italic tracking-tighter mb-10">Ajustes</h1>

      {/* CORES */}
      <div className="glass-panel rounded-[2.5rem] p-8">
        <h2 className="text-xs font-black uppercase tracking-widest opacity-30 mb-6">Cor do Ecossistema</h2>
        <div className="grid grid-cols-5 gap-4">
          {["#a855f7", "#00d2ff", "#ff3b30", "#00ff88", "#ffffff"].map(c => (
            <button key={c} onClick={() => setThemeColor(c)} className={`aspect-square rounded-2xl ${themeColor === c ? 'ring-4 ring-white/20 scale-110' : ''}`} style={{backgroundColor: c}} />
          ))}
        </div>
      </div>

      {/* MODO DE FUNDO */}
      <div className="glass-panel rounded-[2.5rem] p-8">
        <h2 className="text-xs font-black uppercase tracking-widest opacity-30 mb-6">Fundo da App</h2>
        <div className="flex gap-4">
          <button 
            onClick={() => setBgMode('gradient')}
            className={`flex-1 p-6 rounded-3xl flex flex-col items-center gap-3 transition-all ${bgMode === 'gradient' ? 'bg-white/10' : 'opacity-30'}`}
          >
            <Layout size={24} />
            <span className="text-[10px] font-bold">GRADIENT</span>
          </button>
          <button 
            onClick={() => setBgMode('pure')}
            className={`flex-1 p-6 rounded-3xl flex flex-col items-center gap-3 transition-all ${bgMode === 'pure' ? 'bg-white/10' : 'opacity-30'}`}
          >
            <Moon size={24} />
            <span className="text-[10px] font-bold">PURE DARK</span>
          </button>
        </div>
      </div>

      <button onClick={logout} className="w-full glass-panel p-6 rounded-[2.5rem] text-red-500 font-bold text-sm">TERMINAR SESSÃO</button>
    </div>
  );
}