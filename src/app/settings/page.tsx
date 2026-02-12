"use client";
import { useState, useEffect } from "react";

const VERSION = "0.01.2g";
const UPDATE_LOGS = [
    { version: "0.01.2g", date: "Hoje", changes: ["Fix Crítico: Resolvido erro de mismatch de tipos no componente de áudio (ReactPlayer).", "Stability: Implementada verificação de segurança para listas de favoritos vazias.", "Build: Otimização do carregamento dinâmico para compatibilidade total com a Vercel."] },
  { version: "0.01.2", date: "Hoje", changes: ["Player Real com Áudio", "Biblioteca de Favoritos", "Seletor de Temas Dinâmico", "Persistência LocalStorage"] },
  { version: "0.01.1", date: "Ontem", changes: ["Motor Híbrido Spotify/YT", "Player Visual", "Sistema de Login"] },
  { version: "0.01.0", date: "Fev 2026", changes: ["Lançamento Base PWA"] },
];

export default function Settings() {
  const [theme, setTheme] = useState("default");

  const changeTheme = (newTheme: string) => {
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("xalanify_theme", newTheme);
  };

  return (
    <div className="space-y-8 pb-10">
      <h1 className="text-3xl font-bold">Definições</h1>

      <section className="bg-surface p-5 rounded-3xl">
        <h2 className="font-bold mb-4">Personalização</h2>
        <div className="flex gap-4">
          <button onClick={() => changeTheme('default')} className="w-10 h-10 rounded-full bg-primary border-2 border-white" title="Roxo" />
          <button onClick={() => changeTheme('yellowish')} className="w-10 h-10 rounded-full bg-yellow-500 border-2 border-white/10" title="Amarelado" />
        </div>
      </section>

      <section className="bg-surface p-5 rounded-3xl">
        <h2 className="text-primary font-bold mb-4">Logs de Sistema</h2>
        <div className="space-y-4">
          {UPDATE_LOGS.map((log) => (
            <div key={log.version} className="border-l border-white/10 pl-4">
              <p className="text-xs font-bold">v{log.version} - {log.date}</p>
              <ul className="text-[10px] text-gray-500">
                {log.changes.map((c, i) => <li key={i}>• {c}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>
      
      <p className="text-center text-[10px] text-gray-700">Criado por Xalana</p>
    </div>
  );
}