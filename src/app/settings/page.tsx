"use client";
import { 
  User, ShieldCheck, Palette, Sparkles, LogOut, ChevronRight, 
  Search, Bell, Smartphone, HelpCircle, ChevronLeft, Home, Info 
} from "lucide-react";
import { useXalanify } from "@/context/XalanifyContext";

export default function SettingsPage() {
  const { settingsView, setSettingsView, logout, themeColor, setThemeColor, isOLED, setIsOLED } = useXalanify();
  const colors = ["#3b82f6", "#ef4444", "#a855f7", "#10b981", "#f59e0b", "#3f3f46"];

  // --- VISTA: PERSONALIZAÇÃO ---
  if (settingsView === 'appearance') {
    return (
      <div className="p-6 pt-12 min-h-screen bg-[#050a18] animate-in slide-in-from-right duration-300 pb-32">
        <div className="flex items-center justify-between mb-8">
            <button onClick={() => setSettingsView('menu')} className="p-2 text-gray-400 hover:text-white"><ChevronLeft size={24} /></button>
            <h1 className="text-lg font-bold">Personalização</h1>
            <button className="text-sm text-blue-500 font-bold">Redefinir</button>
        </div>

        <div className="mb-8">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 px-1">PRÉ-VISUALIZAÇÃO</p>
            <div className="glass p-6 rounded-[2rem] border border-white/10 relative overflow-hidden bg-[#0f172a]">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-orange-400 to-pink-500" />
                    <div className="space-y-2 flex-1">
                        <div className="h-2 w-1/2 bg-white/20 rounded-full" />
                        <div className="h-2 w-1/3 bg-white/10 rounded-full" />
                    </div>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-600 shadow-lg shadow-blue-500/30"><div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[6px] border-l-white border-b-[4px] border-b-transparent ml-1"></div></div>
                </div>
                <div className="mt-6 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full w-2/3 bg-blue-600 rounded-full" />
                </div>
            </div>
        </div>

        <div className="mb-8">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 px-1">COR PRIMÁRIA</p>
            <div className="flex justify-between gap-3 overflow-x-auto pb-2 custom-scroll">
                {colors.map(c => (
                    <button 
                        key={c} onClick={() => setThemeColor(c)}
                        className={`w-12 h-12 rounded-full transition-all flex items-center justify-center shrink-0 border-2 ${themeColor === c ? 'border-white scale-110' : 'border-transparent opacity-50'}`}
                        style={{ backgroundColor: c }}
                    >
                        {themeColor === c && <div className="w-5 h-5 bg-white rounded-full opacity-30" />}
                    </button>
                ))}
                <button className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-gray-400">+</button>
            </div>
        </div>

        <div className="mb-8">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 px-1">ESTILO VISUAL</p>
            <div className="bg-[#1e293b] rounded-full p-1 flex">
                <button className="flex-1 py-3 bg-blue-600 rounded-full font-bold text-xs text-white shadow-md">Sólido</button>
                <button className="flex-1 py-3 font-bold text-xs text-gray-400 hover:text-white transition-colors">Gradiente</button>
            </div>
        </div>

        <div className="mb-8 bg-[#1e293b]/50 p-5 rounded-[2rem] flex items-center justify-between border border-white/5">
            <div>
                <h3 className="font-bold text-base text-white">Modo Escuro Intenso</h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">Preto puro para telas OLED</p>
            </div>
            <button onClick={() => setIsOLED(!isOLED)} className={`w-12 h-7 rounded-full relative transition-colors ${isOLED ? 'bg-blue-600' : 'bg-gray-600'}`}>
                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-sm ${isOLED ? 'right-1' : 'left-1'}`} />
            </button>
        </div>
        
        <button onClick={() => setSettingsView('menu')} className="w-full py-4 bg-blue-600 rounded-[2rem] font-bold text-white shadow-lg shadow-blue-900/40 active:scale-[0.98] transition-all">
            Aplicar Mudanças
        </button>
      </div>
    );
  }

  // --- VISTA: MENU PRINCIPAL ---
  return (
    <div className="p-6 pt-12 min-h-screen bg-[#050a18] animate-in fade-in pb-32">
        <h1 className="text-4xl font-black mb-8 text-white">Definições Gerais</h1>
        
        <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
            <input type="text" placeholder="Procurar definições" className="w-full bg-[#1e293b]/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:bg-[#1e293b] transition-colors placeholder:text-gray-500 font-medium" />
        </div>

        <div className="space-y-6">
            <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] px-4 mb-3">SUA CONTA</p>
                <div className="bg-[#1e293b]/30 rounded-[2rem] overflow-hidden border border-white/5">
                    <button className="w-full p-4 flex items-center gap-4 hover:bg-white/5 transition-colors group text-left border-b border-white/5">
                        <User className="text-blue-500" size={20} />
                        <div className="flex-1">
                            <h3 className="font-bold text-white text-sm">Perfil e Conta</h3>
                            <p className="text-[10px] text-gray-500 font-medium">Gerenciar dados e segurança</p>
                        </div>
                        <ChevronRight className="text-gray-600 size-4" />
                    </button>
                    <button className="w-full p-4 flex items-center gap-4 hover:bg-white/5 transition-colors group text-left">
                        <ShieldCheck className="text-amber-500" size={20} />
                        <div className="flex-1">
                            <h3 className="font-bold text-white text-sm">Assinatura Premium</h3>
                            <p className="text-[10px] text-gray-500 font-medium">Ativa até Setembro 2024</p>
                        </div>
                        <ChevronRight className="text-gray-600 size-4" />
                    </button>
                </div>
            </div>

            <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] px-4 mb-3">APARÊNCIA E ESTILO</p>
                <div className="bg-[#1e293b]/30 rounded-[2rem] overflow-hidden border border-white/5">
                    <button onClick={() => setSettingsView('appearance')} className="w-full p-4 flex items-center gap-4 hover:bg-white/5 transition-colors group text-left border-b border-white/5 relative">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30"><Palette size={14} className="text-white" /></div>
                        <div className="flex-1">
                            <h3 className="font-bold text-white text-sm">Personalização do Tema</h3>
                            <p className="text-[10px] text-gray-500 font-medium">Cores, ícones e interface glass</p>
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 absolute right-10 top-1/2 -translate-y-1/2" />
                        <ChevronRight className="text-gray-600 size-4" />
                    </button>
                    <button className="w-full p-4 flex items-center gap-4 hover:bg-white/5 transition-colors group text-left">
                        <div className="w-8 h-8 rounded-full bg-[#2e364f] flex items-center justify-center"><Sparkles size={14} className="text-purple-400" /></div>
                        <div className="flex-1">
                            <h3 className="font-bold text-white text-sm">Efeitos Visuais</h3>
                            <p className="text-[10px] text-gray-500 font-medium">Blur dinâmico e transições</p>
                        </div>
                        <ChevronRight className="text-gray-600 size-4" />
                    </button>
                </div>
            </div>
            
             <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] px-4 mb-3">OUTROS</p>
                 <div className="bg-[#1e293b]/30 rounded-[2rem] overflow-hidden border border-white/5">
                    <button className="w-full p-4 flex items-center gap-4 hover:bg-white/5 transition-colors group text-left border-b border-white/5">
                        <Info className="text-blue-500" size={20} />
                        <div className="flex-1"><h3 className="font-bold text-white text-sm">Créditos</h3></div>
                        <ChevronRight className="text-gray-600 size-4" />
                    </button>
                    <button onClick={logout} className="w-full p-4 flex items-center gap-4 hover:bg-red-500/10 transition-colors group text-left text-red-500">
                        <LogOut size={20} />
                        <div className="flex-1"><h3 className="font-bold text-sm">Terminar Sessão</h3></div>
                        <ChevronRight className="text-red-500/50 size-4" />
                    </button>
                 </div>
             </div>
        </div>
    </div>
  );
}