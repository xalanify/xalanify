"use client";
import { useState } from "react";
import { Search as SearchIcon, Loader2, Music, Globe } from "lucide-react";
import { useXalanify } from "@/context/XalanifyContext";
import { searchMusic, getYoutubeId } from "@/lib/musicApi"; 
import TrackOptions from "@/components/TrackOptions";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFetchingId, setIsFetchingId] = useState<string | null>(null);
  
  const { 
    setSearchResults, 
    searchResults,
    setCurrentTrack, 
    setIsPlaying, 
    themeColor, 
    currentTrack,
    addLog
  } = useXalanify();

  const handleSearch = async (targetQuery?: string) => {
    const q = targetQuery || query;
    if (!q.trim()) return;
    setLoading(true);
    if (!targetQuery) setQuery(q);
    
    try {
      addLog(`Search trigger: ${q}`);
      const tracks = await searchMusic(q); 
      setSearchResults(tracks);
    } catch (err) {
      addLog("Erro na API de busca");
    } finally {
      setLoading(false);
    }
  };

  const playTrack = async (track: any) => {
    if (isFetchingId) return;
    setIsFetchingId(track.id);
    setIsPlaying(false);
    
    try {
      const ytId = await getYoutubeId(track.title, track.artist);
      if (ytId) {
        setCurrentTrack({ ...track, youtubeId: ytId });
        setTimeout(() => setIsPlaying(true), 400);
        addLog(`Playing: ${track.title}`);
      }
    } catch (err) {
      addLog("Erro ao obter ID do YouTube");
    } finally {
      setIsFetchingId(null);
    }
  };

  return (
    <div className="p-8 pb-40 animate-in fade-in duration-500">
      <h1 className="text-6xl font-black italic tracking-tighter mb-10">Explorar</h1>
      
      <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="relative mb-12">
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Artistas ou músicas..." 
          className="w-full glass border-none p-6 pl-14 rounded-[2.5rem] text-sm font-bold focus:ring-2 outline-none transition-all"
          style={{ "--tw-ring-color": themeColor } as any}
        />
        <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 opacity-20" size={20} />
      </form>

      {loading ? (
        <div className="flex flex-col items-center py-20 gap-4">
          <Loader2 className="animate-spin" size={32} style={{color: themeColor}} />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30">A vasculhar o arquivo...</p>
        </div>
      ) : (
        <div className="space-y-12">
          {searchResults.length > 0 ? (
            <section>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 mb-6 ml-2">Resultados encontrados</p>
              <div className="space-y-3">
                {searchResults.map((track) => (
                  <div key={track.id} className="flex items-center gap-4">
                    <div 
                      onClick={() => playTrack(track)} 
                      className="flex-1 flex items-center gap-4 glass p-3 rounded-[2.2rem] hover:bg-white/5 cursor-pointer border border-white/5 transition-all"
                    >
                      <div className="relative flex-shrink-0">
                        <img src={track.thumbnail} className="w-14 h-14 rounded-2xl object-cover shadow-xl" alt="" />
                        {isFetchingId === track.id && (
                          <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center">
                            <Loader2 className="animate-spin text-white" size={20} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-bold truncate italic" style={{ color: currentTrack?.id === track.id ? themeColor : 'white' }}>
                          {track.title}
                        </p>
                        <p className="text-[10px] opacity-40 font-black uppercase tracking-tighter mt-0.5">{track.artist}</p>
                      </div>
                    </div>
                    <TrackOptions track={track} />
                  </div>
                ))}
              </div>
            </section>
          ) : (
            <section>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 mb-6 ml-2">Sugestões para ti</p>
              <div className="grid grid-cols-2 gap-4">
                {["GIMS", "Phonk 2026", "Deep House", "Rap FR"].map(p => (
                  <div key={p} onClick={() => handleSearch(p)} className="glass p-8 rounded-[2.5rem] hover:scale-105 transition-all cursor-pointer border border-white/5 group">
                    <Globe size={24} style={{color: themeColor}} className="mb-4 group-hover:animate-spin" />
                    <p className="font-black text-xs uppercase italic truncate">{p}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}