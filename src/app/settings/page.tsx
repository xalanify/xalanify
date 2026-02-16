"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { Shield, Activity, LogOut, Palette, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function SettingsPage() {
  const { themeColor, setThemeColor, isAdmin, setIsAdmin, logs, perfMetrics } = useXalanify();

  return (
    <div className="p-8 pb-40 animate-app-entry">
      <h1 className="text-5xl font-black italic mb-10 tracking-tighter">Settings</h1>

      <div className="space-y-6">
        {/* Personalização */}
        <div className="glass p-6 rounded-[2.5rem] border-white/5">
          <div className="flex items-center gap-3 mb-6 opacity-40">
            <Palette size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest text-white">Personalização</span>
          </div>
          <div className="flex gap-4">
            {["#a855f7", "#3b82f6", "#ef4444", "#10b981", "#f59e0b"].map(color => (
              <button
                key={color}
                onClick={() => setThemeColor(color)}
                className="w-12 h-12 rounded-full border-2 transition-all flex items-center justify-center"
                style={{ backgroundColor: color, borderColor: themeColor === color ? 'white' : 'transparent' }}
              >
                {themeColor === color && <CheckCircle2 size={16} className="text-white" />}
              </button>
            ))}
          </div>
        </div>

        {/* Zona Admin */}
        <div className="glass p-6 rounded-[2.5rem] border-white/5">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3 opacity-40">
              <Shield size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest text-white">Modo Programador</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={isAdmin} 
                onChange={(e) => setIsAdmin(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          {isAdmin && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
              <div className="grid grid-cols-2 gap-3 text-white">
                <div className="bg-white/5 p-4 rounded-2xl">
                  <p className="text-[8px] uppercase opacity-40 font-bold mb-1">RAM</p>
                  <p className="font-mono text-xs italic">{perfMetrics.memory}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl">
                  <p className="text-[8px] uppercase opacity-40 font-bold mb-1">LATÊNCIA</p>
                  <p className="font-mono text-xs italic">{perfMetrics.latency}ms</p>
                </div>
              </div>
              <div className="bg-black/40 p-4 rounded-3xl max-h-48 overflow-y-auto custom-scroll border border-white/5">
                <p className="text-[8px] uppercase opacity-40 font-bold mb-2 ml-1">Logs do Sistema</p>
                {logs.map((log, i) => (
                  <p key={i} className="text-[10px] font-mono opacity-60 mb-1 border-l-2 border-white/10 pl-3 italic">{log}</p>
                ))}
              </div>
            </div>
          )}
        </div>

        <button 
          onClick={() => supabase.auth.signOut()}
          className="w-full p-6 glass rounded-[2.5rem] border-red-500/10 text-red-500 font-black italic flex items-center justify-center gap-3 hover:bg-red-500/5 transition-all active:scale-95 mt-10"
        >
          <LogOut size={20} /> Terminar Sessão
        </button>
      </div>
    </div>
  );
}