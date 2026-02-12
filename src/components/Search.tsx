"use client";
import { useState } from "react";
import { Search as SearchIcon, Loader2 } from "lucide-react";
import { useXalanify } from "@/context/XalanifyContext";
import { searchMusic, getYoutubeId } from "@/lib/musicApi"; 

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { setCurrentTrack, setIsPlaying, themeColor } = useXalanify();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    try {
      const tracks = await searchMusic(query); 
      setResults(tracks);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const playTrack = async (track: any) => {
    setLoading(true);
    // Busca o ID real do YouTube antes de enviar para o player
    const ytId = await getYoutubeId(`${track.title} ${track.artist}`);
    setCurrentTrack({ ...track, youtubeId: ytId });
    setIsPlaying(true);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="relative mx-1">
        <input
          type="text"
          placeholder="Pesquisar música..."
          className="w-full bg-zinc-900 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-white/20 transition-all"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
        {loading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-zinc-500" size={18} />}
      </form>

      <div className="space-y-1">
        {results.map((track) => (
          <div key={track.id} onClick={() => playTrack(track)} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-2xl active:scale-[0.98] transition-all cursor-pointer">
            <img src={track.thumbnail} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" alt="" />
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-bold text-white truncate">{track.title}</p>
              <p className="text-[12px] text-zinc-500 truncate uppercase">{track.artist}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}