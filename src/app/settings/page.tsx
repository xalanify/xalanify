"use client";
import { useState } from "react";
import { useXalanify } from "@/context/XalanifyContext";
import { 
  Shield, LogOut, Palette, ChevronRight, 
  User as UserIcon, Moon, Sun, Sparkles, Layout
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function SettingsPage() {
  const { 
    user, themeColor, setThemeColor, bgMode, setBgMode, 
    isAdmin, setIsAdmin, logs, perfMetrics 
  } = useXalanify();

  const [activeSection, setActiveSection] = useState<string | null>(null);

  const toggleSection = (id: string) => setActiveSection(activeSection === id ? null : id);

  return (
    <div className="p-8 pb-40 animate-app-entry max-w-2xl mx-auto w-full">
      <h1 className="text-6xl font-black italic mb-12 tracking-tighter">Settings</h1>

      <div className="space-y-4">
        
        {/* SECÇÃO PERFIL */}
        <div className="glass rounded-[2.5rem] overflow-hidden border-white/5">
          <button onClick={() => toggleSection('profile')} className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                <UserIcon size={20} />
              </div>
              <div className="text-left">
                <p className="font-black italic tracking-tight">O Teu Perfil</p>
                <p className="text-[10px] opacity-40 uppercase font-bold">{user?.email}</p>
              </div>
            </div>
            <ChevronRight className={`transition-transform ${activeSection === 'profile' ? 'rotate-90' : ''}`} />
          </button>
          
          {activeSection === 'profile' && (
            <div className="p-6 pt-0 border-t border-white/5 animate-in slide-in-from-top-2">
              <div className="bg-white/5 rounded-3xl p-6 mt-4">
                <p className="text-[10px] font-black uppercase opacity-20 mb-4">Estatísticas da Conta</p>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div><p className="text-2xl font-black italic">Free</p><p className="text-[8px] opacity-40 uppercase">Plano</p></div>
                  <div><p className="text-2xl font-black italic">ID</p><p className="text-[8px] opacity-40 uppercase">#{user?.id.slice(0,5)}</p></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECÇÃO PERSONALIZAÇÃO */}
        <div className="glass rounded-[2.5rem] overflow-hidden border-white/5">
          <button onClick={() => toggleSection('ui')} className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center" style={{color: themeColor}}>
                <Palette size={20} />
              </div>
              <p className="font-black italic tracking-tight">Personalização</p>
            </div>
            <ChevronRight className={`transition-transform ${activeSection === 'ui' ? 'rotate-90' : ''}`} />
          </button>

          {activeSection === 'ui' && (
            <div className="p-6 pt-0 border-t border-white/5 space-y-8 animate-in slide-in-from-top-2">
              {/* Cores */}
              <div className="mt-6">
                <p className="text-[10px] font-black uppercase opacity-20 mb-4 ml-2 italic">Cor de Destaque</p>
                <div className="flex justify-between bg-black/20 p-4 rounded-3xl">
                  {["#a855f7", "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#ffffff"].map(color => (
                    <button key={color} onClick={() => setThemeColor(color)} className="w-8 h-8 rounded-full border-2 transition-transform active:scale-75"
                      style={{ backgroundColor: color, borderColor: themeColor === color ? 'white' : 'transparent' }} />
                  ))}
                </div>
              </div>

              {/* Modos de Fundo */}
              <div>
                <p className="text-[10px] font-black uppercase opacity-20 mb-4 ml-2 italic">Estilo Visual</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {id: 'vivid', label: 'Vivid Glow', icon: Sun},
                    {id: 'pure', label: 'Pure Dark', icon: Moon},
                    {id: 'gradient', label: 'Soft Gradient', icon: Layout},
                    {id: 'animated', label: 'Animated', icon: Sparkles},
                  ].map((m) => (
                    <button key={m.id} onClick={() => setBgMode(m.id as any)}
                      className={`p-4 rounded-3xl flex items-center gap-3 border transition-all ${bgMode === m.id ? 'bg-white text-black border-white' : 'bg-white/5 border-white/5 opacity-50'}`}>
                      <m.icon size={16} />
                      <span className="text-[10px] font-black uppercase">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MODO PROGRAMADOR (Apenas se for Admin) */}
        {isAdmin && (
          <div className="glass rounded-[2.5rem] overflow-hidden border-purple-500/20">
            <button onClick={() => toggleSection('dev')} className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-4 text-purple-400">
                <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Shield size={20} />
                </div>
                <p className="font-black italic tracking-tight">Developer Tools</p>
              </div>
              <ChevronRight className={`transition-transform ${activeSection === 'dev' ? 'rotate-90' : ''}`} />
            </button>
            {activeSection === 'dev' && (
              <div className="p-6 pt-0 border-t border-white/5 animate-in fade-in">
                <div className="grid grid-cols-2 gap-3 mb-4 mt-4">
                  <div className="bg-white/5 p-4 rounded-2xl"><p className="text-[8px] opacity-40 font-bold mb-1 uppercase">Memory</p><p className="font-mono text-xs">{perfMetrics.memory}</p></div>
                  <div className="bg-white/5 p-4 rounded-2xl"><p className="text-[8px] opacity-40 font-bold mb-1 uppercase">Ping</p><p className="font-mono text-xs">{perfMetrics.latency}ms</p></div>
                </div>
                <div className="bg-black/60 p-4 rounded-3xl max-h-40 overflow-y-auto custom-scroll font-mono text-[9px] opacity-60">
                  {logs.map((l, i) => <p key={i} className="mb-1">{l}</p>)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* LOGOUT */}
        <button 
          onClick={() => supabase.auth.signOut()}
          className="w-full p-8 glass rounded-[2.5rem] border-red-500/10 text-red-500 font-black italic flex items-center justify-center gap-3 hover:bg-red-500/5 transition-all active:scale-95"
        >
          <LogOut size={20} /> Terminar Sessão
        </button>

        {/* SECÇÃO SECRETA PARA ATIVAR ADMIN */}
        <div className="pt-20 opacity-0 hover:opacity-10 transition-opacity flex justify-center">
            <button onClick={() => setIsAdmin(!isAdmin)} className="text-[8px] uppercase tracking-[0.5em]">Secret Access</button>
        </div>
      </div>
    </div>
  );
}