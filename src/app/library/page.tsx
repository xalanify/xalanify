"use client";
export const dynamic = "force-dynamic"; // FORÇA O BUILD A NÃO FALHAR AQUI

import { useXalanify } from "@/context/XalanifyContext";
import { Plus, Music, Heart } from "lucide-react";

export default function Library() {
  const { likedTracks, setCurrentTrack, setIsPlaying, themeColor, playlists, createPlaylist } = useXalanify();

  const handleCreate = () => {
    const name = prompt("Nome da nova playlist:");
    if (name) createPlaylist(name);
  };

  return (
    <div className="space-y-8 pb-24 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <header className="flex justify-between items-center px-1">
        <h1 className="text-3xl font-black tracking-tighter">Biblioteca</h1>
        <button onClick={handleCreate} className="p-3 rounded-full bg-white/5 active:scale-90 transition-all">
          <Plus size={24} style={{ color: themeColor }} />
        </button>
      </header>

      <section className="space-y-4">
        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] px-1">As Tuas Playlists</p>
        <div className="grid grid-cols-2 gap-4">
          {playlists?.map((pl) => (
            <div key={pl.id} className="aspect-square rounded-[2rem] bg-zinc-900 border border-white/5 flex flex-col items-center justify-center p-4 text-center hover:bg-white/5 transition-all">
               <Music size={32} className="text-zinc-700 mb-2" />
               <p className="font-bold truncate w-full">{pl.name}</p>
               <p className="text-[10px] text-zinc-500 uppercase font-black">0 músicas</p>
            </div>
          ))}
        </div>
      </section>
      
      <div className="space-y-4">
        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] px-1">Curtidas Recentemente</p>
        {!likedTracks || likedTracks.length === 0 ? (
          <div className="p-10 border-2 border-dashed border-white/5 rounded-[2.5rem] text-center">
            <Heart size={24} className="mx-auto text-zinc-800 mb-2" />
            <p className="text-zinc-600 text-xs italic">Nada por aqui ainda.</p>
          </div>
        ) : (
          likedTracks.map((track) => (
            <div 
              key={track.id}
              onClick={() => { setCurrentTrack(track); setIsPlaying(true); }}
              className="flex items-center gap-4 p-3 bg-zinc-900/50 border border-white/5 rounded-[1.8rem] active:scale-95 transition-all"
            >
              <img src={track.thumbnail} className="w-12 h-12 rounded-xl object-cover" alt="" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{track.title}</p>
                <p className="text-[10px] text-zinc-500 uppercase font-black">{track.artist}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}