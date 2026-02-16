"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { Palette, Moon, Sun, Monitor, Zap, Sparkles, LogOut } from "lucide-react";

export default function Settings() {
  const { 
    themeColor, setThemeColor, bgMode, setBgMode, 
    glassIntensity, setGlassIntensity, logout, user 
  } = useXalanify();

  const colors = ["#a855f7", "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#ec4899"];

  return (
    <div className="p-8 pb-40 animate-slide-up">
      <header className="mb-10">
        <h1 className="text-5xl font-black italic tracking-tighter mb-2">Settings</h1>
        <p className="text-[10px] font-black uppercase tracking-widest opacity-30">Perfil: {user?.email}</p>
      </header>

      <div className="space-y-8">
        {/* Personalização de Cores */}
        <section className="glass p-6 rounded-[2.5rem]">
          <div className="flex items-center gap-3 mb-6">
            <Palette size={18} style={{ color: themeColor }} />
            <h2 className="text-sm font-bold italic">Acento Visual</h2>
          </div>
          <div className="flex justify-between items-center gap-2">
            {colors.map(c => (
              <button
                key={c}
                onClick={() => setThemeColor(c)}
                className="w-10 h-10 rounded-full transition-all active:scale-75 shadow-lg"
                style={{ 
                  backgroundColor: c, 
                  border: themeColor === c ? '3px solid white' : 'none',
                  boxShadow: themeColor === c ? `0 0 15px ${c}` : 'none'
                }}
              />
            ))}
          </div>
        </section>

        {/* Estilo do Background */}
        <section className="glass p-6 rounded-[2.5rem]">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles size={18} style={{ color: themeColor }} />
            <h2 className="text-sm font-bold italic">Atmosfera</h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'vivid', label: 'Vibrante', icon: Zap },
              { id: 'pure', label: 'OLED', icon: Moon },
              { id: 'gradient', label: 'Suave', icon: Sun }
            ].map(mode => (
              <button
                key={mode.id}
                onClick={() => setBgMode(mode.id as any)}
                className={`flex flex-col items-center gap-3 p-4 rounded-3xl transition-all ${bgMode === mode.id ? 'bg-white/10' : 'hover:bg-white/5'}`}
              >
                <mode.icon size={20} className={bgMode === mode.id ? 'opacity-100' : 'opacity-20'} />
                <span className="text-[9px] font-black uppercase tracking-tighter">{mode.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Intensidade do Vidro */}
        <section className="glass p-6 rounded-[2.5rem]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Monitor size={18} style={{ color: themeColor }} />
              <h2 className="text-sm font-bold italic">Opacidade</h2>
            </div>
            <span className="text-xs font-mono opacity-40">{glassIntensity}%</span>
          </div>
          <input 
            type="range" 
            min="10" max="80" 
            value={glassIntensity}
            onChange={(e) => setGlassIntensity(parseInt(e.target.value))}
            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
            style={{ '--thumb-color': themeColor } as any}
          />
        </section>

        {/* Logout Box */}
        <button 
          onClick={logout}
          className="w-full bg-red-500/10 border border-red-500/20 p-6 rounded-[2.5rem] flex items-center justify-center gap-3 text-red-500 hover:bg-red-500/20 transition-all active:scale-95"
        >
          <LogOut size={18} />
          <span className="text-xs font-black uppercase italic">Encerrar Sessão</span>
        </button>
      </div>
    </div>
  );
}