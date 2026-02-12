"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { History, ChevronRight, Check, Youtube, Zap, Clock } from "lucide-react";
import { useState } from "react";

export default function Settings() {
  const { user, updateUserName, themeColor, audioEngine, setAudioEngine } = useXalanify();
  const [view, setView] = useState("menu");
  const versions = [
    { v: "0.70.0", added: ["Motor Híbrido (YouTube + Direct)", "Seletor de Engine nas Definições"], updated: ["Estabilidade do áudio local"] }
  ];

  if (view === "history") return (
    <div className="p-6 space-y-6">
       <button onClick={() => setView("menu")} className="text-zinc-500 font-bold text-xs uppercase">← Voltar</button>
       <h1 className="text-3xl font-black italic">Histórico</h1>
       {versions.map(v => (
         <div key={v.v} className="p-6 bg-zinc-900 rounded-[2rem] border border-white/5">
           <p className="font-bold text-purple-500">v{v.v}</p>
           <div className="text-[10px] mt-2 space-y-1">
             {v.added.map(a => <p key={a}>+ {a}</p>)}
           </div>
         </div>
       ))}
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-4xl font-black italic">Definições</h1>
      
      {/* SELETOR DE MOTOR */}
      <div className="space-y-3">
        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-2">Motor de Áudio</p>
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={() => setAudioEngine('youtube')}
            className={`p-4 rounded-3xl border transition-all flex flex-col items-center gap-2 ${audioEngine === 'youtube' ? 'bg-white/10 border-white/20' : 'bg-transparent border-white/5 opacity-40'}`}
          >
            <Youtube size={20} />
            <span className="text-[10px] font-bold">YouTube (Estável)</span>
          </button>
          <button 
            onClick={() => setAudioEngine('direct')}
            className={`p-4 rounded-3xl border transition-all flex flex-col items-center gap-2 ${audioEngine === 'direct' ? 'bg-white/10 border-white/20' : 'bg-transparent border-white/5 opacity-40'}`}
          >
            <Zap size={20} />
            <span className="text-[10px] font-bold">Direct (Musify)</span>
          </button>
        </div>
      </div>

      <button onClick={() => setView("history")} className="w-full flex items-center justify-between p-6 bg-zinc-900 border border-white/5 rounded-[2.5rem]">
        <div className="flex items-center gap-4"><Clock /> <span className="font-bold text-sm">Histórico de Updates</span></div>
        <ChevronRight size={18} />
      </button>
    </div>
  );
}