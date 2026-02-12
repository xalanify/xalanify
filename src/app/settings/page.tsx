"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { useState } from "react";
import { ChevronRight, User, Palette, Cpu, Info, Clock, Check } from "lucide-react";

export default function Settings() {
  const { user, updateUserName, themeColor, setThemeColor, audioEngine, setAudioEngine } = useXalanify();
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const colors = ["#a855f7", "#3b82f6", "#10b981", "#f43f5e", "#eab308"];

  const sections = [
    { id: 'user', name: 'Perfil', icon: User, desc: user },
    { id: 'theme', name: 'Aparência', icon: Palette, desc: 'Cor do tema' },
    { id: 'engine', name: 'Motor de Áudio', icon: Cpu, desc: audioEngine.toUpperCase() },
    { id: 'history', name: 'Versões', icon: Clock, desc: 'v0.85.0' },
    { id: 'about', name: 'Sobre', icon: Info, desc: 'Xalanify v1' },
  ];

  if (activeTab === 'theme') return (
    <div className="p-6 space-y-6">
      <button onClick={() => setActiveTab(null)} className="text-xs font-black uppercase text-zinc-500">← Voltar</button>
      <h2 className="text-3xl font-black">Cor do Tema</h2>
      <div className="grid grid-cols-3 gap-4 pt-4">
        {colors.map(c => (
          <button 
            key={c} 
            onClick={() => setThemeColor(c)}
            className="h-16 rounded-3xl border-2 transition-all flex items-center justify-center"
            style={{ backgroundColor: c, borderColor: themeColor === c ? 'white' : 'transparent' }}
          >
            {themeColor === c && <Check className="text-white" />}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-4xl font-black italic mb-10">Definições</h1>
      <div className="space-y-3">
        {sections.map(s => (
          <button 
            key={s.id}
            onClick={() => setActiveTab(s.id)}
            className="w-full flex items-center justify-between p-5 bg-zinc-900/40 border border-white/5 rounded-[2rem] hover:bg-white/5 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-white/5 text-zinc-400"><s.icon size={20} /></div>
              <div className="text-left">
                <p className="text-sm font-bold">{s.name}</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{s.desc}</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-zinc-600" />
          </button>
        ))}
      </div>
      
      <div className="pt-10 text-center">
        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.5em]">Xalanify 2026</p>
        <p className="text-[9px] text-zinc-700 mt-1">Made with Precision</p>
      </div>
    </div>
  );
}