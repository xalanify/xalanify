"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { User, ShieldCheck, Clock, ChevronRight, LogOut, Info } from "lucide-react";
import { useState } from "react";

export default function Settings() {
  const { user, themeColor, isAdmin, clearAdminCache } = useXalanify();
  const [view, setView] = useState("menu");

  const changelog = [
    { 
      version: "0.32.2", 
      status: "Atual", 
      date: "12 Fev 2026",
      added: ["Painel de Erros detalhado no modo Admin", "Novo sistema de logging de status do Player"],
      updated: ["Corrigido import do ReactPlayer (Module Not Found)", "Query do YouTube alterada para 'audio' para evitar bloqueios"],
      removed: ["Caminho de import /lazy (causava instabilidade no build)"]
    },
    { 
      version: "0.31.0", 
      status: "Anterior", 
      date: "10 Fev 2026",
      added: ["Suporte a Playlists", "Modo Admin via @admin1"],
      updated: ["Interface estilo Musi"],
      removed: []
    }
  ];

  if (view === "history") return (
    <div className="p-6 space-y-6 pb-40 animate-in slide-in-from-right duration-300">
      <button onClick={() => setView("menu")} className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">← Voltar</button>
      <h2 className="text-3xl font-black italic">Histórico de Versões</h2>
      
      <div className="space-y-6">
        {changelog.map((v) => (
          <div key={v.version} className={`p-6 rounded-[2.2rem] border ${v.status === 'Atual' ? 'bg-zinc-900 border-white/10' : 'bg-transparent border-white/5 opacity-60'}`}>
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-black px-3 py-1 bg-white/5 rounded-full" style={{ color: v.status === 'Atual' ? themeColor : 'white' }}>v{v.version}</span>
              <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">{v.date}</span>
            </div>
            
            <div className="space-y-4">
              {v.added.length > 0 && (
                <div>
                  <p className="text-[9px] text-green-500 font-black uppercase mb-1 tracking-wider">Adicionado</p>
                  {v.added.map(item => <p key={item} className="text-xs text-zinc-300 leading-relaxed">• {item}</p>)}
                </div>
              )}
              {v.updated.length > 0 && (
                <div>
                  <p className="text-[9px] text-blue-500 font-black uppercase mb-1 tracking-wider">Atualizado</p>
                  {v.updated.map(item => <p key={item} className="text-xs text-zinc-300 leading-relaxed">• {item}</p>)}
                </div>
              )}
              {v.removed.length > 0 && (
                <div>
                  <p className="text-[9px] text-red-500 font-black uppercase mb-1 tracking-wider">Removido</p>
                  {v.removed.map(item => <p key={item} className="text-xs text-zinc-300 leading-relaxed">• {item}</p>)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6 pb-40">
      <h1 className="text-4xl font-black italic">Definições</h1>
      <div className="space-y-3">
        <div className="w-full flex items-center justify-between p-6 bg-zinc-900/50 border border-white/5 rounded-[2.2rem]">
          <div className="flex items-center gap-4 text-left">
            <div className="p-3 rounded-2xl bg-white/5" style={{ color: themeColor }}>
              {isAdmin ? <ShieldCheck /> : <User />}
            </div>
            <div>
              <p className="text-sm font-bold">{user || "Visitante"}</p>
              <p className="text-[10px] text-zinc-500 uppercase font-black">{isAdmin ? "Modo Administrador" : "Utilizador Padrão"}</p>
            </div>
          </div>
        </div>

        <button onClick={() => setView("history")} className="w-full flex items-center justify-between p-6 bg-zinc-900/50 border border-white/5 rounded-[2.2rem] active:scale-95 transition-transform">
          <div className="flex items-center gap-4 text-left">
            <div className="p-3 rounded-2xl bg-white/5" style={{ color: themeColor }}><Clock /></div>
            <div>
              <p className="text-sm font-bold">Atualizações</p>
              <p className="text-[10px] text-zinc-500 uppercase font-black">Ver o que há de novo</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-zinc-700" />
        </button>

        {isAdmin && (
          <button onClick={clearAdminCache} className="w-full flex items-center justify-between p-6 bg-red-500/5 border border-red-500/20 rounded-[2.2rem] mt-6">
             <div className="flex items-center gap-4 text-left">
              <div className="p-3 rounded-2xl bg-red-500/10 text-red-500"><LogOut /></div>
              <p className="text-sm font-bold text-red-500">Resetar Cache</p>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}