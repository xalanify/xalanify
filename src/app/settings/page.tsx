"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { Shield, Palette, Layout } from "lucide-react";

export default function SettingsPage() {
  const { themeColor, setThemeColor, isAdmin, showDebug, setShowDebug } = useXalanify();

  const colors = ["#a855f7", "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#ec4899", "#ffffff"];

  return (
    <div className="p-8">
      <h1 className="text-5xl font-black italic tracking-tighter mb-10">Definições</h1>

      <div className="space-y-8">
        <section>
          <div className="flex items-center gap-3 mb-6 opacity-40">
            <Palette size={20} />
            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Cores do Sistema</p>
          </div>
          <div className="flex flex-wrap gap-4">
            {colors.map(c => (
              <button 
                key={c}
                onClick={() => setThemeColor(c)}
                className={`w-12 h-12 rounded-2xl transition-all ${themeColor === c ? 'scale-110 border-4 border-white' : 'opacity-40 hover:opacity-100'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </section>

        {isAdmin && (
          <section className="glass p-6 rounded-[2.5rem] border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-red-500">
                <Shield size={20} />
                <p className="text-xs font-black italic">Modo Desenvolvedor</p>
              </div>
              <button 
                onClick={() => setShowDebug(!showDebug)}
                className={`w-12 h-6 rounded-full transition-all relative ${showDebug ? 'bg-red-500' : 'bg-zinc-800'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${showDebug ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}