"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { Heart, ListMusic, Plus, Play, Music } from "lucide-react";
import { useState } from "react";

export default function Library() {
  const { likedTracks, playlists, setCurrentTrack, setIsPlaying, themeColor, createPlaylist } = useXalanify();
  const [activePlaylist, setActivePlaylist] = useState<any | null>(null);

  if (activePlaylist) {
    return (
      <div className="p-6 space-y-6 animate-in fade-in duration-300">
        <button onClick={() => setActivePlaylist(null)} className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">← Voltar</button>
        <div className="flex items-center gap-6 py-4">
          <div className="w-32 h-32 bg-zinc-900 rounded-[2rem] flex items-center justify-center shadow-2xl border border-white/5">
            <Music size={40} className="text-zinc-700" />
          </div>
          <div>
            <h2 className="text-3xl font-black italic">{activePlaylist.name}</h2>
            <p className="text-[10px] font-bold text-zinc-500 uppercase">{activePlaylist.tracks.length} Músicas guardadas</p>
          </div>
        </div>
        
        <div className="space-y-2">
          {activePlaylist.tracks.map((track: any) => (
            <div key={track.id} onClick={() => { setCurrentTrack(track); setIsPlaying(true); }} className="flex items-center gap-4 p-4 bg-zinc-900/40 rounded-[1.8rem] border border-white/5 active:scale-95 transition-all">
               <img src={track.thumbnail} className="w-12 h-12 rounded-xl object-cover" />
               <div className="flex-1 truncate">
                 <p className="text-sm font-bold truncate">{track.title}</p>
                 <p className="text-[10px] text-zinc-500 font-black uppercase italic">{track.artist}</p>
               </div>
               <Play size={16} fill={themeColor} style={{color: themeColor}}/>
            </div>
          ))}
          {activePlaylist.tracks.length === 0 && <p className="text-center py-20 text-zinc-600 font-bold text-xs">Esta playlist está vazia.</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-10 pb-40">
      <h1 className="text-4xl font-black italic">Biblioteca</h1>

      {/* MÚSICAS QUE GOSTEI */}
      <section className="space-y-4">
        <h2 className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] px-2 flex items-center gap-2">
          <Heart size={12} fill={themeColor} style={{color: themeColor}}/> Favoritos
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
          {likedTracks.map(track => (
            <div key={track.id} onClick={() => { setCurrentTrack(track); setIsPlaying(true); }} className="min-w-[140px] space-y-2 group cursor-pointer">
              <div className="relative aspect-square">
                <img src={track.thumbnail} className="w-full h-full object-cover rounded-[2rem] shadow-lg" />
                <div className="absolute inset-0 bg-black/20 group-active:bg-black/40 rounded-[2rem] transition-colors" />
              </div>
              <p className="text-[11px] font-bold truncate px-1">{track.title}</p>
            </div>
          ))}
          {likedTracks.length === 0 && <div className="p-10 bg-zinc-900/20 rounded-[2rem] w-full text-center text-zinc-600 text-[10px] font-black uppercase">Sem favoritos</div>}
        </div>
      </section>

      {/* PLAYLISTS */}
      <section className="space-y-4">
        <h2 className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] px-2 flex items-center gap-2">
          <ListMusic size={12}/> As Tuas Playlists
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => { const n = prompt("Nome da Playlist:"); if(n) createPlaylist(n); }} className="aspect-square border border-dashed border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center gap-2 text-zinc-500">
            <Plus size={32}/>
            <span className="text-[10px] font-black uppercase tracking-widest">Nova Playlist</span>
          </button>
          
          {playlists.map(p => (
            <div key={p.id} onClick={() => setActivePlaylist(p)} className="aspect-square bg-zinc-900/60 border border-white/5 rounded-[2.5rem] p-6 flex flex-col justify-end group active:scale-95 transition-all">
              <Music size={24} className="mb-auto text-zinc-700 group-hover:text-white transition-colors" />
              <p className="font-black text-lg truncate">{p.name}</p>
              <p className="text-[10px] font-bold text-zinc-500 uppercase">{p.tracks.length} Músicas</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}