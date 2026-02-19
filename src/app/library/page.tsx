"use client";
import { Search, Plus, Heart, ChevronRight, MoreVertical } from "lucide-react";
import { useXalanify, Track } from "@/context/XalanifyContext";
import TrackOptions from "@/components/TrackOptions";

export default function LibraryPage() {
  const { playlists, likedTracks, themeColor, view, setView, createPlaylist, setCurrentTrack, setIsPlaying } = useXalanify();

  if (view.type !== 'main') {
    const tracks = view.type === 'liked' ? likedTracks : (playlists.find(p => p.id === view.data.id)?.tracks || []);
    return (
      <div className="p-6 pt-12 animate-in fade-in">
        <button onClick={() => setView({ type: 'main' })} className="mb-8 opacity-50 font-bold text-[10px] tracking-widest uppercase">← Voltar</button>
        <h1 className="text-4xl font-bold mb-10">{view.type === 'liked' ? 'Favoritas' : view.data.name}</h1>
        <div className="space-y-3">
          {tracks.map((t: Track) => (
            <div key={t.id} className="flex items-center gap-4 glass p-3 rounded-[2rem] border-white/5">
              <img src={t.thumbnail} className="w-14 h-14 rounded-2xl object-cover shadow-lg" onClick={() => { setCurrentTrack(t); setIsPlaying(true); }} />
              <div className="flex-1">
                <p className="font-bold text-sm">{t.title}</p>
                <p className="text-[10px] opacity-40 uppercase font-black">{t.artist}</p>
              </div>
              <TrackOptions track={t} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 pt-12 space-y-8 animate-in fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold tracking-tight">Biblioteca</h1>
        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" className="w-10 h-10 rounded-full border border-white/10" />
      </div>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={18} />
        <input type="text" placeholder="Procurar na biblioteca" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm" />
      </div>

      <button 
        onClick={() => { const n = prompt("Nome da playlist?"); if(n) createPlaylist(n); }}
        className="w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all" 
        style={{ backgroundColor: themeColor }}
      >
        <Plus size={20} className="bg-white/20 rounded-full p-0.5" /> Criar Playlist
      </button>

      <div onClick={() => setView({ type: 'liked' })} className="relative overflow-hidden p-6 rounded-[2.5rem] bg-gradient-to-br from-white/10 to-transparent border border-white/10 cursor-pointer active:scale-95 transition-all">
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl" style={{ background: themeColor }}>
            <Heart size={30} fill="white" color="white" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-0.5">Destaque</p>
            <h2 className="text-2xl font-bold text-white">Músicas Favoritas</h2>
            <p className="text-xs opacity-40 font-medium">{likedTracks.length} faixas guardadas</p>
          </div>
          <ChevronRight className="opacity-20" />
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center px-1">
          <h3 className="font-bold text-lg">As Tuas Playlists</h3>
          <span className="text-[10px] font-black uppercase text-blue-500 tracking-widest">Ver todas</span>
        </div>
        <div className="space-y-4">
          {playlists.map(p => (
            <div key={p.id} onClick={() => setView({ type: 'playlist', data: p })} className="flex items-center gap-4 group cursor-pointer">
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 shadow-lg overflow-hidden flex items-center justify-center">
                {p.tracks[0] ? <img src={p.tracks[0].thumbnail} className="w-full h-full object-cover" /> : <div className="opacity-10 text-4xl">♪</div>}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm text-white">{p.name}</h4>
                <p className="text-[10px] opacity-40">Criado por ti • {p.tracks.length} músicas</p>
              </div>
              <MoreVertical size={18} className="opacity-30" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}