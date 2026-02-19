"use client";
import { Search, Plus, Heart, MoreVertical, ChevronRight } from "lucide-react";
import { useXalanify, Track } from "@/context/XalanifyContext";

export default function LibraryPage() {
  // ADICIONADO 'user' E 'view' NA DESESTRUTURAÇÃO
  const { 
    user,
    view, 
    setView, 
    playlists, 
    likedTracks, 
    createPlaylist, 
    setCurrentTrack, 
    setIsPlaying, 
    setActiveQueue 
  } = useXalanify();

  // 1. VISTA DE CONTEÚDO (Playlist Aberta ou Favoritos)
  if (view.type !== 'main') {
    const isLikedView = view.type === 'liked';
    const tracks = isLikedView ? likedTracks : (playlists.find(p => p.id === view.data?.id)?.tracks || []);
    const title = isLikedView ? 'Favoritas' : view.data?.name;

    return (
      <div className="p-6 pt-12 pb-32 animate-in fade-in">
        <button 
          onClick={() => setView({ type: 'main' })} 
          className="mb-8 opacity-40 font-black text-[10px] tracking-[0.2em] uppercase flex items-center gap-1 hover:opacity-100 transition-opacity"
        >
           <ChevronRight className="rotate-180" size={14} /> Voltar
        </button>
        
        <h1 className="text-5xl font-black italic tracking-tighter mb-10 text-white leading-tight">
          {title}
        </h1>
        
        <div className="space-y-4">
          {tracks.length === 0 ? (
             <div className="glass p-10 rounded-[2.5rem] text-center border border-white/5">
                <p className="opacity-30 italic text-sm">Nenhuma música encontrada aqui.</p>
             </div>
          ) : (
             tracks.map((t: Track) => (
              <div 
                key={t.id} 
                className="flex items-center gap-5 glass p-4 rounded-[2.5rem] border border-white/5 hover:bg-white/5 transition-colors group"
              >
                <img 
                  src={t.thumbnail} 
                  className="w-16 h-16 rounded-[1.5rem] object-cover shadow-lg cursor-pointer active:scale-95 transition-transform" 
                  onClick={() => { 
                    setCurrentTrack(t); 
                    setIsPlaying(true); 
                    setActiveQueue(tracks); 
                  }} 
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-white truncate italic">{t.title}</p>
                  <p className="text-[10px] opacity-40 uppercase font-black tracking-widest text-gray-300 truncate">{t.artist}</p>
                </div>
                <button className="p-2 text-gray-600 hover:text-white"><MoreVertical size={20} /></button>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // 2. VISTA PRINCIPAL DA BIBLIOTECA
  return (
    <div className="p-6 pt-12 space-y-8 animate-in fade-in pb-32">
      {/* Header com Avatar Real */}
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-black tracking-tight text-white">Biblioteca</h1>
        <div className="w-10 h-10 rounded-full bg-blue-600 border-2 border-white/20 overflow-hidden flex items-center justify-center text-[10px] font-black italic">
             {user?.email?.substring(0, 2).toUpperCase()}
        </div>
      </div>

      {/* Barra de Pesquisa */}
      <div className="relative group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30" size={20} />
        <input 
            type="text" 
            placeholder="Procurar na biblioteca" 
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-4 text-sm text-white focus:outline-none focus:bg-white/10 transition-all font-medium"
        />
      </div>

      {/* Botão Criar Playlist */}
      <button 
        onClick={() => {
            const name = prompt("Qual o nome da nova playlist?");
            if (name) createPlaylist(name);
        }}
        className="w-full py-4 bg-blue-600 rounded-2xl flex items-center justify-center gap-2 font-bold text-white shadow-lg shadow-blue-900/30 active:scale-[0.98] transition-all"
      >
        <div className="bg-white/20 rounded-full p-1"><Plus size={16} className="text-white" /></div>
        Criar Playlist
      </button>

      {/* Card de Favoritos */}
      <div 
        onClick={() => setView({ type: 'liked' })}
        className="bg-[#0f172a] p-6 rounded-[2.5rem] flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all border border-white/5 relative overflow-hidden group"
      >
        <div className="absolute left-[-20px] bottom-[-20px] w-32 h-32 bg-blue-600/20 blur-[60px] rounded-full pointer-events-none" />
        
        <div className="flex items-center gap-5 relative z-10">
            <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Heart fill="white" className="text-white" size={28} />
            </div>
            <div>
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1">Privado</p>
                <h2 className="text-xl font-bold text-white leading-none mb-1">Músicas<br/>Favoritas</h2>
                <p className="text-xs text-gray-400 font-medium">{likedTracks.length} faixas</p>
            </div>
        </div>
        <ChevronRight className="text-white/20 group-hover:text-white transition-colors" />
      </div>

      {/* Lista de Playlists vindas do Supabase */}
      <div>
        <div className="flex justify-between items-end mb-4 px-1">
            <h3 className="font-bold text-lg text-white">As Tuas Playlists</h3>
            <button className="text-xs text-blue-500 font-bold hover:text-blue-400">Ver todas</button>
        </div>

        <div className="space-y-3">
            {playlists.length === 0 ? (
                <div className="text-center py-10 glass rounded-[2rem] border border-white/5 opacity-40">
                  <p className="text-xs italic">Ainda não criaste nenhuma playlist.</p>
                </div>
            ) : (
                playlists.map((playlist) => (
                    <div 
                        key={playlist.id} 
                        onClick={() => setView({ type: 'playlist', data: playlist })}
                        className="glass p-3 rounded-2xl flex items-center gap-4 hover:bg-white/5 transition-colors group cursor-pointer border border-white/5"
                    >
                        <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg overflow-hidden bg-zinc-800 border border-white/5">
                            {playlist.tracks && playlist.tracks.length > 0 ? (
                                <img src={playlist.tracks[0].thumbnail} className="w-full h-full object-cover" alt="Cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center">
                                  <Plus className="opacity-20" size={16}/>
                                </div>
                            )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-white truncate text-sm">{playlist.name}</h4>
                            <p className="text-[10px] text-gray-500 truncate font-medium mt-0.5 uppercase tracking-tighter">
                                {playlist.tracks?.length || 0} músicas • {user?.email === "adminadmin@admin.com" ? "Admin" : "Membro"}
                            </p>
                        </div>

                        <button className="p-3 text-gray-600 hover:text-white transition-colors">
                          <MoreVertical size={18} />
                        </button>
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
}