"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { History, LogOut, Zap, Trash2, RefreshCw, ChevronDown } from "lucide-react";
import { useState } from "react";

export default function Settings() {
  const { user, themeColor } = useXalanify();

  const changelog = [
    {
      version: "v1.0.5 (Atual)",
      date: "12 Fev 2026",
      logs: [
        { type: "added", text: "Suporte para Tailwind v4 e Next.js 16.", icon: Zap },
        { type: "added", text: "Histórico detalhado de mudanças nas Definições.", icon: Zap },
        { type: "fixed", text: "Erro de compilação 'bg-black' na Vercel.", icon: RefreshCw },
        { type: "fixed", text: "Problema de capas gigantes no Search e Library.", icon: RefreshCw }
      ]
    },
    {
      version: "v1.0.4",
      date: "11 Fev 2026",
      logs: [
        { type: "added", text: "Sistema de cores dinâmicas via XalanifyContext.", icon: Zap },
        { type: "removed", text: "Ficheiro BottomNav.tsx removido para evitar conflitos.", icon: Trash2 },
        { type: "updated", text: "Navegação movida para o fundo (Estilo App).", icon: RefreshCw }
      ]
    }
  ];

  return (
    <div className="space-y-8 pb-44 animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold px-2">Definições</h1>

      {/* Perfil */}
      <section className="musi-card p-6 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center text-xl font-bold border-2" style={{ borderColor: themeColor }}>
          {user?.[0]?.toUpperCase()}
        </div>
        <div>
          <h2 className="text-lg font-bold">{user}</h2>
          <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Premium</p>
        </div>
      </section>

      {/* HISTÓRICO DE ATUALIZAÇÕES */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-2 text-zinc-500">
          <History size={16} />
          <p className="text-[10px] font-black uppercase tracking-[0.2em]">Histórico de Atualizações</p>
        </div>

        <div className="space-y-4">
          {changelog.map((rev, index) => (
            <div key={rev.version} className={`p-5 rounded-3xl border ${index === 0 ? 'bg-zinc-900 border-white/10' : 'bg-black border-white/5 opacity-50'}`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-sm" style={{ color: index === 0 ? themeColor : 'white' }}>
                  {rev.version}
                </h3>
                <span className="text-[9px] text-zinc-600 font-bold">{rev.date}</span>
              </div>
              
              <div className="space-y-3">
                {rev.logs.map((log, i) => (
                  <div key={i} className="flex gap-3">
                    <log.icon size={12} className="mt-0.5 text-zinc-500 flex-shrink-0" />
                    <p className="text-[11px] text-zinc-300">
                      <span className={`uppercase text-[8px] font-bold mr-1 ${
                        log.type === 'added' ? 'text-green-500' : 
                        log.type === 'fixed' ? 'text-blue-500' : 
                        log.type === 'removed' ? 'text-red-500' : 'text-orange-500'
                      }`}>
                        {log.type}
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
        Encerrar Sessão
      </button>
    </div>
  );
}