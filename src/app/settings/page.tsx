"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { User, Palette, Info, LogOut, History } from "lucide-react";

export default function Settings() {
  const { user, themeColor, setThemeColor, likedTracks, playlists } = useXalanify();

  const updates = [
    { v: "v1.0.2", desc: "Design Premium (musi style), Sistema de Cores e Playlists." },
    { v: "v1.0.1", desc: "Correção de erros de compilação e motor de áudio YouTube." },
    { v: "v1.0.0", desc: "Lançamento oficial da Beta com busca e favoritos." }
  ];

  return (
    <div className="space-y-8 pb-32 p-4 animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold">Settings</h1>

      <section className="bg-[#18181b] p-4 rounded-2xl flex items-center gap-4 border border-white/5">
        <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center border border-white/10 text-2xl font-bold">
          {user?.[0] || <User />}
        </div>
        <div>
          <h2 className="text-xl font-bold">{user || "Visitante"}</h2>
          <p className="text-xs text-gray-500">{likedTracks.length} likes · {playlists.length} playlists</p>
        </div>
      </section>

      <section className="space-y-4">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2"><Palette size={12} /> Theme Color</p>
        <div className="grid grid-cols-4 gap-3">
          {["#a855f7", "#f59e0b", "#f43f5e", "#14b8a6", "#3b82f6", "#f97316", "#22c55e", "#ec4899"].map((color) => (
            <button key={color} onClick={() => setThemeColor(color)} className="p-3 bg-[#18181b] rounded-2xl border border-white/5 flex flex-col items-center gap-1 active:scale-95 transition-all">
              <div className="w-8 h-8 rounded-full" style={{ backgroundColor: color }} />
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2"><History size={12} /> Logs de Sistema</p>
        <div className="bg-[#18181b] rounded-2xl border border-white/5 divide-y divide-white/5">
          {updates.map((upd) => (
            <div key={upd.v} className="p-4">
              <p className="text-sm font-bold text-[var(--primary)]">{upd.v}</p>
              <p className="text-xs text-gray-400 mt-1">{upd.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <button className="w-full p-4 bg-red-500/10 text-red-500 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all">
        <LogOut size={18} /> Log Out
      </button>
    </div>
  );
}