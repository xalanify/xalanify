"use client";
import { useState } from "react";
import { Plus, Heart, Music, Play, ChevronLeft, ListMusic } from "lucide-react";
import { useXalanify } from "@/context/XalanifyContext";
import TrackOptions from "@/components/TrackOptions";

export default function LibraryPage() {
  const { playlists, likedTracks, createPlaylist, themeColor, setCurrentTrack, setIsPlaying } = useXalanify();
  const [view, setView] = useState<{ type: 'main' | 'liked' | 'playlist', data?: any }>({ type: 'main' });

  const playTrack = (track: any) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  // Ecrã secundário para ver músicas de uma lista
  if (view.type !== 'main') {
    const title = view.type === 'liked' ? "Favoritos" : view.data.name;
    const tracks = view.type === 'liked' ? likedTracks : view.data.tracks;

    return (
      <div className="p-8 pb-40 animate-app-entry">
        <button onClick={() => setView({ type: 'main' })} className="mb-8 flex items-center gap-2 opacity-50 hover:opacity-100">
          <ChevronLeft size={20} /> <span className="font-bold text-[10px] uppercase">Voltar</span>
        </button>
        <h1 className="text-4xl font-black italic mb-10 tracking-tighter">{title}</h1>
        <div className="space-y-2">
          {tracks.map((track: any) => (
            <div key={track.id} className="flex items-center justify-between glass p-3 rounded-[1.8rem]">
              <div onClick={() => playTrack(track)} className="flex items-center gap-4 flex-1 cursor-pointer">
                <img src={track.thumbnail} className="w-12 h-12 rounded-xl object-cover" alt="" />
                <div>
                  <p className="text-sm font-bold italic">{track.title}</p>
                  <p className="text-[10px] opacity-40 uppercase font-black">{track.artist}</p>
                </div>
              </div>
              <TrackOptions track={track} />
            </div>
          ))}
          {tracks.length === 0 && <p className="text-center opacity-20 py-10 font-bold italic">Vazio por aqui...</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 pb-40 animate-app-entry">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-5xl font-black italic tracking-tighter">Library</h1>
        <button 
          onClick={() => {
            const name = prompt("Nome da nova playlist?");
            if (name) createPlaylist(name);
          }}
          className="w-14 h-14 rounded-full flex items-center justify-center glass border-white/10"
        >
          <Plus size={28} style={{color: themeColor}} />
        </button>
      </div>

      <div className="space-y-4">
        {/* Card Favoritos */}
        <div 
          onClick={() => setView({ type: 'liked' })}
          className="glass p-6 rounded-[2.5rem] flex items-center gap-5 hover:bg-white/5 cursor-pointer transition-all border-white/5"
        >
          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center">
            <Heart size={28} style={{ color: themeColor }} fill={themeColor} />
          </div>
          <div>
            <p className="font-black text-xl italic tracking-tight">Músicas Gostadas</p>
            <p className="text-[10px] font-black uppercase opacity-30">{likedTracks.length} músicas</p>
          </div>
        </div>

        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-20 mt-10 mb-4 ml-4">Playlists</p>
        
        {playlists.map(p => (
           <div 
            key={p.id} 
            onClick={() => setView({ type: 'playlist', data: p })}
            className="glass p-5 rounded-[2.5rem] flex items-center gap-5 hover:bg-white/5 cursor-pointer border-white/5"
           >
            <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center">
               <ListMusic size={24} className="opacity-20" />
            </div>
            <p className="font-black text-lg italic tracking-tight flex-1">{p.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}