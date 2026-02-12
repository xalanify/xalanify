"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { useState } from "react";
import { User, Check, Edit2, Palette, ShieldAlert, Trash2, Cpu } from "lucide-react";

export default function Settings() {
  const { user, login, themeColor, setThemeColor, isAdmin, audioEngine, setAudioEngine } = useXalanify();
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

      {/* 1. EDITAR PERFIL */}
      <section className="space-y-2">
        <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest px-2">Perfil</p>
        <div className="p-6 bg-zinc-900/60 border border-white/5 rounded-[2.5rem] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white/5 text-zinc-400">
              <User size={24} />
            </div>
            {isEditing ? (
              <input 
                value={tempName} onChange={(e) => setTempName(e.target.value)}
                className="bg-transparent border-b border-white/20 text-xl font-black outline-none w-40"
                autoFocus
              />
            ) : (
              <div>
                <p className="text-xs text-zinc-500 font-bold">Nome de Utilizador</p>
                <p className="text-xl font-black truncate max-w-[150px]">{user}</p>
              </div>
            )}
          </div>
          <button 
            onClick={() => isEditing ? saveName() : setIsEditing(true)}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10"
            style={{ color: themeColor }}
          >
            {isEditing ? <Check size={20}/> : <Edit2 size={18}/>}
          </button>
        </div>
      </section>

      {/* 2. MUDAR COR DO TEMA */}
      <section className="space-y-2">
        <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest px-2">Aparência</p>
        <div className="p-6 bg-zinc-900/60 border border-white/5 rounded-[2.5rem] space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Palette size={16} className="text-zinc-500"/>
            <span className="font-bold text-sm">Cor Principal</span>
          </div>
          <div className="flex justify-between items-center">
            {colors.map(c => (
              <button 
                key={c} 
                onClick={() => setThemeColor(c)} 
                className={`w-8 h-8 rounded-full transition-all ${themeColor === c ? 'scale-125 ring-2 ring-white' : 'opacity-50 hover:opacity-100'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 3. MOTOR DE ÁUDIO */}
      <section className="space-y-2">
        <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest px-2">Sistema</p>
        <button onClick={() => setAudioEngine(audioEngine === 'youtube' ? 'direct' : 'youtube')} className="w-full flex items-center justify-between p-6 bg-zinc-900/60 border border-white/5 rounded-[2.5rem]">
          <div className="flex items-center gap-4">
            <Cpu size={20} className="text-zinc-500"/>
            <span className="font-bold">Motor de Áudio</span>
          </div>
          <span className="text-[10px] font-black uppercase px-3 py-1 rounded-full bg-white/5" style={{ color: themeColor }}>
            {audioEngine}
          </span>
        </button>
      </section>

      {/* 4. ADMIN AREA (SÓ PARA @ADMIN1) */}
      {isAdmin && (
        <section className="mt-10 p-6 bg-red-900/10 border border-red-500/20 rounded-[2.5rem] space-y-4">
          <div className="flex items-center justify-center gap-2 text-red-500 font-black uppercase text-[10px] tracking-widest">
            <ShieldAlert size={14}/> Área Restrita
          </div>
          <button 
            onClick={() => { localStorage.clear(); window.location.reload(); }} 
            className="w-full py-4 bg-red-500 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2"
          >
            <Trash2 size={16}/> Reset Fábrica Total
          </button>
        </section>
      )}
    </div>
  );
}