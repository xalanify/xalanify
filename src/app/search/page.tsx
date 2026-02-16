"use client";
import { useState } from "react";
import { Search, Loader2, Globe, ChevronRight } from "lucide-react";
import { useXalanify } from "@/context/XalanifyContext";
import { searchMusic, getYoutubeId } from "@/lib/musicApi"; 
import TrackOptions from "@/components/TrackOptions";

export default function SearchPage() {
  const { searchResults, setSearchResults, themeColor, setCurrentTrack, setIsPlaying } = useXalanify();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const startSearch = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true); setQuery(q);
    try {
      const data = await searchMusic(q);
      setSearchResults(data);
    } finally { setLoading(false); }
  };

  const play = async (t: any) => {
    setIsPlaying(false);
    const id = await getYoutubeId(t.title, t.artist);
    setCurrentTrack({ ...t, youtubeId: id });
    setTimeout(() => setIsPlaying(true), 500);
  };

  return (
    <div className="p-8 pb-40">
      <h1 className="text-6xl font-black italic tracking-tighter mb-10">Explorar</h1>
      <form onSubmit={(e) => { e.preventDefault(); startSearch(query); }} className="relative mb-12">
        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder="Músicas ou artistas..." className="w-full glass border-none p-6 pl-14 rounded-[2rem] text-sm font-bold focus:ring-2"
          style={{ "--tw-ring-color": themeColor } as any} />
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 opacity-20" size={20} />
      </form>

      {loading ? <div className="flex justify-center py-20"><Loader2 className="animate-spin text-zinc-500" /></div> : (
        <div className="space-y-12">
          {searchResults.length > 0 && (
            <section>
              <div className="flex justify-between items-center mb-6 px-2">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30">Resultados</p>
                <button onClick={() => setShowAll(!showAll)} className="text-[10px] font-bold" style={{color: themeColor}}>
                    {showAll ? "MENOS" : "VER TUDO"}
                </button>
              </div>
              <div className="space-y-4">
                {(showAll ? searchResults : searchResults.slice(0, 4)).map(track => (
                  <div key={track.id} className="flex items-center gap-4">
                    <div onClick={() => play(track)} className="flex-1 flex items-center gap-4 glass p-3 rounded-[2rem] hover:bg-white/5 cursor-pointer">
                        <img src={track.thumbnail} className="w-14 h-14 rounded-2xl object-cover" />
                        <div className="flex-1 overflow-hidden">
                            <p className="font-bold text-sm truncate">{track.title}</p>
                            <p className="text-[10px] opacity-40 uppercase">{track.artist}</p>
                        </div>
                    </div>
                    <TrackOptions track={track} />
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
             <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 mb-6 px-2">Playlists Públicas</p>
             <div className="grid grid-cols-2 gap-4">
                {["Phonk", "Top GIMS", "Hits 2026", "Acoustic"].map(p => (
                   <div key={p} onClick={() => startSearch(p)} className="glass p-6 rounded-[2.5rem] hover:scale-105 transition-all cursor-pointer">
                      <Globe size={24} style={{color: themeColor}} className="mb-4" />
                      <p className="font-black text-xs uppercase italic">{p}</p>
                   </div>
                ))}
             </div>
          </section>
        </div>
      )}
    </div>
  );
}