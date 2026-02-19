"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { User, ShieldCheck, Palette, Sparkles, LogOut, ChevronRight, Search, ChevronLeft, Mail, Fingerprint } from "lucide-react";

export default function SettingsPage() {
  const { themeColor, setThemeColor, isOLED, setIsOLED, settingsView, setSettingsView, logout, user } = useXalanify();
  const colors = ["#3b82f6", "#ef4444", "#a855f7", "#10b981", "#f59e0b", "#ec4899"];

  if (settingsView === 'account_details') {
    return (
      <div className="p-8 pt-16 animate-in slide-in-from-right duration-300">
        <button onClick={() => setSettingsView('menu')} className="flex items-center gap-2 mb-10 opacity-40 font-black text-[10px] uppercase tracking-widest"><ChevronLeft size={18} /> Voltar</button>
        <h1 className="text-6xl font-black-italic mb-12 tracking-tighter">Conta</h1>
        <div className="glass rounded-[3rem] p-10 border border-white/10 space-y-10">
          <div className="flex items-center gap-6 pb-10 border-b border-white/5">
            <div className="w-24 h-24 rounded-full border-4 border-blue-500/20 p-1">
              <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.email}`} className="rounded-full shadow-2xl" />
            </div>
            <div>
              <p className="text-3xl font-black-italic tracking-tighter text-white uppercase">{user?.email?.split('@')[0]}</p>
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Utilizador Verificado</p>
            </div>
          </div>
          <div className="space-y-8">
            <div className="flex items-center gap-5 opacity-60">
              <Mail className="text-blue-500" />
              <div><p className="text-[10px] font-black uppercase opacity-40">Email Principal</p><p className="font-bold">{user?.email}</p></div>
            </div>
            <div className="flex items-center gap-5 opacity-60">
              <Fingerprint className="text-blue-500" />
              <div><p className="text-[10px] font-black uppercase opacity-40">ID do Ecossistema</p><p className="font-bold text-[10px] truncate max-w-[200px]">{user?.id}</p></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (settingsView === 'appearance') {
    return (
      <div className="p-8 pt-16 animate-in slide-in-from-right duration-300">
        <button onClick={() => setSettingsView('menu')} className="flex items-center gap-2 mb-10 opacity-40 font-black text-[10px] uppercase tracking-widest"><ChevronLeft size={18} /> Voltar</button>
        <h1 className="text-6xl font-black-italic mb-12 tracking-tighter">Estilo</h1>
        <div className="glass rounded-[3rem] p-10 border border-white/10 space-y-12">
          <section>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-8 px-2">Cor Primária</p>
            <div className="grid grid-cols-4 gap-6">
              {colors.map(c => (
                <button key={c} onClick={() => setThemeColor(c)} className={`aspect-square rounded-full transition-all active:scale-75 ${themeColor === c ? 'ring-4 ring-white/30 scale-110' : 'opacity-40'}`} style={{ backgroundColor: c }} />
              ))}
            </div>
          </section>
          <div className="flex items-center justify-between p-7 bg-white/5 rounded-[2.5rem] border border-white/5">
            <div><p className="font-black text-xl italic tracking-tight">Modo OLED</p><p className="text-[10px] opacity-40 font-black uppercase tracking-widest">Preto Puro</p></div>
            <button onClick={() => setIsOLED(!isOLED)} className={`w-16 h-9 rounded-full relative transition-all ${isOLED ? 'bg-blue-600' : 'bg-zinc-700'}`}>
              <div className={`absolute top-1.5 w-6 h-6 bg-white rounded-full transition-all ${isOLED ? 'right-1.5' : 'left-1.5'}`} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 pt-16 animate-in fade-in">
      <h1 className="text-6xl font-black-italic mb-12 tracking-tighter text-white">Definições</h1>
      <div className="relative mb-12">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 opacity-20" size={20} />
        <input type="text" placeholder="Procurar definições" className="w-full bg-white/5 border border-white/5 rounded-[2.5rem] py-6 pl-16 pr-6 text-sm focus:bg-white/10 outline-none transition-all font-bold" />
      </div>
      <div className="space-y-12">
        <section className="space-y-4">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 px-6">Identidade</p>
          <div className="glass rounded-[3rem] p-3 border border-white/5">
            <div onClick={() => setSettingsView('account_details')} className="flex items-center gap-6 p-6 hover:bg-white/5 rounded-[2.5rem] transition-all cursor-pointer group">
              <div className="w-16 h-16 rounded-[1.8rem] flex items-center justify-center bg-white/5 ring-1 ring-white/10 group-hover:bg-blue-500/10"><User size={28} className="text-blue-500"/></div>
              <div className="flex-1">
                <p className="font-black text-xl italic tracking-tight text-white">Perfil e Conta</p>
                <p className="text-[10px] opacity-40 font-black uppercase tracking-widest">Gerir os teus dados</p>
              </div>
              <ChevronRight size={20} className="opacity-20 group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 px-6">Aparência</p>
          <div className="glass rounded-[3rem] p-3 border border-white/5">
            <div onClick={() => setSettingsView('appearance')} className="flex items-center gap-6 p-6 hover:bg-white/5 rounded-[2.5rem] transition-all cursor-pointer group">
              <div className="w-16 h-16 rounded-[1.8rem] flex items-center justify-center bg-white/5 ring-1 ring-white/10"><Palette size={28} className="text-blue-500"/></div>
              <div className="flex-1"><p className="font-black text-xl italic tracking-tight text-white">Personalização</p><p className="text-[10px] opacity-40 font-black uppercase tracking-widest">Cores e Interface</p></div>
              <ChevronRight size={20} className="opacity-20 group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        </section>
      </div>
      <button onClick={logout} className="w-full mt-16 py-8 flex items-center justify-center gap-3 text-red-500 font-black-italic uppercase tracking-[0.2em] glass rounded-[3rem] border border-red-500/10 active:scale-95 transition-all shadow-2xl">
        <LogOut size={28} /> Terminar Sessão
      </button>
    </div>
  );
}