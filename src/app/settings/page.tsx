"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { User, ShieldCheck, Clock, ChevronRight, Check, History, RotateCcw } from "lucide-react";
import { useState } from "react";

export default function Settings() {
  const { user, updateUserName, themeColor, isAdmin } = useXalanify();
  const [view, setView] = useState("menu");
  const [nameInput, setNameInput] = useState(user || "");
  const [isSaved, setIsSaved] = useState(false);

  const versions = [
    {
      v: "0.50.2",
      date: "12 Fev 2026",
      added: ["Suporte nativo para Tailwind CSS v4 Engine", "Configuração PostCSS para Vercel"],
      updated: ["Dependências do React 19 e Next 15.5", "Performance do Player"],
      removed: ["Ficheiros de configuração CSS obsoletos"]
    },
    {
      v: "0.50.0",
      date: "11 Fev 2026",
      added: ["Modo Admin @admin1", "Histórico de Versões nas Definições"],
      updated: ["UI Estilo Musify"],
      removed: []
    }
  ];

  if (view === "history") return (
    <div className="p-6 space-y-6 pb-40 animate-in slide-in-from-right duration-300">
      <header className="flex items-center gap-4">
        <button onClick={() => setView("menu")} className="p-2 bg-white/5 rounded-full"><RotateCcw size={16}/></button>
        <h1 className="text-2xl font-black italic">Histórico de Updates</h1>
      </header>
      <div className="space-y-4">
        {versions.map(v => (
          <div key={v.v} className="p-5 bg-zinc-900 border border-white/5 rounded-[2rem]">
            <div className="flex justify-between items-center mb-3">
              <span className="font-bold text-purple-500">v{v.v}</span>
              <span className="text-[10px] text-zinc-500 uppercase">{v.date}</span>
            </div>
            <div className="space-y-2 text-[11px] text-zinc-400">
              {v.added.map(i => <p key={i}><span className="text-green-500 mr-2">+</span>{i}</p>)}
              {v.updated.map(i => <p key={i}><span className="text-blue-500 mr-2">~</span>{i}</p>)}
              {v.removed.map(i => <p key={i}><span className="text-red-500 mr-2">-</span>{i}</p>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-4xl font-black italic">Definições</h1>
      <div className="p-6 bg-zinc-900/50 border border-white/5 rounded-[2.5rem] space-y-4">
        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest text-left">O teu nome</p>
        <div className="flex items-center gap-4">
          <input 
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            className="bg-transparent border-none outline-none font-bold text-lg w-full text-white"
          />
          <button onClick={() => { updateUserName(nameInput); setIsSaved(true); setTimeout(()=>setIsSaved(false),2000); }} className="p-2 bg-white/5 rounded-xl">
            {isSaved ? <Check size={18} className="text-green-500" /> : <ChevronRight size={18} />}
          </button>
        </div>
      </div>

      <button onClick={() => setView("history")} className="w-full flex items-center justify-between p-6 bg-zinc-900 border border-white/5 rounded-[2.5rem]">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/5 rounded-2xl text-purple-500"><History /></div>
          <div className="text-left">
            <p className="text-sm font-bold">Ver Atualizações</p>
            <p className="text-[10px] text-zinc-500 uppercase font-black">Logs do sistema</p>
          </div>
        </div>
        <ChevronRight size={18} className="text-zinc-700" />
      </button>
    </div>
  );
}