"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { 
  Shield, 
  Palette, 
  Layout, 
  Check, 
  Smartphone, 
  Moon, 
  Sun, 
  Zap,
  Layers
} from "lucide-react";

export default function SettingsPage() {
  const { 
    themeColor, 
    setThemeColor, 
    isAdmin, 
    showDebug, 
    setShowDebug, 
    bgMode, 
    setBgMode 
  } = useXalanify();

  const colors = [
    "#a855f7", // Purple (Original)
    "#3b82f6", // Blue
    "#10b981", // Emerald
    "#f59e0b", // Amber
    "#ef4444", // Red
    "#ec4899", // Pink
    "#06b6d4", // Cyan
    "#ffffff"  // White
  ];

  const modes: { id: 'vivid' | 'pure' | 'gradient', label: string, icon: any }[] = [
    { id: 'vivid', label: 'Vivid Glass', icon: <Layers size={18} /> },
    { id: 'pure', label: 'Pure Black', icon: <Moon size={18} /> },
    { id: 'gradient', label: 'Deep Gradient', icon: <Zap size={18} /> }
  ];

  return (
    <div className="p-8 pb-40 animate-in fade-in duration-500">
      <h1 className="text-6xl font-black italic tracking-tighter mb-12">Settings</h1>

      <div className="space-y-12">
        
        {/* SECÇÃO DE CORES (ACCENT) */}
        <section>
          <div className="flex items-center gap-3 mb-8 opacity-40">
            <Palette size={20} />
            <p className="text-[10px] font-black uppercase tracking-[0.3em]">System Accent</p>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {colors.map(c => (
              <button 
                key={c} 
                onClick={() => setThemeColor(c)} 
                className={`aspect-square rounded-[2.2rem] flex items-center justify-center transition-all duration-300 active:scale-75 ${
                  themeColor === c ? 'scale-110 shadow-2xl ring-4 ring-white/20' : 'opacity-40 hover:opacity-100'
                }`} 
                style={{ backgroundColor: c }}
              >
                {themeColor === c && (
                  <Check size={24} color={c === "#ffffff" ? "black" : "white"} strokeWidth={4} />
                )}
              </button>
            ))}
          </div>
        </section>

        {/* SECÇÃO DE ESTILO DE TEMA */}
        <section>
          <div className="flex items-center gap-3 mb-8 opacity-40">
            <Layout size={20} />
            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Environment Appearance</p>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {modes.map(m => (
              <button 
                key={m.id} 
                onClick={() => setBgMode(m.id)} 
                className={`w-full p-6 rounded-[2.5rem] glass flex items-center justify-between border transition-all duration-300 ${
                  bgMode === m.id 
                    ? 'bg-white/10 border-white/20 shadow-xl' 
                    : 'border-white/5 opacity-40 hover:opacity-100'
                }`}
                style={{ borderColor: bgMode === m.id ? themeColor : 'rgba(255,255,255,0.05)' }}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-white/5" style={{ color: bgMode === m.id ? themeColor : 'white' }}>
                    {m.icon}
                  </div>
                  <span className="font-bold italic text-lg">{m.label}</span>
                </div>
                {bgMode === m.id && (
                  <div className="w-4 h-4 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]" style={{ backgroundColor: themeColor }} />
                )}
              </button>
            ))}
          </div>
        </section>

        {/* SECÇÃO ADMIN / DEBUG */}
        {isAdmin && (
          <section className="mt-12">
            <div className="p-8 rounded-[3rem] border bg-red-500/5 transition-all"
                 style={{ borderColor: showDebug ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255,255,255,0.05)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-red-500">
                  <div className="p-4 bg-red-500/10 rounded-3xl">
                    <Shield size={28} />
                  </div>
                  <div>
                    <p className="font-black italic text-xl tracking-tight">X-Engine Debug</p>
                    <p className="text-[10px] opacity-60 uppercase font-black tracking-widest">Developer Oversight</p>
                  </div>
                </div>
                
                {/* Switch Estilo iOS */}
                <button 
                  onClick={() => setShowDebug(!showDebug)} 
                  className={`w-16 h-9 rounded-full relative transition-all duration-300 ${
                    showDebug ? 'bg-red-500' : 'bg-zinc-800'
                  }`}
                >
                  <div className={`absolute top-1.5 w-6 h-6 rounded-full bg-white shadow-lg transition-all duration-300 ${
                    showDebug ? 'right-1.5' : 'left-1.5'
                  }`} />
                </button>
              </div>
              
              {showDebug && (
                <div className="mt-6 p-4 rounded-2xl bg-black/40 border border-red-500/10 animate-in slide-in-from-top-2">
                  <p className="text-[9px] font-mono text-red-400 leading-relaxed uppercase">
                    Ao ativar esta opção, uma consola de telemetria será exibida no canto superior esquerdo para monitorizar RAM, Latência e Logs do Supabase em tempo real.
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* INFO DO DISPOSITIVO (ESTILO iOS) */}
        <div className="pt-10 flex flex-col items-center opacity-20">
          <Smartphone size={24} className="mb-2" />
          <p className="text-[9px] font-black uppercase tracking-[0.4em]">Xalanify v2.4.0 Platinum</p>
          <p className="text-[8px] font-mono mt-1">Engine: Titanium-Next-14</p>
        </div>

      </div>
    </div>
  );
}