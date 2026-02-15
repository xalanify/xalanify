"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { Heart, ListMusic, Play, Music, ArrowLeft, Trash2 } from "lucide-react";
import { useState } from "react";

export default function Library() {
  const { likedTracks, playlists, setCurrentTrack, setIsPlaying, themeColor } = useXalanify();
  const [activePlaylist, setActivePlaylist] = useState<any | null>(null);

  const handlePlay = (track: any) => {
    setIsPlaying(false);
    setCurrentTrack(track);
    setTimeout(() => setIsPlaying(true), 300);
  };

  if (activePlaylist) {
    return (
      <div className="p-6 space-y-6 animate-in slide-in-from-right duration-300">
        <button onClick={() => setActivePlaylist(null)} className="flex items-center gap-2 text-[10px] font-black uppercase text-zinc-500 tracking-widest bg-white/5 py-2 px-4 rounded-full">
          <ArrowLeft size={14}/> Voltar
        </button>

        <div className="flex items-center gap-6 pt-4">
          <div className="w-32 h-32 rounded-[2rem] bg-zinc-800 shadow-2xl overflow-hidden">
            {activePlaylist.image ? <img src={activePlaylist.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ListMusic size={40}/></div>}
          </div>
          <div>
            <h2 className="text-3xl font-black italic leading-tight">{activePlaylist.name}</h2>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">{activePlaylist.tracks.length} Músicas</p>
          </div>
        </div>

        <div className="space-y-2 pt-4">
          {activePlaylist.tracks.map((track: any) => (
            <div key={track.id} onClick={() => handlePlay(track)} className="flex items-center justify-between p-3 bg-zinc-900/40 border border-white/5 rounded-[1.8rem] hover:bg-zinc-900 transition-all cursor-pointer">
              <div className="flex items-center gap-4 truncate">
                <img src={track.thumbnail} className="w-10 h-10 rounded-xl object-cover" alt="" />
                <div className="truncate">
                  <p className="text-sm font-bold truncate">{track.title}</p>
                  <p className="text-[10px] text-zinc-500 uppercase font-black">{track.artist}</p>
                </div>
              </div>
              <Play size={14} fill={themeColor} style={{ color: themeColor }}/>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-10">
      <h1 className="text-4xl font-black italic">Biblioteca</h1>

      <section className="space-y-4">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-zinc-500 tracking-widest px-2"><Heart size={12}/> Músicas Curtidas</div>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {likedTracks.length === 0 ? (
            <div className="w-full p-10 border-2 border-dashed border-white/5 rounded-[3rem] text-center text-zinc-600 text-[10px] font-black uppercase">Vazio</div>
          ) : (
            likedTracks.map(track => (
              <div key={track.id} onClick={() => handlePlay(track)} className="min-w-[140px] bg-zinc-900/60 p-4 rounded-[2.5rem] border border-white/5 space-y-3">
                <img src={track.thumbnail} className="w-full aspect-square rounded-[1.8rem] object-cover" alt="" />
                <p className="text-[11px] font-black truncate text-center">{track.title}</p>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-zinc-500 tracking-widest px-2"><ListMusic size={12}/> As Minhas Playlists</div>
        <div className="grid grid-cols-2 gap-4">
          {playlists.map(p => (
            <div key={p.id} onClick={() => setActivePlaylist(p)} className="aspect-square bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-5 flex flex-col justify-end gap-1 cursor-pointer hover:bg-zinc-900 transition-colors">
              <p className="font-black text-lg italic leading-tight">{p.name}</p>
              <p className="text-[9px] font-black uppercase text-zinc-500">{p.tracks.length} Itens</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}