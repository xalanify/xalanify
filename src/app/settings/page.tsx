"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { User as UserIcon, Palette, Shield, LogOut, Trash2, CheckCircle } from "lucide-react";

export default function Settings() {
  const { user, logout, themeColor, setThemeColor, isAdmin } = useXalanify();
  const colors = ["#a855f7", "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#ec4899", "#ffffff"];

  return (
    <div className="p-6 space-y-8 animate-in fade-in pb-40">
      <h1 className="text-4xl font-black italic">Definições</h1>

      {/* ADMIN BADGE */}
      {isAdmin && (
        <div className="p-4 rounded-[2rem] border border-dashed flex items-center gap-3 animate-pulse" style={{ borderColor: themeColor, backgroundColor: `${themeColor}10` }}>
          <Shield size={20} style={{ color: themeColor }} />
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: themeColor }}>Modo Administrador Ativo</p>
            <p className="text-[9px] text-zinc-500 uppercase">Tens acesso a ferramentas de sistema</p>
          </div>
        </div>
      )}

      {/* CONTA */}
      <section className="space-y-4">
        <p className="text-[10px] font-black uppercase text-zinc-500 px-2 tracking-widest">Conta</p>
        <div className="p-6 bg-zinc-900/40 border border-white/5 rounded-[2.5rem] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/5">
              <UserIcon size={24} className="text-zinc-400" />
            </div>
            <div>
              <p className="text-sm font-bold">{user?.email}</p>
              <p className="text-[9px] font-black uppercase text-zinc-600 tracking-tighter">Membro Premium</p>
            </div>
          </div>
          <button onClick={logout} className="p-3 text-red-500 hover:bg-red-500/10 rounded-2xl transition-all">
            <LogOut size={20} />
          </button>
        </div>
      </section>

      {/* PERSONALIZAÇÃO */}
      <section className="space-y-4">
        <p className="text-[10px] font-black uppercase text-zinc-500 px-2 tracking-widest">Aparência & Tema</p>
        <div className="p-6 bg-zinc-900/40 border border-white/5 rounded-[3rem] space-y-6">
          <div className="flex items-center gap-3">
             <Palette size={18} style={{ color: themeColor }} />
             <span className="text-sm font-bold">Cor de Realce</span>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {colors.map(c => (
              <button 
                key={c} 
                onClick={() => setThemeColor(c)}
                className={`aspect-square rounded-full transition-all flex items-center justify-center ${themeColor === c ? 'scale-110 ring-4 ring-white/10' : 'opacity-30 hover:opacity-100'}`}
                style={{ backgroundColor: c }}
              >
                {themeColor === c && <CheckCircle size={14} className="text-black/50" />}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ÁREA ADMIN REAL */}
      {isAdmin && (
        <section className="space-y-4">
          <p className="text-[10px] font-black uppercase text-red-500/50 px-2 tracking-widest">Sistema Admin</p>
          <div className="grid grid-cols-1 gap-2">
            <button className="w-full p-5 bg-zinc-900/40 border border-white/5 rounded-[2rem] text-left flex items-center justify-between group hover:border-red-500/30 transition-all">
              <span className="text-xs font-bold uppercase tracking-widest group-hover:text-red-500">Limpar Base de Dados</span>
              <Trash2 size={16} className="text-zinc-600 group-hover:text-red-500" />
            </button>
          </div>
        </section>
      )}
    </div>
  );
}