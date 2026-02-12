"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { User, ShieldCheck, Clock, ChevronRight, LogOut, Check, RotateCcw } from "lucide-react";
import { useState } from "react";

export default function Settings() {
  const { user, updateUserName, themeColor, isAdmin, clearAdminCache } = useXalanify();
  const [view, setView] = useState("menu");
  const [nameInput, setNameInput] = useState(user || "");
  const [isSaved, setIsSaved] = useState(false);

  const versions = [
    {
      v: "0.50.0", date: "Hoje",
      added: ["Suporte direto a ficheiros MP3 locais (/public/test.mp3)", "Painel de Debug Visual para Admin", "Feedback de salvamento de nome"],
      updated: ["Importação dinâmica do Player para corrigir erro de módulos", "Lógica de busca silenciosa para versões Audio Topic"],
      removed: ["Dependência direta de react-player/youtube (causava erro de tipos)"]
    },
    {
      v: "0.16.0", date: "12 Fev",
      added: ["Sistema de Cores Dinâmicas", "Modo Admin @admin1"],
      updated: ["Layout Style Musi"],
      removed: []
    }
  ];

  if (view === "history") return (
    <div className="p-6 space-y-6 pb-40 animate-in slide-in-from-right duration-300">
      <button onClick={() => setView("menu")} className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
        <RotateCcw size={12}/> Voltar
      </button>
      <h1 className="text-3xl font-black italic">Histórico</h1>
      <div className="space-y-4">
        {versions.map(v => (
          <div key={v.v} className="p-6 bg-zinc-900 border border-white/5 rounded-[2.2rem]">
            <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
              <span className="font-bold text-sm" style={{ color: themeColor }}>v{v.v}</span>
              <span className="text-[9px] text-zinc-500 uppercase">{v.date}</span>
            </div>
            <div className="space-y-3 text-[11px]">
               {v.added.map(item => <p key={item}><span className="text-green-500 mr-2 font-bold">+</span>{item}</p>)}
               {v.updated.map(item => <p key={item}><span className="text-blue-500 mr-2 font-bold">~</span>{item}</p>)}
               {v.removed.map(item => <p key={item}><span className="text-red-500 mr-2 font-bold">-</span>{item}</p>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6 pb-40">
      <h1 className="text-4xl font-black italic">Definições</h1>
      
      <div className="p-6 bg-zinc-900/50 border border-white/5 rounded-[2.5rem] space-y-4">
        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest text-left">Perfil</p>
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-white/5" style={{ color: themeColor }}>
            {isAdmin ? <ShieldCheck /> : <User />}
          </div>
          <input 
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            className="bg-transparent border-none outline-none font-bold text-lg w-full text-white"
          />
          <button onClick={() => { updateUserName(nameInput); setIsSaved(true); setTimeout(() => setIsSaved(false), 2000); }} className="p-2 bg-white/5 rounded-xl">
            {isSaved ? <Check size={18} className="text-green-500" /> : <ChevronRight size={18} />}
          </button>
        </div>
      </div>

      <button onClick={() => setView("history")} className="w-full flex items-center justify-between p-6 bg-zinc-900/50 border border-white/5 rounded-[2.5rem] active:scale-95 transition-all">
        <div className="flex items-center gap-4 text-left">
          <div className="p-3 rounded-2xl bg-white/5" style={{ color: themeColor }}><Clock /></div>
          <div>
            <p className="text-sm font-bold">Versões</p>
            <p className="text-[10px] text-zinc-500 uppercase font-black tracking-tight">Vê o que mudou</p>
          </div>
        </div>
        <ChevronRight size={18} className="text-zinc-700" />
      </button>

      {isAdmin && (
        <button onClick={clearAdminCache} className="w-full p-6 bg-red-500/10 border border-red-500/20 rounded-[2.5rem] text-red-500 font-bold flex items-center gap-3">
          <LogOut size={18}/> Reset Admin Cache
        </button>
      )}
    </div>
  );
}