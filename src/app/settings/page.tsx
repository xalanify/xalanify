"use client";
import { ChevronRight, LogOut } from "lucide-react";
import { useXalanify } from "@/context/XalanifyContext";

export default function SettingsPanel() {
  const { themeColor, setThemeColor, isOLED, setIsOLED, user } = useXalanify();

  const colors = [
    { name: "Roxo", code: "#a855f7" },
    { name: "Rosa", code: "#ec4899" },
    { name: "Vermelho", code: "#ef4444" },
    { name: "Laranja", code: "#f97316" },
    { name: "Amarelo", code: "#eab308" },
    { name: "Verde", code: "#22c55e" },
  ];

  return (
    <div className="w-72 bg-gradient-to-br from-[#2a1a2a] to-[#1a0f1a] rounded-3xl p-6 border border-white/10 flex flex-col overflow-hidden">
      <h2 className="text-3xl font-black mb-6">Ajustes</h2>

      <div className="flex-1 overflow-y-auto custom-scroll space-y-6">
        {/* Perfil */}
        <div>
          <p className="text-xs font-black text-white/40 mb-3 uppercase tracking-wider">Conta</p>
          <button className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition text-xs font-bold">
            <div className="text-left">
              <p>Perfil</p>
              <p className="text-white/50 text-[10px] mt-1">{user?.email}</p>
            </div>
            <ChevronRight size={14} className="text-white/40" />
          </button>
        </div>

        {/* Cores */}
        <div>
          <p className="text-xs font-black text-white/40 mb-3 uppercase tracking-wider">Cores</p>
          <div className="grid grid-cols-3 gap-2">
            {colors.map((color) => (
              <button
                key={color.code}
                onClick={() => setThemeColor(color.code)}
                className={`w-full aspect-square rounded-2xl transition hover:scale-110 ${
                  themeColor === color.code ? "ring-2 ring-white scale-105" : ""
                }`}
                style={{ backgroundColor: color.code }}
                title={color.name}
              />
            ))}
          </div>
        </div>

        {/* Modo */}
        <div>
          <p className="text-xs font-black text-white/40 mb-3 uppercase tracking-wider">Modo</p>
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition">
            <span className="text-xs font-bold">OLED</span>
            <button
              onClick={() => setIsOLED(!isOLED)}
              className={`w-10 h-6 rounded-full transition flex items-center ${
                isOLED ? "bg-purple-600" : "bg-white/10"
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full transition ${
                  isOLED ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Informações */}
        <div>
          <p className="text-xs font-black text-white/40 mb-3 uppercase tracking-wider">App</p>
          <div className="space-y-2">
            <button className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition text-xs font-bold text-left">
              <span>Versão</span>
              <span className="text-white/50">2.0.0</span>
            </button>
            <button className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition text-xs font-bold text-left">
              <span>Desenvolvedor</span>
              <span className="text-white/50">XAL</span>
            </button>
          </div>
        </div>

        {/* Outros */}
        <div>
          <p className="text-xs font-black text-white/40 mb-3 uppercase tracking-wider">Outros</p>
          <div className="space-y-2">
            <button className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition text-xs font-bold">
              <span>Privacidade</span>
              <ChevronRight size={14} className="text-white/40" />
            </button>
            <button className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition text-xs font-bold">
              <span>Termos</span>
              <ChevronRight size={14} className="text-white/40" />
            </button>
          </div>
        </div>
      </div>

      {/* Logout */}
      <button className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl bg-red-500/10 hover:bg-red-500/20 transition text-red-400 font-bold text-xs uppercase tracking-wider mt-6">
        <LogOut size={14} />
        Sair
      </button>

      <div className="text-center pt-4 border-t border-white/5 text-[10px] text-white/40 font-bold mt-6">
        XALANIFY v2.0.0
      </div>
    </div>
  );
}