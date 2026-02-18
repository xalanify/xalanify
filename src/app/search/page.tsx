"use client";
import { useState } from "react";
import { Search, Loader2, Globe } from "lucide-react";
import { useXalanify } from "@/context/XalanifyContext";
import { searchMusic, getYoutubeId } from "@/lib/musicApi"; 
import TrackOptions from "@/components/TrackOptions";

export default function SearchPage() {
  const { searchResults, setSearchResults, themeColor, setCurrentTrack, setIsPlaying, addLog } = useXalanify();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingId, setFetchingId] = useState<string | null>(null);

  const performSearch = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true); setQuery(q);
    try {
      addLog(`Searching: ${q}`);
      const data = await searchMusic(q);
      setSearchResults(data);
    } catch (e) { addLog("Search API Error"); }
    finally { setLoading(false); }
  };

  const play = async (track: any) => {
    if (fetchingId) return;
    setFetchingId(track.id);
    addLog(`Fetching Audio: ${track.title}`);
    
    try {
      const ytId = await getYoutubeId(track.title, track.artist);
      if (ytId) {
        setCurrentTrack({ ...track, youtubeId: ytId });
        setIsPlaying(true); 
        addLog("Reproduzindo...");
      } else {
        alert("Não foi possível encontrar o áudio.");
      }
    } catch (error) {
      addLog("Erro ao carregar áudio");
    } finally {
      setFetchingId(null);
    }
  };

  return (
    <div className="p-8 pb-40 animate-in fade-in duration-500">
      <h1 className="text-5xl font-black italic tracking-tighter mb-8">Search</h1>
      
      <form onSubmit={(e) => { e.preventDefault(); performSearch(query); }} className="relative mb-10">
        <input 
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Artistas, músicas ou álbuns..."
          className="w-full glass p-6 rounded-[2.5rem] outline-none text-sm font-bold border border-white/5 focus:border-white/20 transition-all"
        />
        <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center">
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
        </button>
      </form>

      {searchResults.length > 0 ? (
        <section className="space-y-4">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 ml-2">Resultados</p>
          <div className="grid gap-3">
            {searchResults.map((track) => (
              <div key={track.id} className="flex items-center gap-3 group">
                <div 
                  onClick={() => play(track)} 
                  className="flex-1 flex items-center gap-4 glass p-3 rounded-[2rem] hover:bg-white/5 cursor-pointer border border-white/5 transition-all active:scale-[0.98]"
                >
                  <div className="relative">
                    <img src={track.thumbnail} className="w-14 h-14 rounded-2xl object-cover shadow-xl" alt="" />
                    {fetchingId === track.id && (
                      <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center">
                        <Loader2 className="animate-spin text-white" size={20} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="font-bold text-sm truncate">{track.title}</p>
                    <p className="text-[10px] opacity-40 font-black uppercase">{track.artist}</p>
                  </div>
                </div>
                <TrackOptions track={track} />
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section>
          <div className="grid grid-cols-2 gap-4">
            {["Rap FR", "GIMS Mix", "Top Global", "Phonk"].map(p => (
              <div key={p} onClick={() => performSearch(p)} className="glass p-6 rounded-[2.5rem] hover:scale-105 transition-all cursor-pointer border border-white/5">
                <Globe size={24} style={{color: themeColor}} className="mb-4" />
                <p className="font-black text-xs uppercase italic truncate">{p}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}