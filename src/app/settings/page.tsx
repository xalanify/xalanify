"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { User, Palette, Info, LogOut, RefreshCw, History, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function Settings() {
  const { user, themeColor, setThemeColor, login } = useXalanify();
  const [view, setView] = useState("menu");

  const changelog = [
  {
    version: "0.17.0 (Atual)",
    status: "latest",
    logs: [
      { type: "fixed", text: "Vinculação automática Spotify -> YouTube ID (O áudio agora funciona!)." },
      { type: "added", text: "Loader de carregamento ao clicar numa música." }
    ]
  },
  {
    version: "0.16.0",
    status: "old",
    logs: [
      { type: "fixed", text: "Refatoração do extrator de ID e correção de tipos." }
    ]
  },
  { version: "0.15.0", status: "old", logs: [{ type: "fixed", text: "Forçada saída de áudio." }] },
  { version: "0.14.0", status: "old", logs: [{ type: "added", text: "Página Sobre e Créditos Xalana." }] },
  { version: "0.13.0", status: "old", logs: [{ type: "added", text: "Sistema de Temas e BETA." }] },
  { version: "0.12.0", status: "old", logs: [{ type: "added", text: "Interface Musi Base." }] }
];
  const MenuButton = ({ icon: Icon, label, sub, onClick }: any) => (
    <button onClick={onClick} className="w-full flex items-center justify-between p-5 bg-zinc-900/50 border border-white/5 rounded-[2rem] active:scale-95 transition-all mb-3 text-left">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-white/5" style={{ color: themeColor }}><Icon size={20} /></div>
        <div>
          <p className="text-sm font-bold text-white">{label}</p>
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{sub}</p>
        </div>
      </div>
      <ChevronRight size={18} className="text-zinc-700" />
    </button>
  );

  if (view === "history") return (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      <button onClick={() => setView("menu")} className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">← Voltar</button>
      <h2 className="text-2xl font-black px-2">Histórico Completo</h2>
      <div className="space-y-4">
        {changelog.map(rev => (
          <div key={rev.version} className={`p-6 rounded-[2rem] border ${rev.status === 'latest' ? 'bg-zinc-900 border-white/10' : 'opacity-40 border-white/5 bg-transparent'}`}>
            <h3 className="font-black text-sm mb-3" style={{ color: rev.status === 'latest' ? themeColor : 'white' }}>v{rev.version}</h3>
            <div className="space-y-2">
              {rev.logs.map((l, i) => (
                <p key={i} className="text-[11px] text-zinc-400"><span className="font-bold text-[8px] mr-2 uppercase">[{l.type}]</span> {l.text}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (view === "about") return (
    <div className="space-y-6 text-center animate-in zoom-in-95 duration-300">
      <button onClick={() => setView("menu")} className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block w-full text-left">← Voltar</button>
      <div className="py-12 bg-zinc-900 rounded-[3rem] border border-white/10 mx-1">
        <div className="w-20 h-20 bg-black rounded-[2rem] mx-auto mb-4 flex items-center justify-center border-2 shadow-2xl" style={{ borderColor: themeColor }}>
           <span className="text-3xl font-black italic">X</span>
        </div>
        <h2 className="text-2xl font-black italic">Xalanify</h2>
        <p className="text-zinc-400 text-sm mt-2">Criado por <span className="text-white font-bold">Xalana</span></p>
        <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.3em] mt-6">Version 0.16.0 Stable</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-40">
      <h1 className="text-3xl font-black px-2">Definições</h1>
      <MenuButton icon={User} label="Perfil" sub={user || "Utilizador"} onClick={() => {
        const n = prompt("Novo nome:"); if(n) login(n);
      }} />
      <MenuButton icon={Palette} label="Personalizar" sub="Mudar Cor" onClick={() => {
        const cores = ["#a855f7", "#3b82f6", "#f43f5e", "#22c55e", "#f97316"];
        setThemeColor(cores[(cores.indexOf(themeColor) + 1) % cores.length]);
      }} />
      <MenuButton icon={History} label="Histórico" sub="Ver atualizações" onClick={() => setView("history")} />
      <MenuButton icon={Info} label="Sobre" sub="Créditos Xalana" onClick={() => setView("about")} />
      
      <div className="grid grid-cols-2 gap-3 mt-4">
        <button onClick={() => window.location.reload()} className="p-5 bg-zinc-900/30 rounded-[2rem] border border-white/5 flex flex-col items-center gap-2">
          <RefreshCw size={20} className="text-zinc-500" />
          <span className="text-[9px] font-black uppercase tracking-widest">Refresh</span>
        </button>
        <button onClick={() => { localStorage.clear(); window.location.href="/"; }} className="p-5 bg-red-500/10 rounded-[2rem] border border-red-500/10 flex flex-col items-center gap-2 text-red-500">
          <LogOut size={20} />
          <span className="text-[9px] font-black uppercase tracking-widest">Sair</span>
        </button>
      </div>
    </div>
  );
}