"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { useState } from "react";
import { User, Check, Edit2, Palette, ShieldAlert, Trash2 } from "lucide-react"; // CORRIGIDO

export default function Settings() {
  const { user, login, themeColor, setThemeColor, isAdmin } = useXalanify();
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(user);

  const colors = ["#a855f7", "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#ec4899", "#ffffff"];

  const saveName = () => {
    login(tempName);
    setIsEditing(false);
  };

  return (
    <div className="p-6 space-y-8 animate-in fade-in">
      <h1 className="text-4xl font-black italic">Definições</h1>

      <section className="space-y-2">
        <p className="text-[10px] font-black uppercase text-zinc-500 px-2 tracking-widest">Perfil</p>
        <div className="p-6 bg-zinc-900/60 border border-white/5 rounded-[2.5rem] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-zinc-400"><User size={24}/></div>
            {isEditing ? (
              <input value={tempName} onChange={(e) => setTempName(e.target.value)} className="bg-transparent border-b border-white/20 text-xl font-black outline-none w-40" autoFocus />
            ) : (
              <div>
                <p className="text-xs text-zinc-500 font-bold">Nome de Utilizador</p>
                <p className="text-xl font-black">{user}</p>
              </div>
            )}
          </div>
          <button onClick={() => isEditing ? saveName() : setIsEditing(true)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center" style={{ color: themeColor }}>
            {isEditing ? <Check size={20}/> : <Edit2 size={18}/>}
          </button>
        </div>
      </section>

      <section className="space-y-2">
        <p className="text-[10px] font-black uppercase text-zinc-500 px-2 tracking-widest">Aparência</p>
        <div className="p-6 bg-zinc-900/60 border border-white/5 rounded-[2.5rem] space-y-4">
          <div className="flex items-center gap-2"><Palette size={16} className="text-zinc-500"/><span className="font-bold text-sm">Cor do Tema</span></div>
          <div className="flex justify-between">
            {colors.map(c => (
              <button key={c} onClick={() => setThemeColor(c)} className={`w-8 h-8 rounded-full transition-all ${themeColor === c ? 'scale-125 ring-2 ring-white' : 'opacity-40 hover:opacity-100'}`} style={{ backgroundColor: c }} />
            ))}
          </div>
        </div>
      </section>

      {isAdmin && (
        <section className="mt-10 p-6 bg-red-900/10 border border-red-500/20 rounded-[2.5rem] space-y-4">
          <div className="flex items-center justify-center gap-2 text-red-500 font-black uppercase text-[10px] tracking-widest"><ShieldAlert size={14}/> Área de Administração</div>
          <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="w-full py-4 bg-red-500 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2"><Trash2 size={16}/> Limpar Dados e Sair</button>
        </section>
      )}
    </div>
  );
}