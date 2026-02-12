"use client";
import { useXalanify, VERSION_LOGS } from "@/context/XalanifyContext";
import { useState } from "react";
import { ChevronLeft, History, ShieldAlert, Trash2, Cpu, Palette, User } from "lucide-react";

export default function Settings() {
  const { user, isAdmin, themeColor, setThemeColor, audioEngine, setAudioEngine } = useXalanify();
  const [view, setView] = useState("menu");

  if (view === "logs") return (
    <div className="p-6 space-y-6">
      <button onClick={() => setView("menu")} className="flex items-center gap-2 text-zinc-500 font-bold text-xs uppercase"><ChevronLeft size={16}/> Voltar</button>
      <h2 className="text-3xl font-black">Histórico de Versões</h2>
      <div className="space-y-4">
        {VERSION_LOGS.map(log => (
          <div key={log.v} className="p-6 bg-zinc-900 border border-white/5 rounded-[2rem] space-y-2">
            <div className="flex justify-between items-center"><p className="font-black text-purple-400">v{log.v}</p><span className="text-[10px] text-zinc-600">{log.date}</span></div>
            <div className="text-[11px] text-zinc-400 space-y-1">
              {log.added.map(a => <p key={a}>+ {a}</p>)}
              {log.updated.map(u => <p key={u}>• {u}</p>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-4 pb-40">
      <h1 className="text-4xl font-black italic mb-10">Definições</h1>
      
      {/* OPÇÕES CLICÁVEIS */}
      <div className="w-full flex items-center justify-between p-5 bg-zinc-900 rounded-[2rem] border border-white/5">
        <div className="flex items-center gap-4"><User className="text-zinc-500"/><span className="font-bold">Perfil</span></div>
        <span className="text-xs text-zinc-500 font-black">{user}</span>
      </div>

      <button onClick={() => setAudioEngine(audioEngine === 'youtube' ? 'direct' : 'youtube')} className="w-full flex items-center justify-between p-5 bg-zinc-900 rounded-[2rem] border border-white/5">
        <div className="flex items-center gap-4"><Cpu className="text-zinc-500"/><span className="font-bold">Motor de Áudio</span></div>
        <span className="text-xs text-purple-500 font-black uppercase">{audioEngine}</span>
      </button>

      <button onClick={() => setView("logs")} className="w-full flex items-center justify-between p-5 bg-zinc-900 rounded-[2rem] border border-white/5">
        <div className="flex items-center gap-4"><History className="text-zinc-500"/><span className="font-bold">Versões e Sobre</span></div>
        <span className="text-xs text-zinc-500">v0.47.0</span>
      </button>

      {/* MENU ADMIN */}
      {isAdmin && (
        <div className="mt-10 p-6 bg-red-500/5 border border-red-500/20 rounded-[2.5rem] space-y-4">
          <p className="text-[10px] font-black text-red-500 uppercase tracking-widest text-center flex items-center justify-center gap-2"><ShieldAlert size={12}/> Painel Admin</p>
          <button onClick={() => {localStorage.clear(); window.location.reload();}} className="w-full p-4 bg-zinc-900 rounded-2xl flex items-center justify-center gap-3 text-red-500 text-xs font-bold">
            <Trash2 size={16} /> Reset Total da App
          </button>
        </div>
      )}
    </div>
  );
}