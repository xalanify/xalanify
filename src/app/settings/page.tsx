"use client";
import { useState } from "react";
import { useXalanify } from "@/context/XalanifyContext";
import { Palette, ChevronRight, Zap, Trash2, Info } from "lucide-react";

export default function SettingsPage() {
  const { themeColor, setThemeColor, bgMode, setBgMode } = useXalanify();
  const [showPersonalize, setShowPersonalize] = useState(false);

  const colors = ["#a855f7", "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#ffffff"];

  return (
    <div className="p-8 pb-40 animate-app-entry">
      <h1 className="text-5xl font-black mb-12 tracking-tighter">Settings</h1>

      <div className="space-y-4">
        {/* Card de Personalização */}
        <div 
          onClick={() => setShowPersonalize(!showPersonalize)}
          className="glass p-6 rounded-[2.5rem] border border-white/5 cursor-pointer hover:bg-white/5 transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: themeColor + '20' }}>
                <Palette size={20} style={{ color: themeColor }} />
              </div>
              <div>
                <p className="font-bold">Personalização</p>
                <p className="text-[10px] opacity-40 uppercase font-black">Cores e Fundos</p>
              </div>
            </div>
            <ChevronRight className={`transition-transform ${showPersonalize ? 'rotate-90' : ''}`} />
          </div>

          {showPersonalize && (
            <div className="mt-8 space-y-8 animate-in slide-in-from-top-4 duration-300">
              <div>
                <p className="text-[10px] font-black uppercase opacity-20 mb-4 tracking-widest">Cores de Destaque</p>
                <div className="flex gap-4">
                  {colors.map(c => (
                    <button key={c} onClick={() => setThemeColor(c)} className="w-10 h-10 rounded-full border-2 transition-all active:scale-90" style={{ backgroundColor: c, borderColor: themeColor === c ? 'white' : 'transparent' }} />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase opacity-20 mb-4 tracking-widest">Modos de Fundo</p>
                <div className="grid grid-cols-2 gap-3">
                  {['vivid', 'pure', 'gradient'].map(m => (
                    <button key={m} onClick={() => setBgMode(m as any)} className="p-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all" style={{ backgroundColor: bgMode === m ? themeColor : 'transparent', borderColor: bgMode === m ? 'white' : 'white/5' }}>{m}</button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Card de Créditos */}
        <div className="glass p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden">
            <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center"><Zap size={24} style={{ color: themeColor }} /></div>
                <div>
                    <p className="text-2xl font-black tracking-tight">Xalanify</p>
                    <p className="text-[10px] font-black uppercase opacity-40 tracking-widest">Criado por: Xalana</p>
                </div>
            </div>
            <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-center text-[10px] font-black opacity-20 uppercase tracking-widest">
                <span>Versão estável</span>
                <span>0.53.3</span>
            </div>
        </div>
      </div>
    </div>
  );
}