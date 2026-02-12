"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { History, Zap, Trash2, RefreshCw, PlayCircle } from "lucide-react";

export default function Settings() {
  const { user, themeColor } = useXalanify();

  const updates = [
    {
      version: "0.13.0",
      status: "ATUAL",
      logs: [
        { type: "added", text: "Motor de áudio ReactPlayer ativado (As músicas já tocam).", icon: PlayCircle },
        { type: "updated", text: "Removida mensagem de boas-vindas na Home.", icon: Trash2 },
        { type: "added", text: "Badge 'BETA' permanente no topo.", icon: Zap },
        { type: "added", text: "Pop-up de anúncio de nova versão no arranque.", icon: Zap }
      ]
    },
    {
      version: "0.12.0",
      status: "ANTERIOR",
      logs: [
        { type: "added", text: "Sistema de Histórico de Versões detalhado.", icon: History },
        { type: "fixed", text: "Correção de imagens gigantes (w-14) no Search.", icon: RefreshCw },
        { type: "fixed", text: "Suporte para Tailwind v4 configurado.", icon: RefreshCw }
      ]
    }
  ];

  return (
    <div className="space-y-8 pb-44">
      <h1 className="text-3xl font-black px-2">Definições</h1>

      {/* Histórico Persistente */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-2 text-zinc-500">
          <History size={16} />
          <p className="text-[10px] font-black uppercase tracking-[0.3em]">Logs de Sistema</p>
        </div>

        <div className="space-y-4 px-1">
          {updates.map((rev) => (
            <div key={rev.version} className={`p-6 rounded-[2.5rem] border ${rev.status === 'ATUAL' ? 'bg-zinc-900 border-white/10' : 'bg-transparent border-white/5 opacity-50'}`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`font-black tracking-tighter ${rev.status === 'ATUAL' ? 'text-lg' : 'text-sm'}`} style={{ color: rev.status === 'ATUAL' ? themeColor : 'white' }}>
                  v{rev.version}
                </h3>
                <span className="text-[9px] font-black px-2 py-1 bg-white/5 rounded-lg">{rev.status}</span>
              </div>
              
              <div className="space-y-3">
                {rev.logs.map((log, i) => (
                  <div key={i} className="flex gap-3">
                    <log.icon size={12} className="mt-1 text-zinc-500 flex-shrink-0" />
                    <p className="text-[11px] text-zinc-300 leading-snug">
                      <span className={`uppercase text-[8px] font-black mr-2 ${
                        log.type === 'added' ? 'text-green-500' : 'text-blue-500'
                      }`}>[{log.type}]</span>
                      {log.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}