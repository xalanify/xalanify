"use client";
import { useXalanify, VERSION_LOGS } from "@/context/XalanifyContext";
import { useState } from "react";
import { ChevronLeft, History, ShieldAlert } from "lucide-react";

export default function Settings() {
  const { user, themeColor, isAdmin } = useXalanify();
  const [view, setView] = useState("menu");

  if (view === "logs") return (
    <div className="p-6 space-y-6">
      <button onClick={() => setView("menu")} className="flex items-center gap-2 text-zinc-500 font-bold text-xs uppercase"><ChevronLeft size={16}/> Voltar</button>
      <h2 className="text-3xl font-black">Patch Notes</h2>
      <div className="space-y-6">
        {VERSION_LOGS.map(log => (
          <div key={log.v} className="p-6 bg-zinc-900/40 rounded-[2.5rem] border border-white/5 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-black text-lg">v{log.v}</span>
              <span className="text-[10px] text-zinc-500">{log.date}</span>
            </div>
            <div className="space-y-1 text-xs text-zinc-400">
              {log.added.map(a => <p key={a} className="text-white/80">• Adicionado: {a}</p>)}
              {log.updated.map(u => <p key={u}>• Atualizado: {u}</p>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-4 pb-40">
      <h1 className="text-4xl font-black italic mb-10">Definições</h1>
      
      {/* BOTÕES DE MENU... */}
      <button onClick={() => setView("logs")} className="w-full flex items-center justify-between p-5 bg-zinc-900/40 rounded-[2rem] border border-white/5">
        <div className="flex items-center gap-4"><History className="text-zinc-500"/><span className="font-bold">Histórico de Versões</span></div>
        <span className="text-xs text-zinc-500">v0.46.0</span>
      </button>

      {/* MENU DEBUG SÓ PARA ADMIN */}
      {isAdmin && (
        <div className="mt-10 p-6 bg-red-500/5 border border-red-500/20 rounded-[2.5rem] space-y-4">
          <div className="flex items-center gap-2 text-red-500 font-black uppercase text-[10px] tracking-[0.4em]">
            <ShieldAlert size={14} /> Admin Debug
          </div>
          <button className="w-full p-4 bg-zinc-900 rounded-2xl text-xs font-bold" onClick={() => console.log(VERSION_LOGS)}>Dump Logs Console</button>
          <button className="w-full p-4 bg-zinc-900 rounded-2xl text-xs font-bold" onClick={() => localStorage.clear()}>Reset Total</button>
        </div>
      )}
    </div>
  );
}