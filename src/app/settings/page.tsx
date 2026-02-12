"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { User, Palette, Info, LogOut, RefreshCw, History, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function Settings() {
  const { user, themeColor, setThemeColor, login } = useXalanify();
  const [view, setView] = useState("menu");

  // Dentro do array changelog no ficheiro Settings:
const changelog = [
  { 
    version: "0.19.0 (Atual)", 
    status: "latest", 
    logs: [
      "Integração Real YouTube-Spotify: O áudio agora é extraído via YouTube Data API v3.",
      "Correção de AbortError: O player agora só inicia com um link válido.",
      "Loading State: Adicionado indicador visual de busca de áudio."
    ] 
  },
  { version: "0.18.0", logs: ["Ajuste de estilos e logo Xalana."] },
  { version: "0.17.0", logs: ["Implementação de histórico acumulado."] },
  { version: "0.16.0", logs: ["Refatoração do componente Player."] },
  { version: "0.15.0", logs: ["Motor de áudio agressivo."] },
  { version: "0.14.0", logs: ["Criação do menu Definições."] },
  { version: "0.13.0", logs: ["Suporte inicial YouTube."] },
  { version: "0.12.0", logs: ["Lançamento Musi Interface."] }
];

  if (view === "about") return (
    <div className="space-y-6 text-center animate-in zoom-in-95 duration-300">
      <button onClick={() => setView("menu")} className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block w-full text-left">← Voltar</button>
      <div className="py-12 bg-zinc-900 rounded-[3rem] border border-white/10 mx-1">
        <div className="w-20 h-20 bg-black rounded-[2rem] mx-auto mb-4 flex items-center justify-center border-2" style={{ borderColor: themeColor }}>
           <span className="text-4xl font-black italic" style={{ color: themeColor }}>X</span>
        </div>
        <h2 className="text-2xl font-black">Xalanify</h2>
        <p className="text-zinc-400 text-sm mt-2">Orgulhosamente criado por</p>
        <p className="text-white font-black text-xl tracking-tighter uppercase">Xalana</p>
        <div className="mt-8 pt-8 border-t border-white/5">
          <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.3em]">Version 0.18.0 Stable</p>
        </div>
      </div>
    </div>
  );

  if (view === "history") return (
    <div className="space-y-4 animate-in slide-in-from-right duration-300">
      <button onClick={() => setView("menu")} className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">← Voltar</button>
      <h2 className="text-2xl font-black px-2 mb-4">Atualizações</h2>
      <div className="space-y-3">
        {changelog.map(v => (
          <div key={v.version} className={`p-5 rounded-[2rem] border ${v.status === 'latest' ? 'bg-zinc-900 border-white/10' : 'bg-transparent border-white/5 opacity-50'}`}>
            <p className="text-xs font-black mb-2" style={{ color: v.status === 'latest' ? themeColor : 'white' }}>v{v.version}</p>
            {v.logs.map((log, i) => <p key={i} className="text-[10px] text-zinc-400 mb-1">• {log}</p>)}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-40">
      <h1 className="text-3xl font-black px-2">Definições</h1>
      <button onClick={() => { const n = prompt("Novo nome:"); if(n) login(n); }} className="w-full flex items-center justify-between p-5 bg-zinc-900/50 border border-white/5 rounded-[2rem] mb-3">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-white/5" style={{ color: themeColor }}><User size={20} /></div>
          <div className="text-left"><p className="text-sm font-bold text-white">Perfil</p><p className="text-[10px] text-zinc-500 uppercase">{user || "Utilizador"}</p></div>
        </div>
        <ChevronRight size={18} className="text-zinc-700" />
      </button>

      <button onClick={() => { const cores = ["#a855f7", "#3b82f6", "#f43f5e", "#22c55e", "#f97316"]; setThemeColor(cores[(cores.indexOf(themeColor) + 1) % cores.length]); }} className="w-full flex items-center justify-between p-5 bg-zinc-900/50 border border-white/5 rounded-[2rem] mb-3">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-white/5" style={{ color: themeColor }}><Palette size={20} /></div>
          <div className="text-left"><p className="text-sm font-bold text-white">Cor do Tema</p><p className="text-[10px] text-zinc-500 uppercase">Personalizar</p></div>
        </div>
        <ChevronRight size={18} className="text-zinc-700" />
      </button>

      <button onClick={() => setView("history")} className="w-full flex items-center justify-between p-5 bg-zinc-900/50 border border-white/5 rounded-[2rem] mb-3">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-white/5" style={{ color: themeColor }}><History size={20} /></div>
          <div className="text-left"><p className="text-sm font-bold text-white">Histórico</p><p className="text-[10px] text-zinc-500 uppercase">v0.12.0 - v0.18.0</p></div>
        </div>
        <ChevronRight size={18} className="text-zinc-700" />
      </button>

      <button onClick={() => setView("about")} className="w-full flex items-center justify-between p-5 bg-zinc-900/50 border border-white/5 rounded-[2rem] mb-3">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-white/5" style={{ color: themeColor }}><Info size={20} /></div>
          <div className="text-left"><p className="text-sm font-bold text-white">Sobre</p><p className="text-[10px] text-zinc-500 uppercase">Criado por Xalana</p></div>
        </div>
        <ChevronRight size={18} className="text-zinc-700" />
      </button>

      <div className="grid grid-cols-2 gap-3 mt-4 px-1">
        <button onClick={() => window.location.reload()} className="p-5 bg-zinc-900/30 rounded-[2rem] border border-white/5 flex flex-col items-center gap-2">
          <RefreshCw size={20} className="text-zinc-500" />
          <span className="text-[9px] font-black uppercase tracking-widest">Refresh</span>
        </button>
        <button onClick={() => { localStorage.clear(); window.location.href="/"; }} className="p-5 bg-red-500/10 rounded-[2rem] border border-red-500/10 flex flex-col items-center gap-2 text-red-500">
          <LogOut size={20} />
          <span className="text-[9px] font-black uppercase tracking-widest">Sair</span>
        </button>
      </div>
    </div>
  );
}