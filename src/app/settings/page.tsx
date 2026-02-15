"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { useState } from "react";
import { User as UserIcon, Palette, ShieldAlert, Trash2, Cpu, LogOut, Mail } from "lucide-react";

export default function Settings() {
  const { 
    user, 
    logout, 
    themeColor, 
    setThemeColor, 
    isAdmin, 
    audioEngine, 
    setAudioEngine 
  } = useXalanify();

  const colors = ["#a855f7", "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#ec4899", "#ffffff"];

  return (
    <div className="p-6 space-y-8 animate-in fade-in">
      <h1 className="text-4xl font-black italic">Definições</h1>

      {/* 1. PERFIL DO UTILIZADOR (SUPABASE) */}
      <section className="space-y-2">
        <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest px-2">Conta</p>
        <div className="p-6 bg-zinc-900/60 border border-white/5 rounded-[2.5rem] flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 truncate">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center flex-shrink-0">
              <UserIcon size={24} className="text-zinc-400" />
            </div>
            <div className="truncate">
              <p className="text-sm font-bold truncate">
                {user ? user.email : "Visitante"}
              </p>
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-tighter">
                {user ? "Utilizador Autenticado" : "Sem sessão iniciada"}
              </p>
            </div>
          </div>
          
          {user && (
            <button 
              onClick={logout}
              className="p-3 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500/20 transition-colors"
              title="Sair"
            >
              <LogOut size={20} />
            </button>
          )}
        </div>
      </section>

      {/* 2. APARÊNCIA */}
      <section className="space-y-2">
        <p className="text-[10px] font-black uppercase text-zinc-500 px-2 tracking-widest">Aparência</p>
        <div className="p-6 bg-zinc-900/60 border border-white/5 rounded-[2.5rem] space-y-4">
          <div className="flex items-center gap-2">
            <Palette size={16} className="text-zinc-500"/>
            <span className="font-bold text-sm">Cor do Tema</span>
          </div>
          <div className="flex justify-between items-center bg-black/20 p-2 rounded-full px-4">
            {colors.map(c => (
              <button 
                key={c} 
                onClick={() => setThemeColor(c)} 
                className={`w-7 h-7 rounded-full transition-all ${themeColor === c ? 'scale-125 ring-2 ring-white shadow-lg' : 'opacity-40 hover:opacity-100'}`} 
                style={{ backgroundColor: c }} 
              />
            ))}
          </div>
        </div>
      </section>

      {/* 3. MOTOR DE ÁUDIO */}
      <section className="space-y-2">
        <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest px-2">Sistema</p>
        <button 
          onClick={() => setAudioEngine(audioEngine === 'youtube' ? 'direct' : 'youtube')} 
          className="w-full flex items-center justify-between p-6 bg-zinc-900/60 border border-white/5 rounded-[2.5rem] hover:bg-zinc-900/80 transition-all"
        >
          <div className="flex items-center gap-4">
            <Cpu size={20} className="text-zinc-500"/>
            <span className="font-bold text-sm">Motor de Áudio</span>
          </div>
          <span className="text-[9px] font-black uppercase px-3 py-1 rounded-full bg-white/5 border border-white/10" style={{ color: themeColor }}>
            {audioEngine}
          </span>
        </button>
      </section>

      {/* 4. ADMIN AREA */}
      {isAdmin && (
        <section className="mt-10 p-6 bg-red-900/10 border border-red-500/20 rounded-[2.5rem] space-y-4">
          <div className="flex items-center justify-center gap-2 text-red-500 font-black uppercase text-[10px] tracking-widest">
            <ShieldAlert size={14}/> Área de Programador
          </div>
          <button 
            onClick={() => { localStorage.clear(); window.location.reload(); }}
            className="w-full py-4 bg-red-500/20 text-red-500 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-red-500/30 transition-all"
          >
            <Trash2 size={14}/> Limpar Cache Local
          </button>
        </section>
      )}
    </div>
  );
}