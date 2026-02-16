"use client";
import { useState } from "react";
import { Plus, Heart, ListMusic, ChevronLeft, Loader2, Trash2, X } from "lucide-react";
import { useXalanify } from "@/context/XalanifyContext";
import { getYoutubeId } from "@/lib/musicApi";

export default function LibraryPage() {
  const { 
    playlists, likedTracks, createPlaylist, deletePlaylist, removeTrackFromPlaylist,
    themeColor, setCurrentTrack, setIsPlaying, currentTrack, setActiveQueue, toggleLike
  } = useXalanify();
  
  const [view, setView] = useState<{ type: 'main' | 'liked' | 'playlist', data?: any }>({ type: 'main' });
  const [isFetchingId, setIsFetchingId] = useState<string | null>(null);

  const handlePlayTrack = async (track: any, collection: any[]) => {
    setActiveQueue(collection);
    if (track.youtubeId) {
      setCurrentTrack(track);
      return;
    }
    setIsFetchingId(track.id);
    const ytId = await getYoutubeId(track.title, track.artist);
    if (ytId) setCurrentTrack({ ...track, youtubeId: ytId });
    setIsFetchingId(null);
  };

  if (view.type !== 'main') {
    const title = view.type === 'liked' ? "Favoritas" : view.data.name;
    const tracks = view.type === 'liked' ? likedTracks : view.data.tracks;

    return (
      <div className="p-8 pb-40 animate-app-entry">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => setView({ type: 'main' })} className="flex items-center gap-2 opacity-50 hover:opacity-100">
            <ChevronLeft size={20} /> <span className="font-bold text-[10px] uppercase tracking-widest">Voltar</span>
          </button>
          {view.type === 'playlist' && (
            <button onClick={() => { if(confirm("Eliminar playlist?")) { deletePlaylist(view.data.id); setView({type:'main'}); } }} className="text-red-500 opacity-50 hover:opacity-100">
              <Trash2 size={18} />
            </button>
          )}
        </div>

        <h1 className="text-4xl font-black mb-10 tracking-tighter">{title}</h1>
        <div className="space-y-2">
          {tracks.map((track: any) => (
            <div key={track.id} className="flex items-center gap-4 glass p-3 rounded-[2rem] border-white/5">
              <div onClick={() => handlePlayTrack(track, tracks)} className="flex-1 flex items-center gap-4 cursor-pointer">
                <div className="relative">
                  <img src={track.thumbnail} className="w-14 h-14 rounded-2xl object-cover" alt="" />
                  {isFetchingId === track.id && <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center"><Loader2 className="animate-spin text-white" size={20} /></div>}
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: currentTrack?.id === track.id ? themeColor : 'white' }}>{track.title}</p>
                  <p className="text-[10px] opacity-40 uppercase font-black">{track.artist}</p>
                </div>
              </div>
              <button 
                onClick={() => view.type === 'liked' ? toggleLike(track) : removeTrackFromPlaylist(view.data.id, track.id)}
                className="p-3 opacity-20 hover:opacity-100 text-red-500"
              >
                <X size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 pb-40 animate-app-entry">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-6xl font-black tracking-tighter">Library</h1>
        <button onClick={() => { const n = prompt("Nome?"); if(n) createPlaylist(n); }} className="w-14 h-14 rounded-full glass flex items-center justify-center border-white/10">
          <Plus size={28} style={{color: themeColor}} />
        </button>
      </div>

      <div className="space-y-4">
        <div onClick={() => setView({ type: 'liked' })} className="glass p-8 rounded-[3rem] flex items-center gap-6 border-white/5">
          <div className="w-20 h-20 bg-white/5 rounded-[1.8rem] flex items-center justify-center shadow-2xl">
            <Heart size={36} style={{ color: themeColor }} fill={themeColor} />
          </div>
          <div>
            <p className="font-black text-2xl tracking-tight">Favoritas</p>
            <p className="text-[10px] font-black uppercase opacity-30 tracking-widest">{likedTracks.length} faixas</p>
          </div>
        </div>

        {playlists.map(p => (
           <div key={p.id} onClick={() => setView({ type: 'playlist', data: p })} className="glass p-6 rounded-[2.5rem] flex items-center gap-5 border-white/5">
            <div className="w-16 h-16 bg-zinc-900 rounded-[1.4rem] flex items-center justify-center border border-white/5">
               <ListMusic size={24} className="opacity-20 text-white" />
            </div>
            <p className="font-black text-xl tracking-tight flex-1 truncate">{p.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}