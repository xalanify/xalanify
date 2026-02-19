"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { User, ShieldCheck, Palette, Sparkles, LogOut, ChevronRight, Search, ChevronLeft } from "lucide-react";

export default function SettingsPage() {
  const { themeColor, setThemeColor, isOLED, setIsOLED, settingsView, setSettingsView, logout } = useXalanify();
  const colors = ["#3b82f6", "#ef4444", "#a855f7", "#10b981", "#f59e0b", "#ec4899"];

  if (settingsView === 'appearance') {
    return (
      <div className="p-8 pt-16 animate-in slide-in-from-right duration-300">
        <button onClick={() => setSettingsView('menu')} className="flex items-center gap-2 mb-10 opacity-40 font-black text-[10px] uppercase tracking-widest"><ChevronLeft size={18} /> Voltar</button>
        <h1 className="text-5xl font-black mb-12 tracking-tighter italic">Aparência</h1>
        <div className="glass rounded-[3rem] p-10 space-y-12 border-white/10">
          <section>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-8 px-2">Esquema de Cores</p>
            <div className="grid grid-cols-4 gap-6">
              {colors.map(c => (
                <button key={c} onClick={() => setThemeColor(c)} className={`aspect-square rounded-full transition-all active:scale-75 ${themeColor === c ? 'ring-4 ring-white/30 scale-110 shadow-2xl' : 'opacity-40'}`} style={{ backgroundColor: c }} />
              ))}
            </div>
          </section>
          <div className="flex items-center justify-between p-6 bg-white/5 rounded-[2.5rem] border border-white/5">
            <div><p className="font-bold text-lg italic">Modo OLED</p><p className="text-[10px] opacity-40 font-black uppercase tracking-tighter">Preto absoluto para poupança</p></div>
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
      <h1 className="text-5xl font-black mb-12 tracking-tighter italic">Definições</h1>
      
      <div className="relative mb-12">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 opacity-20" size={20} />
        <input type="text" placeholder="Procurar definições..." className="w-full bg-white/5 border border-white/5 rounded-[2rem] py-6 pl-16 pr-6 text-sm focus:bg-white/10 outline-none transition-all" />
      </div>

      <div className="space-y-12">
        <section className="space-y-4">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 px-6">Utilizador</p>
          <div className="glass rounded-[3rem] p-3 border-white/5">
            <SettingItem icon={<User size={24}/>} label="Perfil e Conta" sub="Privacidade e dados" />
            <SettingItem icon={<ShieldCheck size={24} className="text-amber-500"/>} label="Plano Premium" sub="Válido até 2026" />
          </div>
        </section>

        <section className="space-y-4">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 px-6">Estética</p>
          <div className="glass rounded-[3rem] p-3 border-white/5">
            <div onClick={() => setSettingsView('appearance')} className="flex items-center gap-6 p-6 hover:bg-white/5 rounded-[2.5rem] transition-all cursor-pointer group">
              <div className="w-16 h-16 rounded-[1.8rem] flex items-center justify-center bg-white/5 ring-1 ring-white/10 group-hover:ring-blue-500/50"><Palette size={28} className="text-blue-500"/></div>
              <div className="flex-1">
                <p className="font-bold text-base italic">Personalização</p>
                <p className="text-[10px] opacity-40 font-black uppercase tracking-tighter">Cores e interface glass</p>
              </div>
              <ChevronRight size={20} className="opacity-20 group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        </section>
      </div>

      <button 
        onClick={logout}
        className="w-full mt-16 py-8 flex items-center justify-center gap-3 text-red-500 font-black uppercase tracking-[0.2em] glass rounded-[3rem] border-red-500/10 active:scale-95 transition-all shadow-2xl"
      >
        <LogOut size={24} /> Terminar Sessão
      </button>
    </div>
  );
}

function SettingItem({ icon, label, sub }: any) {
  return (
    <div className="flex items-center gap-6 p-6 hover:bg-white/5 rounded-[2.5rem] transition-all cursor-pointer group">
      <div className="w-16 h-16 rounded-[1.8rem] flex items-center justify-center bg-white/5 ring-1 ring-white/10">{icon}</div>
      <div className="flex-1">
        <p className="font-bold text-base italic">{label}</p>
        <p className="text-[10px] opacity-40 font-black uppercase tracking-tighter">{sub}</p>
      </div>
      <ChevronRight size={20} className="opacity-20 group-hover:translate-x-1 transition-all" />
    </div>
  );
}