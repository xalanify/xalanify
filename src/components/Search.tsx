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
    } catch (error) {
      console.error("Erro na busca:", error);
    } finally {
      setLoading(false);
    }
  };

  const playTrack = async (track: any) => {
    const ytId = await getYoutubeId(track.title, track.artist);
    setCurrentTrack({ ...track, youtubeId: ytId });
    setIsPlaying(true);
  };

  return (
    <div className="w-full space-y-6">
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          placeholder="Pesquisar músicas ou artistas..."
          className="w-full bg-surface border border-white/5 p-4 pl-12 rounded-2xl outline-none focus:border-primary/50 transition-all text-sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
      </form>

      <div className="space-y-3">
        {loading && <p className="text-center text-xs text-primary animate-pulse">A procurar no Spotify...</p>}
        {results.map((track) => (
          <div 
            key={track.id} 
            onClick={() => playTrack(track)}
            className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-primary/10 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <img src={track.thumbnail} className="w-12 h-12 rounded-lg object-cover" alt="" />
              <div>
                <p className="text-sm font-medium line-clamp-1">{track.title}</p>
                <p className="text-xs text-gray-500">{track.artist}</p>
              </div>
            </div>
            <Play size={18} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        ))}
      </div>
    </div>
  );
}