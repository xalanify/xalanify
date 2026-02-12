"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { History, ChevronRight, Check, RotateCcw, ShieldCheck, User } from "lucide-react";
import { useState } from "react";

export default function Settings() {
  const { user, updateUserName, themeColor, isAdmin, clearAdminCache } = useXalanify();
  const [view, setView] = useState("menu");
  const [nameInput, setNameInput] = useState(user || "");
  const [isSaved, setIsSaved] = useState(false);

  const updates = [
    {
      v: "0.60.0",
      status: "Atual",
      added: ["Motor de áudio Piped API", "Definição de interface Track com audioUrl", "Histórico de Updates nas definições"],
      updated: ["Sincronização de tipos TypeScript", "Removido getYoutubeId (obsoleto)"],
      removed: ["Erro de compilação da Vercel"]
    }
  ];

  if (view === "history") return (
    <div className="p-6 space-y-6">
      <button onClick={() => setView("menu")} className="flex items-center gap-2 text-zinc-500 font-bold text-xs"><RotateCcw size={14}/> VOLTAR</button>
      <h1 className="text-3xl font-black italic">Updates</h1>
      {updates.map(u => (
        <div key={u.v} className="p-5 bg-zinc-900 border border-white/5 rounded-[2rem] text-left">
          <p className="font-bold mb-3" style={{ color: themeColor }}>Versão {u.v}</p>
          <div className="space-y-2 text-[10px]">
            {u.added.map(i => <p key={i}><span className="text-green-500 mr-2">+</span>{i}</p>)}
            {u.updated.map(i => <p key={i}><span className="text-blue-500 mr-2">~</span>{i}</p>)}
            {u.removed.map(i => <p key={i}><span className="text-red-500 mr-2">-</span>{i}</p>)}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-4xl font-black italic">Definições</h1>
      <div className="p-6 bg-zinc-900 border border-white/5 rounded-[2.5rem] flex items-center gap-4">
        <input 
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          className="bg-transparent border-none outline-none font-bold text-lg w-full text-white"
        />
        <button onClick={() => { updateUserName(nameInput); setIsSaved(true); setTimeout(()=>setIsSaved(false),2000); }} className="p-2 bg-white/5 rounded-xl">
          {isSaved ? <Check size={18} className="text-green-500" /> : <ChevronRight size={18} />}
        </button>
      </div>

      <button onClick={() => setView("history")} className="w-full flex items-center justify-between p-6 bg-zinc-900 border border-white/5 rounded-[2.5rem]">
        <div className="flex items-center gap-4"><History style={{ color: themeColor }}/> <span className="font-bold">Ver Atualizações</span></div>
        <ChevronRight size={18} className="text-zinc-700" />
      </button>

      {isAdmin && <button onClick={clearAdminCache} className="w-full p-4 bg-red-500/10 text-red-500 rounded-2xl font-bold">Reset System</button>}
    </div>
  );
}