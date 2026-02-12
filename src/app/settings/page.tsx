"use client";
import { useState, useEffect } from "react";

const VERSION = "0.01.0";
const UPDATE_LOGS = [
  { version: "0.01.0", changes: ["Lançamento Inicial", "UI Minimalista", "Sistema de Navegação", "Suporte PWA"] },
];

export default function SettingsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold">Definições</h1>
        <p className="text-gray-400">Versão {VERSION}</p>
      </header>

      <section className="bg-surface p-4 rounded-2xl">
        <h2 className="font-semibold mb-4">Sobre</h2>
        <p className="text-sm text-gray-300">Criado por <span className="text-primary font-bold">Xalana</span></p>
      </section>

      <section className="bg-surface p-4 rounded-2xl">
        <h2 className="font-semibold mb-4">Histórico de Atualizações</h2>
        <div className="space-y-4">
          {UPDATE_LOGS.map((log) => (
            <div key={log.version} className="border-l-2 border-primary pl-4">
              <p className="text-sm font-bold">v{log.version}</p>
              <ul className="text-xs text-gray-400 list-disc ml-4">
                {log.changes.map((change, i) => <li key={i}>{change}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>
      
      <div className="text-center opacity-20 text-[10px]">
        Xalanify Engine © 2024
      </div>
    </div>
  );
}