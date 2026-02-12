"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { LogOut, History, Zap, Trash2, RefreshCw } from "lucide-react";

export default function Settings() {
  const { user, themeColor } = useXalanify();

  const updates = [
    {
      version: "v1.0.4",
      date: "12 Fev 2026",
      current: true,
      logs: [
        { type: "added", text: "Histórico detalhado de versões nas definições.", icon: Zap },
        { type: "fixed", text: "Erro 404 na rota /search (correção de diretório).", icon: RefreshCw },
        { type: "fixed", text: "Erro 'themeColor' e 'playTrack' undefined.", icon: RefreshCw },
        { type: "removed", text: "Ficheiro duplicado BottomNav.tsx para evitar conflitos.", icon: Trash2 }
      ]
    },
    {
      version: "v1.0.3",
      date: "11 Fev 2026",
      current: false,
      logs: [
        { type: "added", text: "Navegação inferior estilo Musi (Bottom Bar).", icon: Zap },
        { type: "updated", text: "Design do Player para modo mini flutuante.", icon: RefreshCw }
      ]
    }
  ];

  return (
    <div className="space-y-8 pb-40">
      <h1 className="text-3xl font-bold px-2">Definições</h1>

      {/* Perfil Simples */}
      <section className="bg-zinc-900/50 p-6 rounded-[2rem] border border-white/5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center text-xl font-bold border-2" style={{ borderColor: themeColor }}>
          {user?.[0]?.toUpperCase()}
        </div>
        <div>
          <h2 className="text-lg font-bold">{user}</h2>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Premium Account</p>
        </div>
      </section>

      {/* HISTÓRICO DE ATUALIZAÇÕES */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-2 text-zinc-500">
          <History size={16} />
          <p className="text-[10px] font-black uppercase tracking-[0.2em]">Logs de Sistema</p>
        </div>

        <div className="space-y-4">
          {updates.map((rev) => (
            <div key={rev.version} className={`p-5 rounded-[2.5rem] border ${rev.current ? 'bg-zinc-900 border-white/10' : 'bg-black border-white/5 opacity-60'}`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-black text-sm" style={{ color: rev.current ? themeColor : '#fff' }}>
                  {rev.version} {rev.current && "• ATUAL"}
                </h3>
                <span className="text-[9px] text-zinc-600 font-bold">{rev.date}</span>
              </div>
              
              <div className="space-y-3">
                {rev.logs.map((log, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <log.icon size={12} className="mt-0.5 text-zinc-500" />
                    <p className="text-[11px] text-zinc-300 leading-relaxed">
                      <span className={`uppercase text-[9px] font-bold mr-1 ${
                        log.type === 'added' ? 'text-green-500' : 
                        log.type === 'fixed' ? 'text-blue-500' : 
                        log.type === 'removed' ? 'text-red-500' : 'text-orange-500'
                      }`}>
                        [{log.type}]
                      </span>
                      {log.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <button className="w-full p-4 bg-red-500/10 text-red-500 rounded-2xl font-bold text-xs active:scale-95 transition-all">
        Sair da Conta
      </button>
    </div>
  );
}