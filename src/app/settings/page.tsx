"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { User, Palette, Info, LogOut } from "lucide-react";

export default function Settings() {
  const { user, setThemeColor, likedTracks, playlists, themeColor } = useXalanify();

  const themes = [
    { name: 'Purple', hex: "#a855f7" }, { name: 'Amber', hex: "#f59e0b" },
    { name: 'Rose', hex: "#f43f5e" }, { name: 'Teal', hex: "#14b8a6" },
    { name: 'Blue', hex: "#3b82f6" }, { name: 'Orange', hex: "#f97316" },
    { name: 'Green', hex: "#22c55e" }, { name: 'Pink', hex: "#ec4899" }
  ];

  return (
    <div className="space-y-8 pb-40 animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold px-2">Settings</h1>

      <section>
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-3 px-2">Profile</p>
        <div className="musi-card p-5 flex items-center gap-4">
          <div className="w-14 h-14 bg-[#211d29] rounded-full flex items-center justify-center text-2xl border border-white/5" style={{ color: themeColor }}>
            {user?.[0]?.toUpperCase() || <User size={28} />}
          </div>
          <div>
            <h2 className="text-xl font-bold">{user || "1"}</h2>
            <p className="text-xs text-gray-400">{likedTracks.length} likes · {playlists.length} playlists</p>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-3 px-2 text-gray-500">
          <Palette size={14} />
          <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Theme Color</p>
        </div>
        <div className="musi-card p-5 grid grid-cols-4 gap-y-6">
          {themes.map((t) => (
            <button key={t.hex} onClick={() => setThemeColor(t.hex)} className="flex flex-col items-center gap-2 active:scale-90 transition-all">
              <div className="w-10 h-10 rounded-full border-2" style={{ backgroundColor: t.hex, borderColor: themeColor === t.hex ? 'white' : 'transparent' }} />
              <span className="text-[10px] text-gray-400 font-medium">{t.name}</span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-3 px-2 text-gray-500">
          <Info size={14} />
          <p className="text-[10px] font-bold uppercase tracking-[0.2em]">About</p>
        </div>
        <div className="musi-card p-5 space-y-4 text-sm font-medium">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Version</span>
            <span>1.0.2</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Sources</span>
            <span>YouTube + JioSaavn</span>
          </div>
          <div className="flex justify-between items-center text-white">
            <span className="text-gray-400">Storage</span>
            <span>Local (device)</span>
          </div>
        </div>
      </section>

      <button className="w-full p-4 bg-red-500/10 text-red-500 rounded-[20px] font-bold flex items-center justify-center gap-2 active:scale-95 transition-all border border-red-500/10">
        <LogOut size={18} /> Log Out
      </button>
    </div>
  );
}