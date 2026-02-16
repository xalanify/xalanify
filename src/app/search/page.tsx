"use client";
import { useState } from "react";
import { Search as SearchIcon, Loader2, Music, X, Heart, Play } from "lucide-react";
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

  const performSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    
    const start = Date.now();
    setLoading(true);
    setPersistentQuery(query);
    
    try {
      addLog(`Busca: ${query}`);
      const data = await searchMusic(query);
      setSearchResults(data);
      setPerfMetrics({ latency: Date.now() - start });
    } catch (err) {
      addLog("Erro na busca!");
    } finally {
      setLoading(false);
    }
  };

  const playTrack = async (track: any) => {
    const start = Date.now();
    setIsPlaying(false);
    addLog(`Sync: ${track.title}`);
    const ytId = await getYoutubeId(track.title, track.artist);
    setCurrentTrack({ ...track, youtubeId: ytId });
    setPerfMetrics({ loadTime: parseFloat(((Date.now() - start) / 1000).toFixed(2)) });
    setTimeout(() => setIsPlaying(true), 500);
  };

  return (
    <div className="p-8 animate-in fade-in duration-500">
      <h1 className="text-6xl font-black italic mb-8 tracking-tighter italic">Explorar</h1>
      
      <form onSubmit={performSearch} className="relative mb-12">
        <input 
          type="text" value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Artistas, músicas ou álbuns..." 
          className="w-full glass border-none p-6 pl-16 pr-14 rounded-[2.5rem] text-sm font-bold focus:ring-2 outline-none transition-all"
          style={{ "--tw-ring-color": themeColor } as any}
        />
        <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500" size={24} />
        {query && (
          <button type="button" onClick={() => { setQuery(""); setSearchResults([]); }} className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
            <X size={20} />
          </button>
        )}
      </form>

      {loading ? (
        <div className="py-20 flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-zinc-500" size={40} />
            <p className="text-[10px] font-black uppercase opacity-20 tracking-[0.3em]">Sincronizando</p>
        </div>
      ) : searchResults.length > 0 ? (
        <div className="space-y-4">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 mb-6">Resultados da Busca</p>
          {searchResults.map((track) => (
            <div key={track.id} className="flex items-center gap-4 group">
              <div onClick={() => playTrack(track)} className="flex flex-1 items-center gap-4 cursor-pointer glass hover:bg-white/10 p-3 rounded-[2rem] transition-all">
                <img src={track.thumbnail} className="w-14 h-14 rounded-2xl object-cover shadow-2xl" />
                <div className="flex-1 overflow-hidden">
                    <p className="font-bold text-sm truncate">{track.title}</p>
                    <p className="text-[10px] opacity-40 uppercase font-black tracking-widest">{track.artist}</p>
                </div>
              </div>
              <TrackOptions track={track} />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
           {likedTracks.length > 0 && (
              <div className="glass p-6 rounded-[2.5rem] flex flex-col gap-6 group hover:scale-[1.02] transition-transform">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl" style={{backgroundColor: themeColor}}>
                    <Heart fill="white" size={28} />
                </div>
                <div>
                    <p className="font-black text-xs uppercase italic">Gostadas</p>
                    <p className="text-[9px] opacity-40">{likedTracks.length} Músicas</p>
                </div>
              </div>
           )}
           {playlists.map(p => (
              <div key={p.id} className="glass p-6 rounded-[2.5rem] flex flex-col gap-6 group hover:scale-[1.02] transition-transform">
                <div className="w-14 h-14 bg-zinc-800 rounded-2xl flex items-center justify-center shadow-xl">
                    <Play size={24} style={{color: themeColor}} />
                </div>
                <div>
                    <p className="font-black text-xs uppercase italic truncate">{p.name}</p>
                    <p className="text-[9px] opacity-40">Playlist</p>
                </div>
              </div>
           ))}
        </div>
      )}
    </div>
  );
}