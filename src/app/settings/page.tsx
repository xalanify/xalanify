"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { User, Palette, Info, LogOut, RefreshCw, History, ChevronRight, ShieldCheck, Trash2 } from "lucide-react";
import { useState } from "react";

export default function Settings() {
  const { user, themeColor, setThemeColor, login, isAdmin, clearAdminCache } = useXalanify();
  const [view, setView] = useState("menu");

  const changelog = [
    { 
      version: "0.23.0 (Atual)", 
      status: "latest", 
      logs: [
        "Fix: Corrigido tipo React.ReactNode (erro de compilação).",
        "Admin: Adicionado botão 'Limpar Cache Total' para desenvolvedores.",
        "PWA: Otimização de meta tags para ecrã inteiro em dispositivos móveis."
      ] 
    },
    { version: "0.22.0", logs: ["Ajuste de busca assíncrona para áudio."] },
    { version: "0.21.0", logs: ["Ajuste de tipos no Context."] },
    { version: "0.20.0", logs: ["Modo Admin @admin1 e PWA."] },
    { version: "0.12.0", logs: ["Interface Base."] }
  ];

  if (view === "history") return (
    <div className="space-y-4 pb-20 animate-in slide-in-from-right duration-300">
      <button onClick={() => setView("menu")} className="text-[10px] font-black text-zinc-500 uppercase">← Voltar</button>
      <h2 className="text-2xl font-black mb-4 px-2">Histórico Completo</h2>
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

      {/* BOTÃO EXCLUSIVO ADMIN */}
      {isAdmin && (
        <button onClick={clearAdminCache} className="w-full flex items-center justify-between p-5 bg-red-500/5 border border-red-500/20 rounded-[2rem] text-left">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-red-500/10 text-red-500"><Trash2 size={20} /></div>
            <div><p className="text-sm font-bold text-red-500">Limpar Cache Admin</p><p className="text-[10px] text-red-400 uppercase">Reset Forçado</p></div>
          </div>
        </button>
      )}

      <button onClick={() => setView("history")} className="w-full flex items-center justify-between p-5 bg-zinc-900/50 border border-white/5 rounded-[2rem] text-left">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-white/5" style={{ color: themeColor }}><History size={20} /></div>
          <div><p className="text-sm font-bold text-white">Histórico de Versões</p><p className="text-[10px] text-zinc-500 uppercase">Visualizar todas as mudanças</p></div>
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