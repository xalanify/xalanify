"use client";
import { useXalanify, VERSION_LOGS, VERSION } from "@/context/XalanifyContext";
import { useState } from "react";
import { ChevronLeft, History, ShieldAlert, Palette, Info, Cpu, FlaskConical } from "lucide-react";

export default function Settings() {
  const { themeColor, setThemeColor, isAdmin, audioEngine, setAudioEngine } = useXalanify();
  const [view, setView] = useState("menu");
  const colors = ["#a855f7", "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#ffffff"];

  if (view === "logs") return (
    <div className="p-6 space-y-6">
      <button onClick={() => setView("menu")} className="flex items-center gap-2 text-zinc-500 font-bold text-[10px] uppercase"><ChevronLeft size={14}/> Voltar</button>
      <h2 className="text-3xl font-black">Patch Notes</h2>
      <div className="space-y-4">
        {VERSION_LOGS.map(log => (
          <div key={log.v} className="p-6 bg-zinc-900 border border-white/5 rounded-[2rem] space-y-2">
            <p className="font-black" style={{ color: themeColor }}>v{log.v}</p>
            <div className="text-[11px] text-zinc-400 space-y-1">{log.added.map(a => <p key={a}>+ {a}</p>)}</div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-4xl font-black italic mb-8">Definições</h1>

      {/* TEMA */}
      <div className="p-6 bg-zinc-900/40 border border-white/5 rounded-[2.5rem] space-y-4">
        <div className="flex items-center gap-3 text-[10px] font-black uppercase text-zinc-500"><Palette size={14}/> Cor do Tema</div>
        <div className="flex justify-between">
          {colors.map(c => (
            <button key={c} onClick={() => setThemeColor(c)} className="w-8 h-8 rounded-full border-2" style={{ backgroundColor: c, borderColor: themeColor === c ? 'white' : 'transparent' }} />
          ))}
        </div>
      </div>

      {/* MOTOR */}
      <button onClick={() => setAudioEngine(audioEngine === 'youtube' ? 'direct' : 'youtube')} className="w-full flex items-center justify-between p-6 bg-zinc-900 rounded-[2.2rem] border border-white/5">
        <div className="flex items-center gap-4"><Cpu className="text-zinc-500"/><span className="font-bold">Motor: {audioEngine}</span></div>
      </button>

      {/* SOBRE / LOGS */}
      <button onClick={() => setView("logs")} className="w-full flex items-center justify-between p-6 bg-zinc-900 rounded-[2.2rem] border border-white/5">
        <div className="flex items-center gap-4"><Info className="text-zinc-500"/><span className="font-bold">Sobre o Xalanify</span></div>
        <span className="text-xs font-black">v{VERSION}</span>
      </button>

      {/* ADMIN TOOLS (@admin1) */}
      {isAdmin && (
        <div className="mt-10 p-6 bg-red-500/5 border border-red-500/20 rounded-[2.5rem] space-y-6">
          <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em] text-center">Admin Dashboard</p>
          <div className="space-y-2">
            <button className="w-full p-4 bg-zinc-900 rounded-2xl text-[10px] font-black flex items-center gap-3"><FlaskConical size={14}/> Testar YouTube API</button>
            <button className="w-full p-4 bg-zinc-900 rounded-2xl text-[10px] font-black flex items-center gap-3"><History size={14}/> Ver Logs de Erros</button>
            <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="w-full p-4 bg-red-500/20 text-red-500 rounded-2xl text-[10px] font-black">Reset Factory Settings</button>
          </div>
        </div>
      )}
    </div>
  );
}