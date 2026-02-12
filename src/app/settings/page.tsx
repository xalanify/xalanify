"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { User, Palette, Info, LogOut, History, ChevronRight } from "lucide-react";

export default function Settings() {
  const { user, setThemeColor, themeColor } = useXalanify();

  // HISTÓRICO DE ATUALIZAÇÕES (Versão Atual e Anteriores)
  const changelog = [
    {
      version: "v1.0.4 (Atual)",
      status: "latest",
      changes: [
        { type: "fix", text: "Resolvido erro 'Cannot find name playTrack' no Search" },
        { type: "fix", text: "Resolvido erro 'themeColor' não definido no contexto" },
        { type: "added", text: "Sistema de Histórico de Versões nas Definições" },
        { type: "improved", text: "Trancagem de imagens (w-14) para evitar capas gigantes" }
      ]
    },
    {
      version: "v1.0.3",
      status: "old",
      changes: [
        { type: "added", text: "Navegação inferior fixa (Bottom Nav)" },
        { type: "removed", text: "Removido componente duplicado BottomNav.tsx" }
      ]
    }
  ];

  return (
    <div className="space-y-8 pb-40 animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold px-2 text-white">Definições</h1>

      {/* Perfil */}
      <section className="bg-zinc-900/50 p-6 rounded-[2.5rem] border border-white/5 flex items-center gap-4 mx-1">
        <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center text-2xl font-bold border-2" style={{ borderColor: themeColor }}>
          {user?.[0]?.toUpperCase()}
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">{user}</h2>
          <p className="text-xs text-zinc-500 font-medium">Membro Xalanify Premium</p>
        </div>
      </section>

      {/* HISTÓRICO DE ATUALIZAÇÕES */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 px-3 text-zinc-500">
          <History size={14} />
          <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Notas de Atualização</p>
        </div>
        
        <div className="space-y-3 mx-1">
          {changelog.map((version) => (
            <div key={version.version} className={`p-5 rounded-[2rem] border ${version.status === 'latest' ? 'bg-zinc-900/80 border-white/10' : 'bg-zinc-900/30 border-white/5 opacity-70'}`}>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-black uppercase tracking-widest" style={{ color: version.status === 'latest' ? themeColor : '#666' }}>
                  {version.version}
                </span>
                {version.status === 'latest' && <span className="text-[9px] bg-white/10 px-2 py-0.5 rounded-full text-white/50">Atual</span>}
              </div>
              
              <ul className="space-y-2">
                {version.changes.map((change, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-[11px]">
                    <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      change.type === 'added' ? 'bg-green-500' : 
                      change.type === 'fix' ? 'bg-blue-500' : 'bg-red-500'
                    }`} />
                    <span className="text-zinc-300 leading-tight">
                      <b className="uppercase text-[9px] mr-1 opacity-50">{change.type}:</b> {change.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <button className="w-full p-5 bg-red-500/10 text-red-500 rounded-3xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all">
        <LogOut size={18} /> Encerrar Sessão
      </button>
    </div>
  );
}