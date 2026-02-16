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

  const handleSearch = async (e?: React.FormEvent, targetQuery?: string) => {
    if (e) e.preventDefault();
    const q = targetQuery || query;
    if (!q.trim()) return;
    
    setLoading(true);
    if (targetQuery) setQuery(targetQuery);
    
    try {
      addLog(`A procurar: ${q}`);
      const tracks = await searchMusic(q); 
      setSearchResults(tracks);
    } catch (err) {
      addLog("Erro na ligação à API");
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
      }
    } catch (err) {
      addLog("Erro ao carregar stream");
    } finally {
      setIsFetchingId(null);
    }
  };

  return (
    <div className="p-8 pb-40 animate-in fade-in duration-500">
      <h1 className="text-5xl font-black italic tracking-tighter mb-8">Procurar</h1>
      
      <form onSubmit={(e) => handleSearch(e)} className="relative mb-10">
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Artistas, músicas ou álbuns..." 
          className="w-full glass border-none p-6 pl-14 rounded-[2.5rem] text-sm font-bold focus:ring-2 outline-none transition-all"
          style={{ "--tw-ring-color": themeColor } as any}
        />
        <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 opacity-20" size={20} />
      </form>

      {loading ? (
        <div className="flex flex-col items-center py-20 gap-4">
          <Loader2 className="animate-spin" size={32} style={{color: themeColor}} />
          <p className="text-[10px] font-black uppercase tracking-widest opacity-20">A vasculhar o arquivo...</p>
        </div>
      ) : searchResults.length > 0 ? (
        <div className="space-y-4">
          {searchResults.map((track) => (
            <div key={track.id} className="flex items-center gap-4">
              <div 
                onClick={() => playTrack(track)}
                className="flex-1 flex items-center gap-4 glass p-3 rounded-[2.2rem] hover:bg-white/5 cursor-pointer border border-white/5 transition-all"
              >
                <div className="relative flex-shrink-0">
                  <img src={track.thumbnail} className="w-14 h-14 rounded-2xl object-cover shadow-lg" alt="" />
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
                  <p className="text-[10px] opacity-40 font-black uppercase tracking-tighter">{track.artist}</p>
                </div>
              </div>
              <TrackOptions track={track} />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {["Rap FR", "Phonk", "Deep House", "Pop"].map(tag => (
            <div key={tag} onClick={() => handleSearch(undefined, tag)} className="glass p-8 rounded-[2.5rem] hover:scale-105 transition-all cursor-pointer border border-white/5 group">
              <Globe size={20} style={{color: themeColor}} className="mb-4 opacity-40 group-hover:opacity-100" />
              <p className="font-black text-xs uppercase italic">{tag}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}