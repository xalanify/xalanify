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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="p-8 pb-40 animate-app-entry max-w-2xl mx-auto w-full">
      <h1 className="text-6xl font-extrabold mb-12 tracking-tighter">Settings</h1>

      <div className="space-y-4">
        {/* PERFIL */}
        <div className="glass rounded-[2rem] overflow-hidden border-white/5">
          <button onClick={() => setActiveSection(activeSection === 'profile' ? null : 'profile')} className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                <UserIcon size={20} />
              </div>
              <div className="text-left">
                <p className="font-bold tracking-tight text-lg">O Teu Perfil</p>
                <p className="text-[10px] opacity-40 uppercase font-black tracking-widest">{user?.email}</p>
              </div>
            </div>
            <ChevronRight className={`transition-transform duration-300 ${activeSection === 'profile' ? 'rotate-90' : ''}`} />
          </button>
          
          {activeSection === 'profile' && (
            <div className="p-6 pt-0 border-t border-white/5 animate-in slide-in-from-top-2">
              <div className="bg-white/5 rounded-[2rem] p-6 mt-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div><p className="text-2xl font-black">Free</p><p className="text-[8px] opacity-40 uppercase font-bold tracking-widest">Plano</p></div>
                  <div><p className="text-2xl font-black">#{user?.id.slice(0,5)}</p><p className="text-[8px] opacity-40 uppercase font-bold tracking-widest">User ID</p></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* PERSONALIZAÇÃO */}
        <div className="glass rounded-[2rem] overflow-hidden border-white/5">
          <button onClick={() => setActiveSection(activeSection === 'ui' ? null : 'ui')} className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center" style={{color: themeColor}}>
                <Palette size={20} />
              </div>
              <p className="font-bold tracking-tight text-lg">Personalização</p>
            </div>
            <ChevronRight className={`transition-transform duration-300 ${activeSection === 'ui' ? 'rotate-90' : ''}`} />
          </button>

          {activeSection === 'ui' && (
            <div className="p-6 pt-0 border-t border-white/5 space-y-8 animate-in slide-in-from-top-2">
              <div className="mt-6">
                <p className="text-[10px] font-black uppercase opacity-20 mb-4 ml-2 tracking-[0.2em]">Cor de Destaque</p>
                <div className="flex justify-between bg-black/20 p-4 rounded-[2rem]">
                  {["#a855f7", "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#ffffff"].map(color => (
                    <button key={color} onClick={() => setThemeColor(color)} className="w-8 h-8 rounded-full border-2 transition-all active:scale-75"
                      style={{ backgroundColor: color, borderColor: themeColor === color ? 'white' : 'transparent' }} />
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-black uppercase opacity-20 mb-4 ml-2 tracking-[0.2em]">Estilo Visual</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {id: 'vivid', label: 'Vivid Glow', icon: Sun},
                    {id: 'pure', label: 'Pure Dark', icon: Moon},
                    {id: 'gradient', label: 'Soft Gradient', icon: Layout},
                    {id: 'animated', label: 'Animated', icon: Sparkles},
                  ].map((m) => (
                    <button key={m.id} onClick={() => setBgMode(m.id as any)}
                      className={`p-4 rounded-[1.5rem] flex items-center gap-3 border transition-all ${bgMode === m.id ? 'bg-white text-black border-white' : 'bg-white/5 border-white/5 opacity-50'}`}>
                      <m.icon size={16} />
                      <span className="text-[10px] font-black uppercase tracking-tight">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MODO PROGRAMADOR (Apenas Admin) */}
        {isAdmin && (
          <div className="glass rounded-[2rem] overflow-hidden border-purple-500/20">
            <button onClick={() => setActiveSection(activeSection === 'dev' ? null : 'dev')} className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-4 text-purple-400">
                <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Shield size={20} />
                </div>
                <p className="font-bold tracking-tight text-lg">Developer Tools</p>
              </div>
              <ChevronRight className={`transition-transform duration-300 ${activeSection === 'dev' ? 'rotate-90' : ''}`} />
            </button>
            {activeSection === 'dev' && (
              <div className="p-6 pt-0 border-t border-white/5 animate-in fade-in">
                <div className="grid grid-cols-2 gap-3 mb-4 mt-4">
                  <div className="bg-white/5 p-4 rounded-2xl"><p className="text-[8px] opacity-40 font-bold mb-1 uppercase tracking-widest">Memory</p><p className="font-mono text-xs">{perfMetrics.memory}</p></div>
                  <div className="bg-white/5 p-4 rounded-2xl"><p className="text-[8px] opacity-40 font-bold mb-1 uppercase tracking-widest">Ping</p><p className="font-mono text-xs">{perfMetrics.latency}ms</p></div>
                </div>
                <div className="bg-black/60 p-4 rounded-[1.5rem] max-h-40 overflow-y-auto custom-scroll font-mono text-[9px] opacity-60">
                  {logs.map((l, i) => <p key={i} className="mb-1">{l}</p>)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* LOGOUT */}
        <button 
          onClick={handleSignOut}
          className="w-full p-8 glass rounded-[2rem] border-red-500/10 text-red-500 font-extrabold flex items-center justify-center gap-3 hover:bg-red-500/5 transition-all active:scale-95"
        >
          <LogOut size={20} /> Terminar Sessão
        </button>

        {/* BOTÃO SECRETO ADMIN */}
        <div className="pt-20 opacity-0 hover:opacity-10 transition-opacity flex justify-center">
            <button onClick={() => setIsAdmin(!isAdmin)} className="text-[8px] uppercase tracking-[0.5em] font-black">Admin Access</button>
        </div>
      </div>
    </div>
  );
}