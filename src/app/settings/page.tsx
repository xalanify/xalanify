"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { User, Palette, Info, LogOut, RefreshCw, History, ChevronRight, ShieldCheck } from "lucide-react";
import { useState } from "react";

export default function Settings() {
  const { user, themeColor, setThemeColor, login, isAdmin } = useXalanify();
  const [view, setView] = useState("menu");

  const changelog = [
    { version: "0.21.0 (Atual)", status: "latest", logs: ["Fix: Resolvido erros de compilação de isAdmin e login duplicado.", "Admin: Debug panel funcional no Player.", "Visual: Ajuste de padding para PWA."] },
    { version: "0.20.0", logs: ["Início do modo Admin @admin1.", "Preparação PWA."] },
    { version: "0.19.0", logs: ["Ponte YouTube-Spotify."] },
    { version: "0.18.0", logs: ["Créditos Xalana restaurados."] },
    { version: "0.17.0", logs: ["Histórico acumulado."] },
    { version: "0.16.0", logs: ["Refatoração Player."] },
    { version: "0.15.0", logs: ["Som agressivo."] },
    { version: "0.14.0", logs: ["Menu Definições."] },
    { version: "0.13.0", logs: ["Suporte YouTube."] },
    { version: "0.12.0", logs: ["Lançamento Musi Interface."] }
  ];

  if (view === "history") return (
    <div className="space-y-4 pb-20 animate-in slide-in-from-right duration-300">
      <button onClick={() => setView("menu")} className="text-[10px] font-black text-zinc-500 uppercase">← Voltar</button>
      <h2 className="text-2xl font-black mb-4">Histórico Xalanify</h2>
      {changelog.map(v => (
        <div key={v.version} className={`p-5 rounded-[2rem] border ${v.status === 'latest' ? 'bg-zinc-900 border-white/10' : 'bg-transparent border-white/5 opacity-50'}`}>
          <p className="text-xs font-black mb-2" style={{ color: v.status === 'latest' ? themeColor : 'white' }}>v{v.version}</p>
          {v.logs.map((log, i) => <p key={i} className="text-[10px] text-zinc-400 mb-1">• {log}</p>)}
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6 pb-40">
      <h1 className="text-3xl font-black px-2">Definições</h1>
      <button onClick={() => { const n = prompt("Nome:"); if(n) login(n); }} className="w-full flex items-center justify-between p-5 bg-zinc-900/50 border border-white/5 rounded-[2rem] text-left">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-white/5" style={{ color: themeColor }}>{isAdmin ? <ShieldCheck size={20} /> : <User size={20} />}</div>
          <div><p className="text-sm font-bold text-white">Perfil {isAdmin && "(Admin)"}</p><p className="text-[10px] text-zinc-500 uppercase">{user || "Utilizador"}</p></div>
        </div>
        <ChevronRight size={18} />
      </button>

      <button onClick={() => setView("history")} className="w-full flex items-center justify-between p-5 bg-zinc-900/50 border border-white/5 rounded-[2rem] text-left">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-white/5" style={{ color: themeColor }}><History size={20} /></div>
          <div><p className="text-sm font-bold text-white">Versões</p><p className="text-[10px] text-zinc-500 uppercase">v0.12.0 - v0.21.0</p></div>
        </div>
        <ChevronRight size={18} />
      </button>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <button onClick={() => window.location.reload()} className="p-5 bg-zinc-900/30 rounded-[2rem] border border-white/5 flex flex-col items-center gap-2">
          <RefreshCw size={20} className="text-zinc-500" />
          <span className="text-[9px] font-black uppercase tracking-widest">Refresh</span>
        </button>
        <button onClick={() => { localStorage.clear(); window.location.href="/"; }} className="p-5 bg-red-500/10 rounded-[2rem] border border-red-500/10 flex flex-col items-center gap-2 text-red-500">
          <LogOut size={20} /><span className="text-[9px] font-black uppercase">Sair</span>
        </button>
      </div>
    </div>
  );
}