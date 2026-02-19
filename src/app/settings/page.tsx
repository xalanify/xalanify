"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { User, ShieldCheck, Palette, Sparkles, LogOut, ChevronRight, Search, Moon, Bell, Headphones } from "lucide-react";

export default function SettingsPage() {
  const { themeColor, setThemeColor, isOLED, setIsOLED } = useXalanify();
  const colors = ["#3b82f6", "#ef4444", "#a855f7", "#10b981", "#f59e0b"];

  return (
    <div className="p-6 pt-12 space-y-10 animate-in fade-in">
      <h1 className="text-4xl font-bold tracking-tight mb-8">Definições Gerais</h1>

      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={18} />
        <input type="text" placeholder="Procurar definições" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm" />
      </div>

      <section className="space-y-4">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 px-2">Sua Conta</p>
        <div className="glass rounded-[2.5rem] p-2 border-white/5">
          <SettingItem icon={<User size={20}/>} label="Perfil e Conta" sub="Gerenciar dados e segurança" />
          <SettingItem icon={<ShieldCheck size={20} className="text-amber-500"/>} label="Assinatura Premium" sub="Ativa até Setembro 2024" />
        </div>
      </section>

      <section className="space-y-4">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 px-2">Aparência e Estilo</p>
        <div className="glass rounded-[2.5rem] p-2 border-white/5">
          <div onClick={() => {}} className="flex items-center gap-4 p-4 hover:bg-white/5 rounded-[2rem] transition-all cursor-pointer group">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/5 ring-2 ring-blue-500/50"><Palette size={20} className="text-blue-500"/></div>
            <div className="flex-1">
              <p className="font-bold text-sm">Personalização do Tema</p>
              <p className="text-[10px] opacity-40">Cores, ícones e interface glass</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
            <ChevronRight size={18} className="opacity-20" />
          </div>
          <SettingItem icon={<Sparkles size={20} className="text-purple-500"/>} label="Efeitos Visuais" sub="Blur dinâmico e transições" />
        </div>
      </section>

      {/* PAINEL DE CORES (IMAGEM 3) */}
      <div className="glass rounded-[3rem] p-8 space-y-8 border-white/10 bg-gradient-to-b from-white/5 to-transparent">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-5">Cor Primária</p>
          <div className="flex flex-wrap gap-4">
            {colors.map(c => (
              <button key={c} onClick={() => setThemeColor(c)} className={`w-10 h-10 rounded-full transition-all active:scale-75 ${themeColor === c ? 'ring-4 ring-white/30 scale-110 shadow-2xl' : ''}`} style={{ backgroundColor: c }} />
            ))}
            <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-xl opacity-40">+</button>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-white/5 rounded-3xl">
          <div>
            <p className="font-bold">Modo Escuro Intenso</p>
            <p className="text-[10px] opacity-40">Preto puro para telas OLED</p>
          </div>
          <button onClick={() => setIsOLED(!isOLED)} className={`w-14 h-8 rounded-full relative transition-all ${isOLED ? 'bg-blue-600' : 'bg-zinc-700'}`}>
            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${isOLED ? 'right-1' : 'left-1'}`} />
          </button>
        </div>
      </div>

      <button className="w-full py-6 flex items-center justify-center gap-3 text-red-500 font-bold glass rounded-[2.5rem] border-red-500/20 active:scale-95 transition-all">
        <LogOut size={22} /> Terminar Sessão
      </button>
    </div>
  );
}

function SettingItem({ icon, label, sub }: any) {
  return (
    <div className="flex items-center gap-4 p-4 hover:bg-white/5 rounded-[2rem] transition-all cursor-pointer group">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/5">{icon}</div>
      <div className="flex-1">
        <p className="font-bold text-sm">{label}</p>
        <p className="text-[10px] opacity-40">{sub}</p>
      </div>
      <ChevronRight size={18} className="opacity-20 group-hover:translate-x-1 transition-all" />
    </div>
  );
}