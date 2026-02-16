"use client";
import { useState } from "react";
import { Search, Loader2, Play, Globe, ChevronRight } from "lucide-react";
import { useXalanify } from "@/context/XalanifyContext";
import { searchMusic, getYoutubeId } from "@/lib/musicApi"; 
import TrackOptions from "@/components/TrackOptions";

export default function SearchPage() {
  const { searchResults, setSearchResults, themeColor, setCurrentTrack, setIsPlaying, addLog } = useXalanify();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

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
    setIsPlaying(false);
    const ytId = await getYoutubeId(track.title, track.artist);
    setCurrentTrack({ ...track, youtubeId: ytId });
    setTimeout(() => setIsPlaying(true), 600);
  };

  return (
    <div className="p-8 pb-40 animate-in fade-in duration-500">
      <h1 className="text-6xl font-black italic tracking-tighter mb-10">Explorar</h1>
      <form onSubmit={(e) => { e.preventDefault(); performSearch(query); }} className="relative mb-12">
        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Artistas ou Músicas..." className="w-full glass border-none p-6 pl-14 rounded-[2.5rem] text-sm font-bold focus:ring-2 outline-none" style={{ "--tw-ring-color": themeColor } as any} />
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 opacity-20" size={20} />
      </form>

      {loading ? <div className="flex justify-center py-20"><Loader2 className="animate-spin text-zinc-600" size={40} /></div> : (
        <div className="space-y-12">
          {searchResults.length > 0 && (
            <section>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 mb-6 ml-2">Melhores Resultados</p>
              <div className="space-y-3">
                {searchResults.map(track => (
                  <div key={track.id} className="flex items-center gap-4">
                    <div onClick={() => play(track)} className="flex-1 flex items-center gap-4 glass p-3 rounded-[2rem] hover:bg-white/5 cursor-pointer border border-white/5">
                      <img src={track.thumbnail} className="w-14 h-14 rounded-2xl object-cover shadow-xl" />
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
          )}

          <section>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 mb-6 ml-2">Playlists do Momento</p>
            <div className="grid grid-cols-2 gap-4">
              {["Rap FR", "GIMS Mix", "Top Global", "Phonk"].map(p => (
                <div key={p} onClick={() => performSearch(p)} className="glass p-6 rounded-[2.5rem] hover:scale-105 transition-all cursor-pointer border border-white/5">
                  <Globe size={24} style={{color: themeColor}} className="mb-4" />
                  <p className="font-black text-xs uppercase italic truncate">{p}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}