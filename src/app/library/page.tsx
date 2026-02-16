"use client";
import { Plus, Heart, Music, Play, ChevronRight } from "lucide-react";
import { useXalanify } from "@/context/XalanifyContext";

export default function LibraryPage() {
  const { playlists, likedTracks, createPlaylist, themeColor, setCurrentTrack, setIsPlaying } = useXalanify();

  const playCollection = (tracks: any[]) => {
    if (tracks.length > 0) {
      setCurrentTrack(tracks[0]);
      setIsPlaying(true);
    }
  };

  return (
    <div className="p-8 pb-40 animate-app-entry">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-5xl font-black italic tracking-tighter">Library</h1>
        <button 
          onClick={() => {
            const n = prompt("Nome da nova playlist?");
            if(n) createPlaylist(n);
          }}
          className="w-14 h-14 rounded-full flex items-center justify-center glass hover:scale-110 active:scale-90 transition-all border-white/10 shadow-2xl"
        >
          <Plus size={28} style={{color: themeColor}} />
        </button>
      </div>

      <div className="space-y-4">
        {/* Favoritos */}
        <div 
          onClick={() => playCollection(likedTracks)}
          className="group relative glass p-5 rounded-[2.5rem] flex items-center gap-5 hover:bg-white/5 cursor-pointer transition-all border-white/5"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-[1.8rem] flex items-center justify-center shadow-2xl group-hover:rotate-3 transition-transform">
            <Heart fill="white" size={32} />
          </div>
          <div className="flex-1">
            <p className="font-black text-xl italic tracking-tight">Favoritos</p>
            <p className="text-[10px] font-black uppercase opacity-30 tracking-widest">{likedTracks.length} músicas salvas</p>
          </div>
          <ChevronRight className="opacity-10 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Listagem de Playlists */}
        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-20 mt-10 mb-4 ml-4">As tuas Playlists</p>
        
        {playlists.map(p => (
           <div 
            key={p.id} 
            onClick={() => playCollection(p.tracks)}
            className="group relative glass p-5 rounded-[2.5rem] flex items-center gap-5 hover:bg-white/5 cursor-pointer transition-all border-white/5"
           >
            <div className="w-20 h-20 bg-zinc-800 rounded-[1.8rem] flex items-center justify-center overflow-hidden border border-white/5 shadow-xl">
               <Music size={32} className="opacity-20" />
            </div>
            <div className="flex-1">
              <p className="font-black text-xl italic tracking-tight truncate w-40">{p.name}</p>
              <p className="text-[10px] font-black uppercase opacity-30 tracking-widest">{p.tracks.length} faixas</p>
            </div>
            <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
              <Play size={16} fill="white" />
            </button>
          </div>
        ))}

        {playlists.length === 0 && (
          <div className="py-20 text-center opacity-20 border-2 border-dashed border-white/5 rounded-[3rem]">
            <Music size={40} className="mx-auto mb-4" />
            <p className="text-[10px] font-black uppercase">Vazio por aqui</p>
          </div>
        )}
      </div>
    </div>
  );
}