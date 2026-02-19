"use client";
import { 
  User, ShieldCheck, Palette, Sparkles, LogOut, ChevronRight, 
  Search, Bell, Smartphone, HelpCircle, ChevronLeft, Info 
} from "lucide-react";
import { useXalanify } from "@/context/XalanifyContext";

export default function SettingsPage() {
  const { settingsView, setSettingsView, logout, themeColor, setThemeColor, isOLED, setIsOLED } = useXalanify();
  const colors = ["#3b82f6", "#ef4444", "#a855f7", "#10b981", "#f59e0b", "#3f3f46"];

  if (settingsView === 'appearance') {
    return (
      <div className="p-6 pt-12 min-h-screen animate-in slide-in-from-right duration-500 pb-40">
        <div className="flex items-center justify-between mb-10">
            <button onClick={() => setSettingsView('menu')} className="w-10 h-10 glass rounded-full flex items-center justify-center"><ChevronLeft size={20} /></button>
            <h1 className="text-xl font-black italic tracking-tighter">Aparência</h1>
            <div className="w-10" />
        </div>

        <div className="space-y-8">
            <section>
                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-4 px-2">Cor de Destaque</p>
                <div className="glass p-6 rounded-[2.5rem] border border-white/5 flex justify-between">
                    {colors.map(c => (
                        <button 
                            key={c} onClick={() => setThemeColor(c)}
                            className={`w-10 h-10 rounded-full transition-all border-2 ${themeColor === c ? 'border-white scale-125 shadow-lg' : 'border-transparent opacity-40'}`}
                            style={{ backgroundColor: c }}
                        />
                    ))}
                </div>
            </section>

            <section>
                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-4 px-2">Experiência Visual</p>
                <div className="glass rounded-[2.5rem] border border-white/5 overflow-hidden">
                    <div className="p-6 flex items-center justify-between border-b border-white/5">
                        <div>
                            <h3 className="font-bold text-sm">Modo OLED</h3>
                            <p className="text-[10px] opacity-40 font-medium">Preto absoluto para poupar bateria</p>
                        </div>
                        <button onClick={() => setIsOLED(!isOLED)} 
                                className={`w-12 h-6 rounded-full relative transition-all ${isOLED ? 'bg-blue-500' : 'bg-white/10'}`}>
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isOLED ? 'right-1' : 'left-1'}`} />
                        </button>
                    </div>
                    <div className="p-6 flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-sm">Interface Glass</h3>
                            <p className="text-[10px] opacity-40 font-medium">Efeito de transparência e desfoque</p>
                        </div>
                        <div className="w-12 h-6 rounded-full bg-blue-500 relative">
                             <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full" />
                        </div>
                    </div>
                </div>
            </section>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 pt-12 min-h-screen animate-in fade-in pb-40">
        <h1 className="text-5xl font-black mb-10 tracking-tighter italic">Ajustes</h1>
        
        <div className="space-y-8">
            <div className="space-y-3">
                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] px-4">Conta e Segurança</p>
                <div className="glass rounded-[2.5rem] border border-white/5 overflow-hidden">
                    <button className="w-full p-5 flex items-center gap-4 hover:bg-white/5 transition-all text-left border-b border-white/5">
                        <div className="w-10 h-10 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-500"><User size={20} /></div>
                        <div className="flex-1">
                            <h3 className="font-bold text-sm italic">Perfil do Utilizador</h3>
                            <p className="text-[10px] opacity-40 font-black uppercase tracking-tighter">Gerir dados pessoais</p>
                        </div>
                        <ChevronRight className="opacity-20" size={16} />
                    </button>
                    <button className="w-full p-5 flex items-center gap-4 hover:bg-white/5 transition-all text-left">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-500"><ShieldCheck size={20} /></div>
                        <div className="flex-1">
                            <h3 className="font-bold text-sm italic">Xalanify Premium</h3>
                            <p className="text-[10px] opacity-40 font-black uppercase tracking-tighter">Estado da subscrição</p>
                        </div>
                        <ChevronRight className="opacity-20" size={16} />
                    </button>
                </div>
            </div>

            <div className="space-y-3">
                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] px-4">Personalização</p>
                <div className="glass rounded-[2.5rem] border border-white/5 overflow-hidden">
                    <button onClick={() => setSettingsView('appearance')} className="w-full p-5 flex items-center gap-4 hover:bg-white/5 transition-all text-left border-b border-white/5">
                        <div className="w-10 h-10 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-500"><Palette size={20} /></div>
                        <div className="flex-1">
                            <h3 className="font-bold text-sm italic">Design e Cores</h3>
                            <p className="text-[10px] opacity-40 font-black uppercase tracking-tighter">Temas e efeitos visuais</p>
                        </div>
                        <ChevronRight className="opacity-20" size={16} />
                    </button>
                    <button className="w-full p-5 flex items-center gap-4 hover:bg-white/5 transition-all text-left">
                        <div className="w-10 h-10 rounded-2xl bg-pink-500/20 flex items-center justify-center text-pink-500"><Sparkles size={20} /></div>
                        <div className="flex-1">
                            <h3 className="font-bold text-sm italic">Laboratório</h3>
                            <p className="text-[10px] opacity-40 font-black uppercase tracking-tighter">Funcionalidades beta</p>
                        </div>
                        <ChevronRight className="opacity-20" size={16} />
                    </button>
                </div>
            </div>

            <button onClick={logout} className="w-full p-6 bg-red-500/10 border border-red-500/20 rounded-[2rem] flex items-center justify-center gap-3 text-red-500 font-black text-xs uppercase tracking-[0.2em] active:scale-95 transition-all">
                <LogOut size={18} /> Sair da Conta
            </button>
            
            <div className="text-center py-4">
                <p className="text-[10px] font-black opacity-20 uppercase tracking-[0.5em]">Xalanify v2.0.4</p>
            </div>
        </div>
    </div>
  );
}