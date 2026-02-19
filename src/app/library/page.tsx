"use client";
import { Search, Plus, Heart, MoreVertical, ChevronRight, Music2 } from "lucide-react";
import { useXalanify, Track } from "@/context/XalanifyContext";

export default function LibraryPage() {
  const { 
    user, view, setView, playlists, likedTracks, 
    createPlaylist, setCurrentTrack, setIsPlaying, setActiveQueue 
  } = useXalanify();

  // VISTA DE CONTEÚDO (Playlist ou Favoritos)
  if (view.type !== 'main') {
    const isLikedView = view.type === 'liked';
    const tracks = isLikedView ? likedTracks : (playlists.find(p => p.id === view.data?.id)?.tracks || []);
    const title = isLikedView ? 'Músicas Favoritas' : view.data?.name;

    return (
      <div className="p-6 pt-12 pb-40 animate-in slide-in-from-right duration-500">
        <button 
          onClick={() => setView({ type: 'main' })} 
          className="mb-8 w-10 h-10 glass rounded-full flex items-center justify-center hover:bg-white/10 transition-all"
        >
           <ChevronRight className="rotate-180" size={20} />
        </button>
        
        <div className="mb-10">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 mb-2">Playlist</p>
            <h1 className="text-5xl font-black italic tracking-tighter text-white leading-tight">
              {title}
            </h1>
        </div>
        
        <div className="space-y-3">
          {tracks.length === 0 ? (
             <div className="glass p-16 rounded-[3rem] text-center border border-white/5 bg-white/[0.02]">
                <Music2 className="mx-auto mb-4 opacity-10" size={48} />
                <p className="opacity-30 italic text-sm font-medium">Esta lista está vazia.</p>
             </div>
          ) : (
             tracks.map((t: Track) => (
              <div key={t.id} className="flex items-center gap-5 glass p-3 rounded-[2rem] border border-white/5 hover:bg-white/10 transition-all group">
                <img 
                  src={t.thumbnail} 
                  className="w-14 h-14 rounded-[1.2rem] object-cover shadow-lg cursor-pointer active:scale-90 transition-transform" 
                  onClick={() => { setCurrentTrack(t); setIsPlaying(true); setActiveQueue(tracks); }} 
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-white truncate italic">{t.title}</p>
                  <p className="text-[10px] opacity-40 uppercase font-black tracking-widest mt-0.5">{t.artist}</p>
                </div>
                <button className="p-3 text-white/20 hover:text-white transition-colors"><MoreVertical size={18} /></button>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // VISTA PRINCIPAL
  return (
    <div className="p-6 pt-12 space-y-8 animate-in fade-in pb-40">
      <div className="flex justify-between items-center px-2">
        <h1 className="text-4xl font-black tracking-tighter italic text-white">Biblioteca</h1>
        <div className="w-12 h-12 rounded-[1.2rem] bg-gradient-to-tr from-blue-600 to-indigo-400 border border-white/20 flex items-center justify-center text-xs font-black shadow-xl">
             {user?.email?.substring(0, 2).toUpperCase() || "X"}
        </div>
      </div>

      <div className="relative group mx-2">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={18} />
        <input 
            type="text" 
            placeholder="Procurar na biblioteca" 
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-4 text-sm focus:bg-white/10 outline-none transition-all"
        />
      </div>

      <button 
        onClick={() => {
            const name = prompt("Nome da playlist:");
            if (name) createPlaylist(name);
        }}
        className="mx-2 py-4 bg-white text-black rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-white/5"
      >
        <Plus size={16} /> Criar Nova Playlist
      </button>

      <div 
        onClick={() => setView({ type: 'liked' })}
        className="mx-2 bg-gradient-to-br from-blue-600 to-indigo-900 p-8 rounded-[2.5rem] flex items-center justify-between cursor-pointer active:scale-95 transition-all shadow-2xl relative overflow-hidden group"
      >
        <div className="absolute right-[-20px] top-[-20px] w-40 h-40 bg-white/10 blur-[50px] rounded-full" />
        <div className="flex items-center gap-6 relative z-10">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-inner">
                <Heart fill="white" className="text-white" size={28} />
            </div>
            <div>
                <h2 className="text-2xl font-black text-white italic leading-tight">Músicas<br/>Favoritas</h2>
                <p className="text-[10px] text-white/60 font-black uppercase tracking-widest mt-2">{likedTracks.length} FAIXAS</p>
            </div>
        </div>
        <ChevronRight className="text-white/40 group-hover:text-white transition-colors" />
      </div>

      <div className="px-2">
        <div className="flex justify-between items-center mb-6">
            <h3 className="font-black italic text-lg opacity-40">Coleções</h3>
            <button className="text-[10px] font-black uppercase tracking-widest text-blue-500">Ver Tudo</button>
        </div>

        <div className="grid grid-cols-1 gap-4">
            {playlists.length === 0 ? (
                <div className="text-center py-10 glass rounded-[2rem] border border-white/5 opacity-20 italic text-xs">
                  Ainda sem playlists criadas.
                </div>
            ) : (
                playlists.map((playlist) => (
                    <div 
                        key={playlist.id} 
                        onClick={() => setView({ type: 'playlist', data: playlist })}
                        className="glass p-3 rounded-[2rem] flex items-center gap-4 hover:bg-white/10 transition-all cursor-pointer border border-white/5 group"
                    >
                        <div className="w-16 h-16 rounded-[1.5rem] bg-zinc-900 overflow-hidden shadow-xl border border-white/5 flex-shrink-0">
                            {playlist.tracks?.[0] ? (
                                <img src={playlist.tracks[0].thumbnail} className="w-full h-full object-cover" alt="Cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center opacity-20"><Plus size={20}/></div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-white truncate text-base italic">{playlist.name}</h4>
                            <p className="text-[10px] text-white/30 truncate font-black uppercase tracking-tighter mt-1">
                                {playlist.tracks?.length || 0} músicas • {user?.email === "adminadmin@admin.com" ? "Curadoria" : "Pessoal"}
                            </p>
                        </div>
                        <ChevronRight size={16} className="text-white/10 mr-4 group-hover:text-white" />
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
}