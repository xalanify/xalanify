"use client";
import { Search, Plus, Heart, ChevronRight, MoreVertical } from "lucide-react";
import { useXalanify, Track } from "@/context/XalanifyContext";
import TrackOptions from "@/components/TrackOptions";

export default function LibraryPage() {
  const { playlists, likedTracks, themeColor, view, setView, createPlaylist, setCurrentTrack, setIsPlaying, setActiveQueue } = useXalanify();

  if (view.type !== 'main') {
    const tracks = view.type === 'liked' ? likedTracks : (playlists.find(p => p.id === view.data.id)?.tracks || []);
    return (
      <div className="p-8 pt-16 animate-in fade-in">
        <button onClick={() => setView({ type: 'main' })} className="mb-8 opacity-40 font-black text-[10px] tracking-[0.2em] uppercase">← Voltar à Biblioteca</button>
        <h1 className="text-5xl font-black mb-10 tracking-tighter italic">{view.type === 'liked' ? 'Favoritas' : view.data.name}</h1>
        <div className="space-y-4">
          {tracks.map((t: Track) => (
            <div key={t.id} className="flex items-center gap-5 glass p-4 rounded-[2.5rem] border-white/5">
              <img src={t.thumbnail} className="w-16 h-16 rounded-[1.5rem] object-cover" onClick={() => { setCurrentTrack(t); setIsPlaying(true); setActiveQueue(tracks); }} />
              <div className="flex-1">
                <p className="font-bold text-sm italic">{t.title}</p>
                <p className="text-[10px] opacity-40 uppercase font-black tracking-tighter">{t.artist}</p>
              </div>
              <TrackOptions track={t} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 pt-16 space-y-10 animate-in fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-5xl font-black tracking-tighter italic">Biblioteca</h1>
        <div className="w-12 h-12 rounded-full border-2 border-white/10 p-1"><img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" className="rounded-full" /></div>
      </div>

      <div className="relative group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 opacity-20" size={20} />
        <input type="text" placeholder="Procurar na tua coleção" className="w-full bg-white/5 border border-white/5 rounded-[2rem] py-5 pl-14 pr-6 text-sm focus:bg-white/10 transition-all outline-none" />
      </div>

      <button 
        onClick={() => { const n = prompt("Nome da nova playlist?"); if(n) createPlaylist(n); }}
        className="w-full py-6 rounded-[2.5rem] font-black uppercase tracking-[0.1em] flex items-center justify-center gap-3 shadow-2xl active:scale-95 transition-all" 
        style={{ backgroundColor: themeColor }}
      >
        <Plus size={24} className="bg-white/20 rounded-full p-1" /> Criar Playlist
      </button>

      <div onClick={() => setView({ type: 'liked' })} className="relative overflow-hidden p-8 rounded-[3rem] glass border-white/10 cursor-pointer active:scale-[0.98] transition-all">
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-2xl" style={{ background: themeColor }}>
            <Heart size={36} fill="white" color="white" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-1">Destaque</p>
            <h2 className="text-3xl font-black italic">Músicas Favoritas</h2>
            <p className="text-xs opacity-40 font-bold">{likedTracks.length} faixas guardadas</p>
          </div>
          <ChevronRight className="opacity-20" />
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center px-2">
          <h3 className="font-black text-xl italic tracking-tight">As Tuas Playlists</h3>
          <span className="text-[10px] font-black uppercase text-blue-500 tracking-widest">Ver Todas</span>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {playlists.map(p => (
            <div key={p.id} onClick={() => setView({ type: 'playlist', data: p })} className="flex items-center gap-5 glass p-4 rounded-[2.5rem] border-white/5 cursor-pointer hover:bg-white/5 transition-all">
              <div className="w-16 h-16 rounded-[1.5rem] bg-zinc-900 overflow-hidden flex items-center justify-center">
                {p.tracks[0] ? <img src={p.tracks[0].thumbnail} className="w-full h-full object-cover" /> : <Plus className="opacity-10" />}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm italic">{p.name}</h4>
                <p className="text-[10px] opacity-40 font-black uppercase tracking-tighter">Coleção Personalizada • {p.tracks.length} itens</p>
              </div>
              <MoreVertical size={20} className="opacity-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}