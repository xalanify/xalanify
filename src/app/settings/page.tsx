//
"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { User, ShieldCheck, Terminal, History, ChevronRight, LogOut, Clock } from "lucide-react";
import { useState } from "react";

export default function Settings() {
  const { user, themeColor, isAdmin, login, clearAdminCache } = useXalanify();
  const [view, setView] = useState("menu");

  const versions = [
    { 
      v: "0.32.1", 
      date: "Atual", 
      changes: {
        added: ["Modo Debug avançado no Player", "Logs de erro em tempo real"],
        updated: ["Algoritmo de pesquisa YouTube para evitar bloqueios embed"],
        removed: ["Dependência de 'Official Audio' nas buscas"]
      }
    },
    { 
      v: "0.32.0", 
      date: "12 Fev 2026", 
      changes: {
        added: ["Laboratório de API", "Suporte a Tailwind v4"],
        updated: ["Z-Index da Navigation"],
        removed: []
      }
    }
  ];

  if (view === "history") return (
    <div className="p-6 space-y-6 pb-40 animate-in slide-in-from-right duration-300">
      <button onClick={() => setView("menu")} className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">← Voltar</button>
      <h2 className="text-3xl font-black">Histórico</h2>
      
      <div className="space-y-4">
        {versions.map((ver) => (
          <div key={ver.v} className="p-5 bg-zinc-900 border border-white/5 rounded-[2rem] space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-black" style={{ color: themeColor }}>v{ver.v}</span>
              <span className="text-[9px] text-zinc-500 uppercase font-bold">{ver.date}</span>
            </div>
            
            {ver.changes.added.length > 0 && (
              <div>
                <p className="text-[9px] text-green-500 font-black uppercase mb-1">Adicionado</p>
                {ver.changes.added.map(log => <p key={log} className="text-[11px] text-zinc-300">• {log}</p>)}
              </div>
            )}
            {ver.changes.updated.length > 0 && (
              <div>
                <p className="text-[9px] text-blue-500 font-black uppercase mb-1">Atualizado</p>
                {ver.changes.updated.map(log => <p key={log} className="text-[11px] text-zinc-300">• {log}</p>)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6 pb-40">
      <h1 className="text-4xl font-black italic">Definições</h1>
      
      <div className="space-y-3">
        <button className="w-full flex items-center justify-between p-6 bg-zinc-900/50 border border-white/5 rounded-[2.2rem]">
          <div className="flex items-center gap-4 text-left">
            <div className="p-3 rounded-2xl bg-white/5" style={{ color: themeColor }}>
              {isAdmin ? <ShieldCheck /> : <User />}
            </div>
            <div>
              <p className="text-sm font-bold">{user || "Visitante"}</p>
              <p className="text-[10px] text-zinc-500 uppercase font-black">{isAdmin ? "Administrador" : "Utilizador Free"}</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-zinc-700" />
        </button>

        <button onClick={() => setView("history")} className="w-full flex items-center justify-between p-6 bg-zinc-900/50 border border-white/5 rounded-[2.2rem]">
          <div className="flex items-center gap-4 text-left">
            <div className="p-3 rounded-2xl bg-white/5" style={{ color: themeColor }}><Clock /></div>
            <div>
              <p className="text-sm font-bold">Ver Atualizações</p>
              <p className="text-[10px] text-zinc-500 uppercase font-black">Histórico de Versões</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-zinc-700" />
        </button>

        {isAdmin && (
          <button onClick={clearAdminCache} className="w-full flex items-center justify-between p-6 bg-red-500/5 border border-red-500/20 rounded-[2.2rem]">
             <div className="flex items-center gap-4 text-left">
              <div className="p-3 rounded-2xl bg-red-500/10 text-red-500"><LogOut /></div>
              <p className="text-sm font-bold text-red-500">Limpar Cache Admin</p>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}