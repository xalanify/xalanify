"use client";
import { Plus, Heart, Music, Play } from "lucide-react";
import { useXalanify } from "@/context/XalanifyContext";

export default function LibraryPage() {
  const { playlists, likedTracks, createPlaylist, themeColor } = useXalanify();

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-5xl font-black italic tracking-tighter">Library</h1>
        <button 
          onClick={() => {
            const n = prompt("Nome da Playlist?");
            if(n) createPlaylist(n);
          }}
          className="w-12 h-12 rounded-full flex items-center justify-center bg-zinc-900 hover:scale-110 transition-transform shadow-xl"
        >
          <Plus size={24} style={{color: themeColor}} />
        </button>
      </div>

      <div className="space-y-6">
        {/* PLAYLIST DE GOSTADAS - SÓ ENTRAS AQUI PARA VER AS MÚSICAS CURTIDAS */}
        <div className="group relative bg-zinc-900/30 p-4 rounded-[2.5rem] border border-white/5 flex items-center gap-5 hover:bg-zinc-800/50 cursor-pointer transition-all">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-[1.8rem] flex items-center justify-center shadow-2xl">
            <Heart fill="white" size={32} />
          </div>
          <div>
            <p className="font-black text-lg italic tracking-tight">Músicas Gostadas</p>
            <p className="text-[10px] font-black uppercase opacity-30 tracking-widest">{likedTracks.length} faixas</p>
          </div>
        </div>

        {playlists.map(p => (
           <div key={p.id} className="group relative bg-zinc-900/30 p-4 rounded-[2.5rem] border border-white/5 flex items-center gap-5 hover:bg-zinc-800/50 cursor-pointer transition-all">
            <div className="w-20 h-20 bg-zinc-800 rounded-[1.8rem] flex items-center justify-center overflow-hidden">
               <Music size={32} className="opacity-20" />
            </div>
            <div>
              <p className="font-black text-lg italic tracking-tight truncate w-40">{p.name}</p>
              <p className="text-[10px] font-black uppercase opacity-30 tracking-widest">Playlist</p>
            </div>
            <Play className="absolute right-6 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0" style={{color: themeColor}} />
          </div>
        ))}
      </div>
    </div>
  );
}