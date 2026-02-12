"use client";
import { useState } from "react";
import { Search as SearchIcon, Play } from "lucide-react";
import { searchMusic, getYoutubeId } from "@/lib/musicApi";
import { useXalanify } from "@/context/XalanifyContext";

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { setCurrentTrack, setIsPlaying } = useXalanify();

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
    const ytId = await getYoutubeId(track.title, track.artist);
    setCurrentTrack({ ...track, youtubeId: ytId });
    setIsPlaying(true);
  };

  return (
    <div className="w-full space-y-4">
      <form onSubmit={handleSearch} className="relative group">
        <input
          type="text"
          placeholder="Artistas, músicas..."
          className="w-full bg-white/5 border border-white/10 p-3 pl-10 rounded-xl outline-none focus:border-primary/50 transition-all text-sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={16} />
      </form>

      <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
        {loading && <div className="text-center py-4 text-primary animate-pulse text-xs">A sintonizar...</div>}
        {results.map((track) => (
          <div 
            key={track.id} 
            onClick={() => playTrack(track)}
            className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-all active:scale-[0.98] cursor-pointer"
          >
            <img src={track.thumbnail} className="w-12 h-12 rounded-md object-cover flex-shrink-0" alt="" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-white/90">{track.title}</p>
              <p className="text-[11px] text-gray-500 truncate uppercase tracking-wider">{track.artist}</p>
            </div>
            <div className="bg-primary/10 p-2 rounded-full">
               <Play size={14} className="text-primary fill-current" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}