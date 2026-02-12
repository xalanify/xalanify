"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { User, Palette, Info, LogOut, RefreshCw, History, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function Settings() {
  const { user, themeColor, setThemeColor, login } = useXalanify();
  const [view, setView] = useState("menu");

  const themes = [
    { name: "Roxo Xalanify", hex: "#a855f7" },
    { name: "Azul Elétrico", hex: "#3b82f6" },
    { name: "Rosa Shock", hex: "#ec4899" },
    { name: "Verde Neon", hex: "#22c55e" },
    { name: "Fogo", hex: "#f97316" }
  ];

  const MenuButton = ({ icon: Icon, label, sub, onClick, color = "white" }: any) => (
    <button onClick={onClick} className="w-full flex items-center justify-between p-5 bg-zinc-900/50 border border-white/5 rounded-[2rem] active:scale-95 transition-all">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-white/5" style={{ color: themeColor }}>
          <Icon size={20} />
        </div>
        <div className="text-left">
          <p className="text-sm font-bold text-white">{label}</p>
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{sub}</p>
        </div>
      </div>
      <ChevronRight size={18} className="text-zinc-700" />
    </button>
  );

  if (view === "themes") return (
    <div className="space-y-6">
      <button onClick={() => setView("menu")} className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-4">← Voltar</button>
      <h2 className="text-2xl font-black">Escolher Tema</h2>
      <div className="grid grid-cols-1 gap-3">
        {themes.map(t => (
          <button key={t.hex} onClick={() => setThemeColor(t.hex)} className="p-5 rounded-[2rem] flex items-center justify-between border border-white/5" style={{ backgroundColor: t.hex + '10' }}>
            <span className="font-bold" style={{ color: t.hex }}>{t.name}</span>
            <div className="w-6 h-6 rounded-full" style={{ backgroundColor: t.hex }} />
          </button>
        ))}
      </div>
    </div>
  );

  if (view === "about") return (
    <div className="space-y-6">
      <button onClick={() => setView("menu")} className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-4">← Voltar</button>
      <div className="musi-card p-8 text-center space-y-4">
        <div className="w-20 h-20 bg-zinc-800 rounded-[2.5rem] mx-auto flex items-center justify-center border-2" style={{ borderColor: themeColor }}>
          <span className="text-3xl font-black italic">X</span>
        </div>
        <h2 className="text-2xl font-black">Xalanify</h2>
        <p className="text-sm text-zinc-400">Criado com paixão por <span className="text-white font-bold">Xalana</span>.</p>
        <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Version 0.13.0 (BETA)</p>
      </div>
    </div>
  );

  if (view === "history") return (
    <div className="space-y-6">
      <button onClick={() => setView("menu")} className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-4">← Voltar</button>
      <div className="space-y-4">
        <div className="p-6 bg-zinc-900 rounded-[2.5rem] border border-white/10">
          <h3 className="font-black text-blue-500 mb-2">v0.13.0 (ATUAL)</h3>
          <ul className="text-[11px] text-zinc-400 space-y-2">
            <li>• Motor de áudio YouTube integrado.</li>
            <li>• Personalização de cores do tema.</li>
            <li>• Badge BETA e Pop-up de boas vindas.</li>
          </ul>
        </div>
        <div className="p-6 bg-transparent border border-white/5 opacity-50 rounded-[2.5rem]">
          <h3 className="font-black mb-2">v0.12.0</h3>
          <p className="text-[11px]">Fundação do sistema de pesquisa e biblioteca.</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-40">
      <h1 className="text-3xl font-black px-2">Definições</h1>
      
      <div className="space-y-3">
        <MenuButton icon={User} label="Perfil" sub={user || "Utilizador"} onClick={() => {
          const n = prompt("Novo nome:"); if(n) login(n);
        }} />
        <MenuButton icon={Palette} label="Tema Visual" sub="Cores da Interface" onClick={() => setView("themes")} />
        <MenuButton icon={Info} label="Sobre o Xalanify" sub="Créditos e Info" onClick={() => setView("about")} />
        <MenuButton icon={History} label="Atualizações" sub="Ver o que mudou" onClick={() => setView("history")} />
        
        <div className="grid grid-cols-2 gap-3 mt-6">
          <button onClick={() => window.location.reload()} className="p-5 bg-zinc-900/30 rounded-[2rem] border border-white/5 flex flex-col items-center gap-2">
            <RefreshCw size={20} className="text-zinc-500" />
            <span className="text-[10px] font-black uppercase tracking-widest">Refresh</span>
          </button>
          <button onClick={() => { localStorage.clear(); window.location.href = "/login"; }} className="p-5 bg-red-500/10 rounded-[2rem] border border-red-500/10 flex flex-col items-center gap-2">
            <LogOut size={20} className="text-red-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Sair</span>
          </button>
        </div>
      </div>
    </div>
  );
}