"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { User, ShieldCheck, Clock, ChevronRight, LogOut, Edit3 } from "lucide-react";
import { useState } from "react";

export default function Settings() {
  const { user, updateUserName, themeColor, isAdmin, clearAdminCache } = useXalanify();
  const [view, setView] = useState("menu");
  const [newName, setNewName] = useState(user || "");

  const changelog = [
    { 
      v: "0.20.0", date: "Hoje",
      added: ["Modo Debug avançado no Player", "Música de teste para Admin", "Campo de alteração de nome"],
      updated: ["Motor de busca YouTube para versões 'Lyrics'", "Migração para youtube-nocookie"],
      removed: ["Z-index conflituoso na Navigation"]
    },
    { 
      v: "0.16.0", date: "12 Fev 2026",
      added: ["Histórico de Versões", "Suporte a PWA"],
      updated: ["UI estilo Musi"],
      removed: ["Antigo extrator de MP3 instável"]
    }
  ];

  if (view === "history") return (
    <div className="p-6 space-y-6 pb-40 animate-in slide-in-from-right duration-300">
      <button onClick={() => setView("menu")} className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">← Voltar</button>
      <h2 className="text-3xl font-black italic">Histórico</h2>
      <div className="space-y-4">
        {changelog.map(log => (
          <div key={log.v} className="p-6 bg-zinc-900 border border-white/5 rounded-[2rem]">
            <div className="flex justify-between mb-4"><span className="font-bold text-sm" style={{color: themeColor}}>v{log.v}</span><span className="text-[9px] uppercase text-zinc-500">{log.date}</span></div>
            <div className="space-y-3">
              {log.added.map(i => <p key={i} className="text-[11px] text-zinc-300"><span className="text-green-500 font-bold mr-2">+</span>{i}</p>)}
              {log.updated.map(i => <p key={i} className="text-[11px] text-zinc-300"><span className="text-blue-500 font-bold mr-2">~</span>{i}</p>)}
              {log.removed.map(i => <p key={i} className="text-[11px] text-zinc-300"><span className="text-red-500 font-bold mr-2">-</span>{i}</p>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6 pb-40">
      <h1 className="text-4xl font-black italic">Definições</h1>
      <div className="space-y-4">
        {/* MUDAR NOME */}
        <div className="p-6 bg-zinc-900 border border-white/5 rounded-[2.2rem] space-y-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-white/5" style={{ color: themeColor }}>
              {isAdmin ? <ShieldCheck /> : <User />}
            </div>
            <div className="flex-1">
              <input 
                value={newName} 
                onChange={(e) => setNewName(e.target.value)}
                className="bg-transparent border-none outline-none font-bold text-lg w-full"
              />
              <p className="text-[10px] text-zinc-500 uppercase font-black">{isAdmin ? "Admin Mode" : "User Free"}</p>
            </div>
            <button onClick={() => updateUserName(newName)} className="p-2 bg-white/5 rounded-xl text-zinc-400"><Edit3 size={16}/></button>
          </div>
        </div>

        <button onClick={() => setView("history")} className="w-full flex items-center justify-between p-6 bg-zinc-900/50 border border-white/5 rounded-[2.2rem]">
          <div className="flex items-center gap-4 text-left">
            <div className="p-3 rounded-2xl bg-white/5" style={{ color: themeColor }}><Clock /></div>
            <div><p className="text-sm font-bold">Ver Atualizações</p><p className="text-[10px] text-zinc-500 uppercase font-black">Histórico detalhado</p></div>
          </div>
          <ChevronRight size={18} className="text-zinc-700" />
        </button>

        {isAdmin && (
          <button onClick={clearAdminCache} className="w-full p-6 bg-red-500/10 border border-red-500/20 rounded-[2.2rem] text-red-500 font-bold flex items-center gap-3">
            <LogOut size={18}/> Limpar Cache Admin
          </button>
        )}
      </div>
    </div>
  );
}