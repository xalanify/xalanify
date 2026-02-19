"use client";
import { Search, Plus, Heart, ChevronRight } from "lucide-react";
import { useXalanify, Track } from "@/context/XalanifyContext";
import TrackOptions from "@/components/TrackOptions";

export default function LibraryPage() {
  const { playlists, likedTracks, themeColor, view, setView, createPlaylist, setCurrentTrack, setIsPlaying } = useXalanify();

  if (view.type !== 'main') {
    const tracks = view.type === 'liked' ? likedTracks : (playlists.find(p => p.id === view.data.id)?.tracks || []);
    return (
      <div className="p-8 pt-16 animate-in fade-in">
        <button onClick={() => setView({ type: 'main' })} className="mb-8 opacity-40 font-black text-[10px] tracking-[0.2em] uppercase">← Voltar</button>
        <h1 className="text-6xl font-black-italic mb-10 text-white tracking-tighter">
          {view.type === 'liked' ? 'Favoritas' : view.data.name}
        </h1>
        <div className="space-y-4">
          {tracks.map((t: Track) => (
            <div key={t.id} className="flex items-center gap-5 glass p-4 rounded-[2.5rem] border border-white/5">
              <img src={t.thumbnail} className="w-16 h-16 rounded-[1.5rem] object-cover" onClick={() => { setCurrentTrack(t); setIsPlaying(true); }} />
              <div className="flex-1">
                <p className="font-bold text-sm italic">{t.title}</p>
                <p className="text-[10px] opacity-40 uppercase font-black tracking-widest">{t.artist}</p>
              </div>
              <TrackOptions track={t} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 pt-16 space-y-12 animate-in fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-6xl font-black-italic tracking-tighter text-white">Library</h1>
        <button 
          onClick={() => { const n = prompt("Nome da Playlist?"); if(n) createPlaylist(n); }}
          className="w-16 h-16 rounded-full glass flex items-center justify-center border border-white/10 active:scale-90 transition-all shadow-xl"
        >
          <Plus size={32} style={{ color: themeColor }} />
        </button>
      </div>

      <div onClick={() => setView({ type: 'liked' })} className="glass p-10 rounded-[3rem] flex items-center gap-8 border border-white/10 cursor-pointer active:scale-[0.98] transition-all shadow-2xl group">
        <div className="w-24 h-24 rounded-[2rem] flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110" style={{ background: themeColor }}>
          <Heart size={45} fill="white" color="white" />
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-1">Coleção Principal</p>
          <h2 className="text-4xl font-black-italic text-white">Favoritas</h2>
          <p className="text-xs opacity-40 font-bold uppercase tracking-tighter">{likedTracks.length} faixas guardadas</p>
        </div>
        <ChevronRight className="opacity-20 group-hover:translate-x-2 transition-all" />
      </div>

      <div className="space-y-6">
        <h3 className="font-black-italic text-2xl tracking-tight px-2">Playlists</h3>
        <div className="grid grid-cols-1 gap-4">
          {playlists.map(p => (
            <div key={p.id} onClick={() => setView({ type: 'playlist', data: p })} className="glass p-5 rounded-[2.5rem] flex items-center gap-6 border border-white/5 cursor-pointer hover:bg-white/5 transition-all">
              <div className="w-20 h-20 bg-zinc-900 rounded-[1.8rem] flex items-center justify-center overflow-hidden border border-white/5 shadow-lg">
                {p.tracks[0] ? <img src={p.tracks[0].thumbnail} className="w-full h-full object-cover" /> : <Plus className="opacity-10" />}
              </div>
              <div className="flex-1">
                <p className="font-black text-xl italic tracking-tight">{p.name}</p>
                <p className="text-[10px] font-black uppercase opacity-30 tracking-widest">{p.tracks.length} itens</p>
              </div>
              <ChevronRight size={20} className="opacity-10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}