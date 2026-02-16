"use client";
import { useState } from "react";
import { useXalanify } from "@/context/XalanifyContext";
import { Palette, ChevronRight, Zap, LogOut, UserCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function SettingsPage() {
  const { themeColor, setThemeColor, bgMode, setBgMode, user } = useXalanify();
  const [showPersonalize, setShowPersonalize] = useState(false);

  const colors = ["#a855f7", "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#ffffff"];

  return (
    <div className="p-8 pb-40 animate-app-entry font-jakarta">
      <h1 className="text-5xl font-black mb-12 tracking-tighter italic">Definições</h1>

      <div className="space-y-4">
        {/* Perfil */}
        <section className="glass p-6 rounded-[2.5rem] border border-white/5">
            <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                    <UserCircle size={40} className="opacity-20" />
                </div>
                <div className="flex-1 overflow-hidden">
                    <p className="font-black text-xl truncate">{user?.user_metadata?.user_name || "Utilizador"}</p>
                    <p className="text-[10px] opacity-40 font-black uppercase tracking-widest truncate">{user?.email}</p>
                </div>
            </div>
            <button onClick={() => supabase.auth.signOut()} className="w-full p-4 rounded-2xl bg-white/5 text-red-500 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
              <LogOut size={14} /> Terminar Sessão
            </button>
        </section>

        {/* Personalização */}
        <div className="glass p-6 rounded-[2.5rem] border border-white/5">
          <div onClick={() => setShowPersonalize(!showPersonalize)} className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: themeColor + '20' }}>
                <Palette size={18} style={{ color: themeColor }} />
              </div>
              <p className="font-bold">Personalização</p>
            </div>
            <ChevronRight size={18} className={`transition-transform ${showPersonalize ? 'rotate-90' : ''}`} />
          </div>

          {showPersonalize && (
            <div className="mt-8 space-y-8 animate-in slide-in-from-top-4">
              <div className="flex flex-wrap gap-3">
                {colors.map(c => (
                  <button key={c} onClick={() => setThemeColor(c)} className="w-8 h-8 rounded-full border-2" style={{ backgroundColor: c, borderColor: themeColor === c ? 'white' : 'transparent' }} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Créditos Unificados */}
        <div className="glass p-8 rounded-[2.5rem] border border-white/5 flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center"><Zap size={20} style={{ color: themeColor }} /></div>
            <div>
              <p className="text-xl font-black tracking-tight italic">Xalanify</p>
              <p className="text-[9px] font-black uppercase opacity-40 tracking-widest">Build 0.53.9 Stable</p>
            </div>
        </div>
      </div>
    </div>
  );
}