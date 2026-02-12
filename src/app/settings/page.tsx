"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { User, ShieldCheck, Clock, ChevronRight, LogOut, Check } from "lucide-react";
import { useState } from "react";

export default function Settings() {
  const { user, updateUserName, themeColor, isAdmin, clearAdminCache } = useXalanify();
  const [view, setView] = useState("menu");
  const [nameInput, setNameInput] = useState(user || "");
  const [saved, setSaved] = useState(false);

  const versions = [
    {
      v: "0.25.0", status: "Atual", date: "Fev 2026",
      added: ["Suporte a reprodução de ficheiro local (/public/test.mp3)", "Painel de Debug persistente", "Feedback visual ao salvar nome"],
      updated: ["Lógica de volume do Player", "Tratamento de erros de Embed"],
      removed: ["Dependência de scripts externos de áudio"]
    },
    {
      v: "0.24.1", status: "Anterior", date: "Jan 2026",
      added: ["Mudança de cores dinâmicas"],
      updated: ["Z-Index da Navigation"],
      removed: []
    }
  ];

  const handleSaveName = () => {
    updateUserName(nameInput);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (view === "history") return (
    <div className="p-6 space-y-6 pb-40 animate-in slide-in-from-right duration-300">
      <button onClick={() => setView("menu")} className="text-[10px] font-black text-zinc-500 uppercase">← Voltar</button>
      <h2 className="text-3xl font-black italic">Histórico</h2>
      <div className="space-y-4">
        {versions.map(v => (
          <div key={v.v} className="p-6 bg-zinc-900 rounded-[2rem] border border-white/5">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold" style={{color: themeColor}}>{v.v} ({v.status})</span>
              <span className="text-[9px] text-zinc-500 uppercase">{v.date}</span>
            </div>
            <div className="space-y-2 text-[11px]">
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
    <div className="p-6 space-y-6 pb-40">
      <h1 className="text-4xl font-black italic">Definições</h1>
      
      {/* SEÇÃO NOME */}
      <div className="p-6 bg-zinc-900/50 border border-white/5 rounded-[2.2rem] space-y-4">
        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Perfil</p>
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-white/5" style={{ color: themeColor }}>
            {isAdmin ? <ShieldCheck /> : <User />}
          </div>
          <div className="flex-1">
            <input 
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="bg-transparent border-none outline-none font-bold text-lg w-full text-white"
            />
          </div>
          <button onClick={handleSaveName} className="p-2 bg-white/5 rounded-xl transition-all">
            {saved ? <Check size={18} className="text-green-500" /> : <ChevronRight size={18} />}
          </button>
        </div>
      </div>

      <button onClick={() => setView("history")} className="w-full flex items-center justify-between p-6 bg-zinc-900/50 border border-white/5 rounded-[2.2rem]">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-white/5" style={{ color: themeColor }}><Clock /></div>
          <div className="text-left"><p className="text-sm font-bold">Atualizações</p><p className="text-[10px] text-zinc-500 uppercase font-black">Ver o que mudou</p></div>
        </div>
        <ChevronRight size={18} className="text-zinc-700" />
      </button>

      {isAdmin && (
        <button onClick={clearAdminCache} className="w-full p-6 bg-red-500/10 border border-red-500/20 rounded-[2.2rem] text-red-500 font-bold flex items-center gap-3">
          <LogOut size={18}/> Limpar Cache
        </button>
      )}
    </div>
  );
}