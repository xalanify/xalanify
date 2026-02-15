"use client";
import { useState } from "react";
import { Search as SearchIcon, Play, Loader2, CheckCircle, ListMusic, PlusCircle } from "lucide-react";
import { useXalanify } from "@/context/XalanifyContext";
import { searchMusic, getDirectAudio, getYoutubeId } from "@/lib/musicApi"; 
import TrackOptions from "@/components/TrackOptions";

export default function Search() {
  const { 
    persistentResults, setPersistentResults, 
    persistentQuery, setPersistentQuery,
    setCurrentTrack, setIsPlaying, themeColor, currentTrack, createPlaylist 
  } = useXalanify();

  const [loading, setLoading] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!persistentQuery.trim()) return;
    setLoading(true);
    try {
      const tracks = await searchMusic(persistentQuery); 
      setPersistentResults(tracks);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const playTrack = async (track: any) => {
    if (loadingId) return;
    setLoadingId(track.id);
    setIsPlaying(false);
    try {
      setCurrentTrack(track);
      setTimeout(() => setIsPlaying(true), 500);
    } catch (e) { console.error(e); }
    setLoadingId(null);
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <h1 className="text-4xl font-black italic">Pesquisa</h1>
      
      <form onSubmit={handleSearch} className="relative group">
        <input 
          value={persistentQuery} 
          onChange={(e) => setPersistentQuery(e.target.value)}
          placeholder="Artistas, músicas ou álbuns..." 
          className="w-full bg-zinc-900 border border-white/5 p-5 pl-14 rounded-[2rem] outline-none focus:border-white/20 transition-all text-sm font-bold"
        />
        <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" size={22} />
        {loading && <Loader2 className="absolute right-5 top-1/2 -translate-y-1/2 animate-spin text-zinc-500" size={20} />}
      </form>

      {/* RESULTADOS PERSISTENTES */}
      <div className="space-y-6">
        {persistentResults.length > 0 && (
          <div className="space-y-4">
             <p className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] px-2">Principais Músicas</p>
             <div className="space-y-1">
                {persistentResults.map((track) => (
                  <div key={track.id} className="flex items-center justify-between p-3 hover:bg-white/5 rounded-[1.8rem] transition-all group">
                    <div onClick={() => playTrack(track)} className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer">
                      <div className="relative flex-shrink-0">
                        <img src={track.thumbnail} className="w-14 h-14 rounded-2xl object-cover" alt="" />
                        {loadingId === track.id && (
                          <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center">
                            <Loader2 className="animate-spin text-white" size={18} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 truncate">
                        <p className="text-sm font-bold truncate pr-2">{track.title}</p>
                        <p className="text-[10px] text-zinc-500 font-black uppercase mt-1 italic">{track.artist}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pl-2">
                      {currentTrack?.id === track.id ? (
                        <CheckCircle size={16} style={{ color: themeColor }} />
                      ) : (
                        <Play size={16} className="text-zinc-700 opacity-0 group-hover:opacity-100" />
                      )}
                      <TrackOptions track={track} />
                    </div>
                  </div>
                ))}
             </div>
          </div>
        )}
      </div>

      {/* DICA: PLAYLISTS SUGERIDAS (Simulação via Artista) */}
      {persistentResults.length > 0 && (
        <div className="pt-4 space-y-4">
          <p className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] px-2">Playlists de {persistentResults[0]?.artist}</p>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
             <div className="min-w-[160px] bg-zinc-900/40 p-4 rounded-[2.5rem] border border-white/5 space-y-3">
                <div className="w-full aspect-square bg-gradient-to-br from-zinc-700 to-zinc-900 rounded-3xl flex items-center justify-center relative overflow-hidden">
                   <img src={persistentResults[0]?.thumbnail} className="absolute inset-0 w-full h-full object-cover opacity-50 blur-sm" />
                   <ListMusic size={40} className="relative z-10" />
                </div>
                <div>
                   <p className="text-xs font-bold truncate">This Is {persistentResults[0]?.artist}</p>
                   <button 
                    onClick={() => createPlaylist(`This Is ${persistentResults[0]?.artist}`, persistentResults.slice(0, 5), persistentResults[0]?.thumbnail)}
                    className="mt-2 flex items-center gap-1 text-[9px] font-black uppercase" style={{ color: themeColor }}
                   >
                     <PlusCircle size={12}/> Adicionar
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}