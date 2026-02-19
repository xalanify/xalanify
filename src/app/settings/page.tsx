"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { User, ShieldCheck, Palette, Sparkles, LogOut, ChevronRight, Search, ChevronLeft, Moon, Zap, Waves } from "lucide-react";

export default function SettingsPage() {
  const { themeColor, setThemeColor, isOLED, setIsOLED, settingsView, setSettingsView } = useXalanify();
  const colors = ["#3b82f6", "#ef4444", "#a855f7", "#10b981", "#f59e0b", "#ec4899", "#06b6d4"];

  // VISTA DE PERSONALIZAÇÃO (CLICADO EM PALETTE)
  if (settingsView === 'appearance') {
    return (
      <div className="p-6 pt-12 animate-in slide-in-from-right duration-300">
        <button onClick={() => setSettingsView('menu')} className="flex items-center gap-2 mb-8 opacity-50 font-bold text-[10px] uppercase tracking-widest">
          <ChevronLeft size={18} /> Voltar
        </button>
        <h1 className="text-4xl font-black mb-10 tracking-tighter">Personalização</h1>

        <div className="glass rounded-[3rem] p-8 space-y-10 border-white/10 bg-gradient-to-b from-white/5 to-transparent">
          <section>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-6 px-1">Cor do Ecossistema</p>
            <div className="grid grid-cols-5 gap-4">
              {colors.map(c => (
                <button 
                  key={c} onClick={() => setThemeColor(c)} 
                  className={`aspect-square rounded-full transition-all active:scale-75 ${themeColor === c ? 'ring-4 ring-white/30 scale-110 shadow-lg' : 'opacity-40 hover:opacity-100'}`} 
                  style={{ backgroundColor: c }} 
                />
              ))}
            </div>
          </section>

          <section className="flex items-center justify-between p-5 bg-white/5 rounded-[2rem] border border-white/5">
            <div>
              <p className="font-bold text-lg">Modo OLED</p>
              <p className="text-[10px] opacity-40 font-medium">Preto absoluto para poupar bateria</p>
            </div>
            <button onClick={() => setIsOLED(!isOLED)} className={`w-14 h-8 rounded-full relative transition-all duration-300 ${isOLED ? 'bg-blue-600' : 'bg-zinc-700'}`}>
              <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-all ${isOLED ? 'right-1' : 'left-1'}`} />
            </button>
          </section>
        </div>
      </div>
    );
  }

  // VISTA DE EFEITOS VISUAIS (CLICADO EM SPARKLES)
  if (settingsView === 'visuals') {
    return (
      <div className="p-6 pt-12 animate-in slide-in-from-right duration-300">
        <button onClick={() => setSettingsView('menu')} className="flex items-center gap-2 mb-8 opacity-50 font-bold text-[10px] uppercase tracking-widest">
          <ChevronLeft size={18} /> Voltar
        </button>
        <h1 className="text-4xl font-black mb-10 tracking-tighter">Efeitos Visuais</h1>
        
        <div className="glass rounded-[3rem] p-8 space-y-6 border-white/5">
           <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
              <p className="font-bold">Blur Dinâmico</p>
              <div className="w-10 h-6 bg-blue-500 rounded-full relative"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"/></div>
           </div>
           <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
              <p className="font-bold">Animações de Transição</p>
              <div className="w-10 h-6 bg-blue-500 rounded-full relative"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"/></div>
           </div>
        </div>
      </div>
    );
  }

  // VISTA PRINCIPAL
  return (
    <div className="p-6 pt-12 animate-in fade-in duration-300">
      <h1 className="text-4xl font-black mb-10 tracking-tighter">Definições</h1>

      <div className="relative mb-10">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 opacity-20" size={20} />
        <input type="text" placeholder="Procurar definições" className="w-full bg-white/5 border border-white/5 rounded-[2rem] py-5 pl-14 pr-6 text-sm focus:bg-white/10 outline-none transition-all" />
      </div>

      <div className="space-y-8">
        <section className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 px-4">Conta</p>
          <div className="glass rounded-[2.5rem] p-2 border-white/5">
            <SettingItem icon={<User size={22}/>} label="Perfil" sub="Dados e segurança" />
            <SettingItem icon={<ShieldCheck size={22} className="text-amber-500"/>} label="Premium" sub="Assinatura Ativa" />
          </div>
        </section>

        <section className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 px-4">Interface</p>
          <div className="glass rounded-[2.5rem] p-2 border-white/5">
            <div onClick={() => setSettingsView('appearance')} className="flex items-center gap-5 p-5 hover:bg-white/5 rounded-[2rem] transition-all cursor-pointer group">
              <div className="w-14 h-14 rounded-[1.5rem] flex items-center justify-center bg-white/5 ring-1 ring-white/10 group-hover:ring-blue-500/50 transition-all"><Palette size={24} className="text-blue-500"/></div>
              <div className="flex-1">
                <p className="font-bold text-sm">Personalização</p>
                <p className="text-[10px] opacity-40">Cores e temas</p>
              </div>
              <ChevronRight size={18} className="opacity-20 group-hover:translate-x-1 transition-all" />
            </div>

            <div onClick={() => setSettingsView('visuals')} className="flex items-center gap-5 p-5 hover:bg-white/5 rounded-[2rem] transition-all cursor-pointer group">
              <div className="w-14 h-14 rounded-[1.5rem] flex items-center justify-center bg-white/5 ring-1 ring-white/10"><Sparkles size={24} className="text-purple-500"/></div>
              <div className="flex-1">
                <p className="font-bold text-sm">Efeitos Visuais</p>
                <p className="text-[10px] opacity-40">Blur e animações</p>
              </div>
              <ChevronRight size={18} className="opacity-20 group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        </section>
      </div>

      <button className="w-full mt-12 py-6 flex items-center justify-center gap-3 text-red-500 font-black glass rounded-[2.5rem] border-red-500/10 active:scale-95 transition-all">
        <LogOut size={22} /> Sair da Conta
      </button>
    </div>
  );
}

function SettingItem({ icon, label, sub }: any) {
  return (
    <div className="flex items-center gap-5 p-5 hover:bg-white/5 rounded-[2rem] transition-all cursor-pointer group">
      <div className="w-14 h-14 rounded-[1.5rem] flex items-center justify-center bg-white/5 ring-1 ring-white/10">{icon}</div>
      <div className="flex-1">
        <p className="font-bold text-sm">{label}</p>
        <p className="text-[10px] opacity-40">{sub}</p>
      </div>
      <ChevronRight size={18} className="opacity-20 group-hover:translate-x-1 transition-all" />
    </div>
  );
}