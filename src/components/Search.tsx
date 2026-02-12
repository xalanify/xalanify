"use client";
import { useState } from "react";
import { Search as SearchIcon, Loader2, Play } from "lucide-react";
import { useXalanify } from "@/context/XalanifyContext";
import { searchMusic, getYoutubeId } from "@/lib/musicApi"; 

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [songLoading, setSongLoading] = useState<string | null>(null);
  const { setCurrentTrack, setIsPlaying, themeColor } = useXalanify();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    const tracks = await searchMusic(query);
    setResults(tracks);
    setLoading(false);
  };

  const handlePlay = async (track: any) => {
    setSongLoading(track.id); // Ativa o loading na música específica
    const ytId = await getYoutubeId(track.title, track.artist);
    
    if (ytId) {
      setCurrentTrack({ ...track, youtubeId: ytId });
      setIsPlaying(true);
    } else {
      alert("Não foi possível encontrar o áudio desta música.");
    }
    setSongLoading(null);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="relative mx-1">
        <input
          type="text"
          placeholder="Pesquisar..."
          className="w-full bg-zinc-900 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-white/20 transition-all"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
      </form>

      <div className="space-y-1">
        {loading && <div className="flex justify-center p-10"><Loader2 className="animate-spin" color={themeColor} /></div>}
        {results.map((track) => (
          <div key={track.id} onClick={() => handlePlay(track)} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-2xl transition-all cursor-pointer group relative">
            <div className="relative w-14 h-14 flex-shrink-0">
               <img src={track.thumbnail} className="w-full h-full rounded-xl object-cover" alt="" />
               {songLoading === track.id && (
                 <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center">
                    <Loader2 className="animate-spin text-white" size={20} />
                 </div>
               )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-bold text-white truncate">{track.title}</p>
              <p className="text-[11px] text-zinc-500 truncate uppercase font-black">{track.artist}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}