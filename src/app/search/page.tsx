"use client";
import { useState } from "react";
import { Search as SearchIcon, Loader2, Music } from "lucide-react";
import { useXalanify } from "@/context/XalanifyContext";
import { searchMusic, getYoutubeId } from "@/lib/musicApi"; 
import TrackOptions from "@/components/TrackOptions";

export default function SearchPage() {
  const { 
    searchResults, setSearchResults, persistentQuery, setPersistentQuery,
    setCurrentTrack, setIsPlaying, themeColor, addLog, setPerfMetrics 
  } = useXalanify();

  const [query, setQuery] = useState(persistentQuery);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    const startTime = Date.now();
    setLoading(true);
    setPersistentQuery(query);
    addLog(`Busca: ${query}`);
    
    try {
      const tracks = await searchMusic(query); 
      setSearchResults(tracks);
      const latency = Date.now() - startTime;
      setPerfMetrics({ latency }); // Guarda a latência no Admin Panel
      addLog(`Busca concluída em ${latency}ms`);
    } catch (e) { addLog("Erro na busca"); }
    finally { setLoading(false); }
  };

  const playTrack = async (track: any) => {
    const startTime = Date.now();
    setIsPlaying(false);
    addLog(`A carregar: ${track.title}`);
    
    const ytId = await getYoutubeId(track.title, track.artist);
    setCurrentTrack({ ...track, youtubeId: ytId });
    
    const loadTime = ((Date.now() - startTime) / 1000).toFixed(2);
    setPerfMetrics({ loadTime: parseFloat(loadTime) }); // Mostra tempo de load no Admin
    
    setTimeout(() => setIsPlaying(true), 500);
  };

  return (
    <div className="p-8">
      <h1 className="text-5xl font-black italic mb-8 tracking-tighter">Pesquisa</h1>
      <form onSubmit={handleSearch} className="relative mb-10">
        <input 
          type="text" value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="JUL, GIMS, Sertanejo..." 
          className="w-full bg-zinc-900 border-none p-6 pl-16 rounded-[2.5rem] text-sm font-bold focus:ring-2 outline-none shadow-2xl transition-all"
          style={{ "--tw-ring-color": themeColor } as any}
        />
        <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500" size={24} />
      </form>

      <div className="space-y-4">
        {loading ? (
          <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-zinc-700" size={40}/></div>
        ) : (
          searchResults.map((track) => (
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
          ))
        )}
      </div>
    </div>
  );
}