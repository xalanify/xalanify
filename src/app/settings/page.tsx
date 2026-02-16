"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { User as UserIcon, Palette, Moon, Sliders, LogOut } from "lucide-react";

export default function SettingsPage() {
  const { user, themeColor, setThemeColor, bgMode, setBgMode, glassIntensity, setGlassIntensity, logout } = useXalanify();

  const colors = ["#a855f7", "#00d2ff", "#ff3b30", "#00ff88", "#ffcc00", "#ffffff", "#ff00ff", "#00ffa3", "#ff6b00"];

  return (
    <div className="p-8 space-y-8 pb-40">
      <h1 className="text-6xl font-black italic tracking-tighter mb-10">Ajustes</h1>

      {/* PERFIL - RESTAURADO */}
      <div className="glass p-8 rounded-[2.5rem] border border-white/5 flex items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border-2" style={{borderColor: themeColor}}>
          <UserIcon size={40} style={{color: themeColor}} />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Conta Ativa</p>
          <p className="font-bold text-lg truncate max-w-[180px]">{user?.email}</p>
          <div className="mt-1 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[9px] font-bold opacity-30 uppercase">Premium Member</span>
          </div>
        </div>
      </div>

      {/* CORES - EXPANDIDO */}
      <div className="glass p-8 rounded-[2.5rem] border border-white/5">
        <div className="flex items-center gap-2 mb-6"><Palette size={16} /> <span className="text-[10px] font-black uppercase">Cores do Sistema</span></div>
        <div className="grid grid-cols-5 gap-4">
          {colors.map(c => (
            <button key={c} onClick={() => setThemeColor(c)} className={`aspect-square rounded-2xl transition-all ${themeColor === c ? 'scale-110 ring-4 ring-white/10' : 'opacity-40 hover:opacity-100'}`} style={{backgroundColor: c}} />
          ))}
        </div>
      </div>

      {/* CUSTOMIZAÇÃO DE VIDRO */}
      <div className="glass p-8 rounded-[2.5rem] border border-white/5">
        <div className="flex items-center gap-2 mb-6"><Sliders size={16} /> <span className="text-[10px] font-black uppercase">Efeito Vidro ({glassIntensity}px)</span></div>
        <input type="range" min="0" max="60" value={glassIntensity} onChange={(e) => setGlassIntensity(Number(e.target.value))} className="w-full h-1 bg-white/10 rounded-full appearance-none outline-none" style={{accentColor: themeColor}} />
      </div>

      {/* MODO DE FUNDO */}
      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => setBgMode('vivid')} className={`glass p-6 rounded-[2rem] flex flex-col items-center gap-2 ${bgMode === 'vivid' ? 'bg-white/10' : 'opacity-40'}`}>
          <Moon size={20} style={{color: themeColor}} /> <span className="text-[9px] font-bold">VIVID</span>
        </button>
        <button onClick={() => setBgMode('pure')} className={`glass p-6 rounded-[2rem] flex flex-col items-center gap-2 ${bgMode === 'pure' ? 'bg-white/10' : 'opacity-40'}`}>
          <div className="w-5 h-5 bg-black border border-white/20 rounded-full" /> <span className="text-[9px] font-bold">PURE DARK</span>
        </button>
      </div>

      <button onClick={logout} className="w-full glass p-6 rounded-[2.5rem] text-red-500 font-black text-xs tracking-widest hover:bg-red-500/5 transition-colors">TERMINAR SESSÃO</button>
    </div>
  );
}