"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { Palette, Box, Zap, Trash2, Github, Info } from "lucide-react";

export default function SettingsPage() {
  const { themeColor, setThemeColor, bgMode, setBgMode, addLog } = useXalanify();

  const colors = ["#a855f7", "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#ffffff"];

  return (
    <div className="p-8 pb-40 animate-app-entry font-jakarta">
      <h1 className="text-5xl font-black mb-12 tracking-tighter">Settings</h1>

      <div className="space-y-8">
        {/* Personalização */}
        <section>
          <div className="flex items-center gap-2 mb-6 opacity-30">
            <Palette size={16} />
            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Personalização</p>
          </div>
          
          <div className="glass p-6 rounded-[2.5rem] border-white/5 space-y-8">
            <div>
              <p className="text-xs font-bold mb-4 opacity-50">Cor de Destaque</p>
              <div className="flex gap-4">
                {colors.map(c => (
                  <button 
                    key={c}
                    onClick={() => setThemeColor(c)}
                    className="w-10 h-10 rounded-full border-2 transition-all active:scale-90"
                    style={{ backgroundColor: c, borderColor: themeColor === c ? 'white' : 'transparent' }}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-bold mb-4 opacity-50">Modo de Fundo</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'vivid', label: 'Vivid Glow' },
                  { id: 'pure', label: 'Pure Black' }
                ].map(m => (
                  <button
                    key={m.id}
                    onClick={() => setBgMode(m.id as any)}
                    className="p-4 rounded-2xl border text-xs font-bold transition-all active:scale-95"
                    style={{ 
                      backgroundColor: bgMode === m.id ? themeColor : 'rgba(255,255,255,0.03)',
                      borderColor: bgMode === m.id ? 'white' : 'transparent',
                      color: bgMode === m.id ? 'white' : 'rgba(255,255,255,0.4)'
                    }}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Card de Créditos - NOVO */}
        <section>
            <div className="glass p-8 rounded-[2.5rem] border-white/5 relative overflow-hidden group">
                <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none" style={{ backgroundColor: themeColor }} />
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center">
                        <Zap size={24} style={{ color: themeColor }} />
                    </div>
                    <div>
                        <p className="text-2xl font-black tracking-tight">Xalanify</p>
                        <p className="text-[10px] font-black uppercase opacity-40 tracking-widest">Criado por: Xalana</p>
                    </div>
                </div>
                <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-center text-[10px] font-black opacity-20 uppercase tracking-[0.2em]">
                    <span>Versão estável</span>
                    <span>0.53.2</span>
                </div>
            </div>
        </section>

        {/* Informações Técnicas */}
        <section>
          <div className="flex items-center gap-2 mb-6 opacity-30">
            <Info size={16} />
            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Sistema</p>
          </div>
          <div className="glass p-6 rounded-[2.5rem] border-white/5">
            <button 
                onClick={() => {
                    localStorage.clear();
                    window.location.reload();
                }}
                className="w-full p-4 rounded-2xl bg-red-500/10 text-red-500 text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
                <Trash2 size={16} /> Limpar Cache e Reiniciar
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}