"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { Play, Heart, Plus, Music } from "lucide-react";

export default function Library() {
  const { likedTracks, setCurrentTrack, setIsPlaying, themeColor, playlists, createPlaylist } = useXalanify();

  const handleCreate = () => {
    const name = prompt("Nome da nova playlist:");
    if (name) createPlaylist(name);
  };

  return (
    <div className="space-y-8 pb-24 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <header className="flex justify-between items-center px-1">
        <h1 className="text-3xl font-bold tracking-tight">Biblioteca</h1>
        <button onClick={handleCreate} className="p-2 rounded-full bg-white/5 active:scale-90 transition-all">
          <Plus size={24} style={{ color: themeColor }} />
        </button>
      </header>

      {/* Secção de Playlists */}
      <section className="space-y-4">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] px-1">As Tuas Playlists</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="aspect-square rounded-3xl bg-gradient-to-br from-zinc-800 to-black p-5 flex flex-col justify-end border border-white/5">
            <Heart size={32} style={{ color: themeColor }} fill="currentColor" className="mb-2" />
            <p className="font-bold">Favoritas</p>
            <p className="text-[10px] text-gray-500">{likedTracks?.length || 0} músicas</p>
          </div>
          {playlists.map(pl => (
            <div key={pl.id} className="aspect-square rounded-3xl bg-zinc-900 p-5 flex flex-col justify-end border border-white/5">
               <Music size={32} className="text-zinc-700 mb-2" />
               <p className="font-bold truncate">{pl.name}</p>
               <p className="text-[10px] text-gray-500">0 músicas</p>
            </div>
          ))}
        </div>
      </section>
      
      {/* Lista de Músicas Curtidas */}
      <div className="space-y-2">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] px-1">Curtidas Recentemente</p>
        {!likedTracks || likedTracks.length === 0 ? (
          <p className="text-zinc-600 text-sm italic p-4 text-center">Ainda não tens favoritos.</p>
        ) : (
          likedTracks.map((track) => (
            <div 
              key={track.id}
              onClick={() => { setCurrentTrack(track); setIsPlaying(true); }}
              className="flex items-center gap-3 p-2 bg-white/[0.02] border border-white/5 rounded-2xl active:bg-white/10 transition-all"
            >
              <img src={track.thumbnail} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" alt="" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{track.title}</p>
                <p className="text-[11px] text-zinc-500 truncate">{track.artist}</p>
              </div>
              <Play size={18} style={{ color: themeColor }} fill="currentColor" className="mr-2" />
            </div>
          ))
        )}
      </div>
    </div>
  );
}