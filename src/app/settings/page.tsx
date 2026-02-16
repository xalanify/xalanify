"use client";
import { useState } from "react";
import { useXalanify } from "@/context/XalanifyContext";
import { Palette, ChevronRight, Zap, LogOut, UserCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function SettingsPage() {
  const { themeColor, setThemeColor, bgMode, setBgMode, user } = useXalanify();
  const [showPersonalize, setShowPersonalize] = useState(false);

  const colors = ["#a855f7", "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#ffffff"];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

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
                <div className="flex-1">
                    <p className="font-black text-xl">{user?.user_metadata?.user_name || user?.email?.split('@')[0]}</p>
                    <p className="text-[10px] opacity-40 font-black uppercase tracking-widest">{user?.email}</p>
                </div>
            </div>
            <button onClick={handleLogout} className="w-full p-4 rounded-2xl bg-white/5 hover:bg-red-500/10 text-red-500 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
              <LogOut size={16} /> Terminar Sessão
            </button>
        </section>

        {/* Personalização - Persistente */}
        <div className="glass p-6 rounded-[2.5rem] border border-white/5">
          <div onClick={() => setShowPersonalize(!showPersonalize)} className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: themeColor + '20' }}>
                <Palette size={20} style={{ color: themeColor }} />
              </div>
              <p className="font-bold text-lg">Personalização</p>
            </div>
            <ChevronRight className={`transition-transform duration-300 ${showPersonalize ? 'rotate-90' : ''}`} />
          </div>

          {showPersonalize && (
            <div className="mt-8 space-y-8 animate-in slide-in-from-top-4">
              <div>
                <p className="text-[10px] font-black uppercase opacity-20 mb-4 tracking-widest">Cores de Destaque</p>
                <div className="flex flex-wrap gap-4">
                  {colors.map(c => (
                    <button 
                      key={c} 
                      onClick={(e) => { e.stopPropagation(); setThemeColor(c); }} 
                      className="w-10 h-10 rounded-full border-2 transition-all active:scale-90" 
                      style={{ backgroundColor: c, borderColor: themeColor === c ? 'white' : 'transparent' }} 
                    />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase opacity-20 mb-4 tracking-widest">Fundo</p>
                <div className="grid grid-cols-2 gap-3">
                  {['vivid', 'pure', 'gradient', 'animated'].map(m => (
                    <button 
                        key={m} 
                        onClick={(e) => { e.stopPropagation(); setBgMode(m as any); }} 
                        className="p-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all" 
                        style={{ 
                            backgroundColor: bgMode === m ? themeColor : 'rgba(255,255,255,0.02)', 
                            borderColor: bgMode === m ? 'white' : 'transparent',
                        }}
                    >
                        {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="glass p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group">
            <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center"><Zap size={24} style={{ color: themeColor }} /></div>
                <div><p className="text-2xl font-black tracking-tight italic">Xalanify</p><p className="text-[10px] font-black uppercase opacity-40">Build 0.53.5</p></div>
            </div>
        </div>
      </div>
    </div>
  );
}