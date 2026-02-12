"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { useState } from "react";
import { ChevronLeft, User, Palette, Cpu, Clock, Check, LogOut } from "lucide-react";

export default function Settings() {
  const { user, login, themeColor, setThemeColor, audioEngine, setAudioEngine } = useXalanify();
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const colors = ["#a855f7", "#3b82f6", "#10b981", "#f43f5e", "#eab308", "#ffffff"];

  if (activeTab === 'profile') return (
    <div className="p-6 space-y-6">
      <button onClick={() => setActiveTab(null)} className="flex items-center gap-2 text-zinc-500 font-bold text-xs uppercase"><ChevronLeft size={16}/> Voltar</button>
      <h2 className="text-3xl font-black">Perfil</h2>
      <input 
        defaultValue={user || ""} 
        onBlur={(e) => login(e.target.value)}
        className="w-full bg-zinc-900 p-4 rounded-2xl border border-white/5 outline-none focus:border-white/20"
      />
      <button onClick={() => window.location.reload()} className="w-full p-4 bg-red-500/10 text-red-500 rounded-2xl font-bold flex items-center justify-center gap-2">
        <LogOut size={18}/> Sair da Conta
      </button>
    </div>
  );

  if (activeTab === 'engine') return (
    <div className="p-6 space-y-6">
      <button onClick={() => setActiveTab(null)} className="flex items-center gap-2 text-zinc-500 font-bold text-xs uppercase"><ChevronLeft size={16}/> Voltar</button>
      <h2 className="text-3xl font-black">Motor</h2>
      <div className="space-y-3">
        {['youtube', 'direct'].map((e) => (
          <button 
            key={e} onClick={() => setAudioEngine(e as any)}
            className={`w-full p-5 rounded-3xl border flex justify-between items-center ${audioEngine === e ? 'bg-white/10 border-white/20' : 'border-transparent bg-zinc-900/40'}`}
          >
            <span className="font-bold uppercase text-xs tracking-widest">{e === 'youtube' ? 'YouTube (Estável)' : 'Direct (Musify)'}</span>
            {audioEngine === e && <Check size={18} style={{ color: themeColor }} />}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-4xl font-black italic mb-10">Definições</h1>
      
      <button onClick={() => setActiveTab('profile')} className="w-full flex items-center justify-between p-5 bg-zinc-900/40 rounded-[2rem] border border-white/5">
        <div className="flex items-center gap-4"><User className="text-zinc-500"/><span className="font-bold">Perfil</span></div>
        <span className="text-xs text-zinc-500">{user}</span>
      </button>

      <button onClick={() => setActiveTab('engine')} className="w-full flex items-center justify-between p-5 bg-zinc-900/40 rounded-[2rem] border border-white/5">
        <div className="flex items-center gap-4"><Cpu className="text-zinc-500"/><span className="font-bold">Motor</span></div>
        <span className="text-xs text-zinc-500 uppercase">{audioEngine}</span>
      </button>

      <div className="p-5 bg-zinc-900/40 rounded-[2rem] border border-white/5 space-y-4">
        <div className="flex items-center gap-4 mb-2"><Palette className="text-zinc-500"/><span className="font-bold">Tema</span></div>
        <div className="flex justify-between gap-2">
          {colors.map(c => (
            <button key={c} onClick={() => setThemeColor(c)} className="w-8 h-8 rounded-full border-2" style={{ backgroundColor: c, borderColor: themeColor === c ? 'white' : 'transparent' }} />
          ))}
        </div>
      </div>
    </div>
  );
}