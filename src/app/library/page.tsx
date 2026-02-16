"use client";
import { useState } from "react";
import { Plus, Heart, Music, Play, ChevronLeft, ListMusic, Loader2 } from "lucide-react";
import { useXalanify } from "@/context/XalanifyContext";
import { getYoutubeId } from "@/lib/musicApi";
import TrackOptions from "@/components/TrackOptions";

export default function LibraryPage() {
  const { playlists, likedTracks, createPlaylist, themeColor, setCurrentTrack, setIsPlaying, addLog } = useXalanify();
  const [view, setView] = useState<{ type: 'main' | 'liked' | 'playlist', data?: any }>({ type: 'main' });
  const [isFetchingId, setIsFetchingId] = useState<string | null>(null);

  const handlePlayTrack = async (track: any) => {
    if (track.youtubeId) {
      setCurrentTrack(track);
      setIsPlaying(true);
      return;
    }

    setIsFetchingId(track.id);
    addLog(`A buscar stream para: ${track.title}`);

    try {
      const ytId = await getYoutubeId(track.title, track.artist);
      if (ytId) {
        setCurrentTrack({ ...track, youtubeId: ytId });
        setIsPlaying(true);
      }
    } catch (e) {
      addLog("Erro ao carregar faixa na biblioteca");
    } finally {
      setIsFetchingId(null);
    }
  };

  if (view.type !== 'main') {
    const title = view.type === 'liked' ? "Favoritos" : view.data.name;
    const tracks = view.type === 'liked' ? likedTracks : view.data.tracks;

    return (
      <div className="p-8 pb-40 animate-app-entry">
        <button onClick={() => setView({ type: 'main' })} className="mb-8 flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
          <ChevronLeft size={20} /> <span className="font-bold text-[10px] uppercase italic">Biblioteca</span>
        </button>
        <h1 className="text-4xl font-black italic mb-10 tracking-tighter">{title}</h1>
        <div className="space-y-2">
          {tracks.map((track: any) => (
            <div key={track.id} className="flex items-center justify-between glass p-3 rounded-[2rem] border-white/5 group">
              <div onClick={() => handlePlayTrack(track)} className="flex items-center gap-4 flex-1 cursor-pointer">
                <div className="relative">
                  <img src={track.thumbnail} className="w-14 h-14 rounded-2xl object-cover shadow-lg" alt="" />
                  {isFetchingId === track.id && (
                    <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center">
                      <Loader2 className="animate-spin text-white" size={20} />
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold italic">{track.title}</p>
                  <p className="text-[10px] opacity-40 uppercase font-black tracking-tighter">{track.artist}</p>
                </div>
              </div>
              <TrackOptions track={track} />
            </div>
          ))}
          {tracks.length === 0 && <p className="text-center opacity-20 py-20 font-bold italic">Nada por aqui ainda...</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 pb-40 animate-app-entry">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-6xl font-black italic tracking-tighter">Library</h1>
        <button 
          onClick={() => {
            const name = prompt("Nome da nova playlist?");
            if (name) createPlaylist(name);
          }}
          className="w-14 h-14 rounded-full flex items-center justify-center glass border-white/10 hover:scale-110 transition-all active:scale-90"
        >
          <Plus size={28} style={{color: themeColor}} />
        </button>
      </div>

      <div className="space-y-4">
        <div 
          onClick={() => setView({ type: 'liked' })}
          className="glass p-8 rounded-[3rem] flex items-center gap-6 hover:bg-white/5 cursor-pointer transition-all border-white/5 relative overflow-hidden group"
        >
          <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity -z-10" style={{ backgroundColor: themeColor }} />
          <div className="w-20 h-20 bg-white/5 rounded-[1.8rem] flex items-center justify-center shadow-2xl">
            <Heart size={36} style={{ color: themeColor }} fill={themeColor} />
          </div>
          <div>
            <p className="font-black text-2xl italic tracking-tight">Gostadas</p>
            <p className="text-[10px] font-black uppercase opacity-30 tracking-[0.2em]">{likedTracks.length} faixas</p>
          </div>
        </div>

        <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-20 mt-12 mb-6 ml-6">Playlists</p>
        
        {playlists.map(p => (
           <div 
            key={p.id} 
            onClick={() => setView({ type: 'playlist', data: p })}
            className="glass p-6 rounded-[2.5rem] flex items-center gap-5 hover:bg-white/5 cursor-pointer border-white/5 transition-all"
           >
            <div className="w-16 h-16 bg-zinc-900 rounded-[1.4rem] flex items-center justify-center border border-white/5 shadow-lg">
               <ListMusic size={24} className="opacity-20 text-white" />
            </div>
            <p className="font-black text-xl italic tracking-tight flex-1 truncate">{p.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}