"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { Plus, Music, Heart, Disc, Play } from "lucide-react"; // FIX: Adicionado 'Play' aqui

export default function Library() {
  const { likedTracks, setCurrentTrack, setIsPlaying, themeColor, playlists, createPlaylist } = useXalanify();

  return (
    <div className="space-y-10 pb-32 pt-12 px-6 flex flex-col items-center w-full">
      <header className="w-full max-w-md flex justify-between items-center">
        <div className="text-left">
          <h1 className="text-3xl font-black tracking-tighter">Coleção</h1>
          <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-bold">O teu universo musical</p>
        </div>
        <button 
          onClick={() => { const n = prompt("Nome da Playlist:"); if(n) createPlaylist(n); }}
          className="p-4 rounded-full bg-white/5 hover:bg-white/10 active:scale-90 transition-all border border-white/5"
        >
          <Plus size={20} style={{ color: themeColor }} />
        </button>
      </header>

      {/* Grid de Playlists Centralizado */}
      <div className="w-full max-w-md grid grid-cols-2 gap-4">
        <div className="aspect-square rounded-[2.5rem] bg-zinc-900 border border-white/5 p-6 flex flex-col items-center justify-center text-center group hover:bg-zinc-800 transition-all cursor-pointer">
          <Heart size={32} style={{ color: themeColor }} fill="currentColor" className="mb-3 group-hover:scale-110 transition-transform" />
          <p className="font-bold text-sm">Favoritas</p>
          <p className="text-[9px] text-zinc-500 uppercase font-black mt-1">{likedTracks?.length || 0} faixas</p>
        </div>
        
        {playlists.map(pl => (
          <div key={pl.id} className="aspect-square rounded-[2.5rem] bg-zinc-900 border border-white/5 p-6 flex flex-col items-center justify-center text-center hover:bg-zinc-800 transition-all cursor-pointer">
             <Disc size={32} className="text-zinc-700 mb-3" />
             <p className="font-bold text-sm truncate w-full">{pl.name}</p>
             <p className="text-[9px] text-zinc-500 uppercase font-black mt-1">Playlist</p>
          </div>
        ))}
      </div>

      {/* Lista de Recentes Centralizada */}
      <div className="w-full max-w-md space-y-4">
        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] text-center">Recentemente Curtidas</p>
        {!likedTracks || likedTracks.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-white/10 rounded-[2.5rem] flex flex-col items-center gap-2">
            <Music size={24} className="text-zinc-800" />
            <p className="text-zinc-600 text-[10px] uppercase font-bold tracking-widest">A tua lista está vazia</p>
          </div>
        ) : (
          likedTracks.map((track) => (
            <div 
              key={track.id}
              onClick={() => { setCurrentTrack(track); setIsPlaying(true); }}
              className="flex items-center gap-4 p-3 bg-zinc-900/40 border border-white/5 rounded-[1.8rem] active:scale-95 transition-all group"
            >
              <img src={track.thumbnail} className="w-12 h-12 rounded-2xl object-cover shadow-lg" alt="" />
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-bold truncate leading-tight">{track.title}</p>
                <p className="text-[10px] text-zinc-500 uppercase font-black truncate mt-1 tracking-wider">{track.artist}</p>
              </div>
              <div className="p-2 rounded-full bg-white/5 opacity-0 group-hover:opacity-100 transition-all">
                <Play size={16} style={{ color: themeColor }} fill="currentColor" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}