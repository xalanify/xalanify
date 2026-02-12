"use client";
const VERSION = "0.01.1";
const UPDATE_LOGS = [
  { 
    version: "0.01.1", 
    date: "Hoje",
    changes: [
      "Motor Híbrido: Spotify (Dados) + YouTube (Áudio)", 
      "Player Flutuante com animações Framer Motion", 
      "Sistema de Login via LocalStorage",
      "Segurança: Implementação de Variáveis de Ambiente (.env)"
    ] 
  },
  { 
    version: "0.01.0", 
    date: "Fev 2024",
    changes: ["Lançamento Inicial", "UI Minimalista Dark Mode", "Navegação Inferior", "Base PWA"] 
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-8 pb-10">
      <h1 className="text-3xl font-bold">Definições</h1>
      
      <div className="bg-surface p-5 rounded-3xl border border-white/5">
        <h2 className="text-primary font-bold mb-4">Notas de Atualização</h2>
        <div className="space-y-6">
          {UPDATE_LOGS.map((log) => (
            <div key={log.version} className="relative pl-6 border-l border-primary/30">
              <div className="absolute w-2 h-2 bg-primary rounded-full -left-[4.5px] top-1.5" />
              <p className="text-sm font-bold text-white">Versão {log.version} <span className="text-[10px] text-gray-500 ml-2">{log.date}</span></p>
              <ul className="mt-2 space-y-1">
                {log.changes.map((change, i) => (
                  <li key={i} className="text-xs text-gray-400">• {change}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 text-center text-gray-600 text-xs">
        Criado por <span className="text-white font-medium">Xalana</span>
      </div>
    </div>
  );
}