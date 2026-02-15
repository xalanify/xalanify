"use client";
import { useState, useEffect } from "react";
import { Search as SearchIcon, Loader2, Music, X, Play, Heart } from "lucide-react";
import { useXalanify } from "@/context/XalanifyContext";
import { searchMusic, getYoutubeId } from "@/lib/musicApi"; 
import TrackOptions from "@/components/TrackOptions";

export default function SearchPage() {
  const { 
    searchResults, setSearchResults, persistentQuery, setPersistentQuery,
    setCurrentTrack, setIsPlaying, themeColor, addLog, setPerfMetrics,
    playlists, likedTracks
  } = useXalanify();

  const [query, setQuery] = useState(persistentQuery);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    
    const startTime = Date.now();
    setLoading(true);
    setPersistentQuery(query);
    addLog(`Busca: ${query}`);
    
    try {
      const tracks = await searchMusic(query); 
      setSearchResults(tracks);
      setPerfMetrics({ latency: Date.now() - startTime });
    } catch (e) { addLog("Erro na busca"); }
    finally { setLoading(false); }
  };

  const clearSearch = () => {
    setQuery("");
    setPersistentQuery("");
    setSearchResults([]);
  };

  const playTrack = async (track: any) => {
    const startTime = Date.now();
    setIsPlaying(false);
    addLog(`Sync: ${track.title}`);
    const ytId = await getYoutubeId(track.title, track.artist);
    setCurrentTrack({ ...track, youtubeId: ytId });
    setPerfMetrics({ loadTime: parseFloat(((Date.now() - startTime) / 1000).toFixed(2)) });
    setTimeout(() => setIsPlaying(true), 500);
  };

  return (
    <div className="p-8">
      <h1 className="text-5xl font-black italic mb-8 tracking-tighter">Explorar</h1>
      
      <div className="relative mb-10 group">
        <form onSubmit={handleSearch}>
          <input 
            type="text" value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Artistas ou músicas..." 
            className="w-full bg-zinc-900 border-none p-6 pl-16 pr-14 rounded-[2.5rem] text-sm font-bold focus:ring-2 outline-none shadow-2xl transition-all"
            style={{ "--tw-ring-color": themeColor } as any}
          />
        </form>
        <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500" size={24} />
        {query && (
          <button onClick={clearSearch} className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-zinc-700" size={40}/></div>
      ) : (
        <div className="space-y-10">
          {searchResults.length > 0 ? (
            <div className="space-y-4">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 px-2">Resultados</h2>
              {searchResults.map((track) => (
                <div key={track.id} className="flex items-center gap-4 group">
                  <div onClick={() => playTrack(track)} className="flex flex-1 items-center gap-4 cursor-pointer hover:bg-white/5 p-2 rounded-3xl transition-all">
                    <img src={track.thumbnail} className="w-16 h-16 rounded-2xl object-cover shadow-lg" />
                    <div className="flex-1 overflow-hidden">
                      <p className="font-bold text-sm truncate">{track.title}</p>
                      <p className="text-[10px] uppercase font-black opacity-30 tracking-widest">{track.artist}</p>
                    </div>
                  </div>
                  <TrackOptions track={track} />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-10 animate-in fade-in duration-500">
              {playlists.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 px-2">Biblioteca</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {playlists.map(p => (
                      <div key={p.id} className="bg-zinc-900 p-4 rounded-[2.5rem] flex flex-col gap-3 hover:scale-[1.02] transition-transform cursor-pointer">
                        <div className="w-full aspect-square bg-zinc-800 rounded-[1.8rem] flex items-center justify-center overflow-hidden">
                          {p.image ? <img src={p.image} className="w-full h-full object-cover"/> : <Play size={24} style={{color: themeColor}}/>}
                        </div>
                        <p className="font-bold text-[11px] px-2 truncate">{p.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {likedTracks.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 px-2">Favoritos</h2>
                  <div className="grid grid-cols-1 gap-2">
                    {likedTracks.slice(0, 4).map(track => (
                      <div key={track.id} className="flex items-center gap-4 p-2 bg-white/[0.02] rounded-2xl">
                        <img src={track.thumbnail} className="w-10 h-10 rounded-lg object-cover" />
                        <div className="flex-1 overflow-hidden">
                          <p className="font-bold text-[11px] truncate">{track.title}</p>
                          <p className="text-[8px] opacity-40 uppercase font-black">{track.artist}</p>
                        </div>
                        <Heart size={12} fill={themeColor} style={{color: themeColor}} className="mr-2"/>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}