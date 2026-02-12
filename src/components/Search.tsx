"use client";
import { useState } from "react";
import { Search as SearchIcon, Play, Loader2 } from "lucide-react";
import { useXalanify } from "@/context/XalanifyContext";
import { searchMusic, getDirectAudio } from "@/lib/musicApi"; 

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState<string | null>(null);
  const { setCurrentTrack, setIsPlaying, themeColor } = useXalanify();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    const tracks = await searchMusic(query);
    setResults(tracks);
    setLoading(false);
  };

  const playTrack = async (track: any) => {
    setIsFetching(track.id);
    const audioUrl = await getDirectAudio(track.title, track.artist);
    if (audioUrl) {
      setCurrentTrack({ ...track, audioUrl });
      setIsPlaying(true);
    }
    setIsFetching(null);
  };

  return (
    <div className="w-full space-y-6">
      <form onSubmit={handleSearch} className="relative">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
        <input 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Artistas, músicas ou álbuns"
          className="w-full bg-zinc-900 border border-white/5 py-4 pl-12 pr-4 rounded-2xl outline-none focus:border-white/20 transition-all font-medium"
        />
      </form>

      <div className="space-y-2">
        {loading && <Loader2 className="animate-spin mx-auto mt-10" style={{ color: themeColor }} />}
        {results.map((track) => (
          <div key={track.id} onClick={() => playTrack(track)} className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-2xl cursor-pointer transition-all">
            <div className="relative">
              <img src={track.thumbnail} className="w-12 h-12 rounded-xl object-cover" alt="" />
              {isFetching === track.id && <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center"><Loader2 className="animate-spin text-white" size={16} /></div>}
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-bold truncate">{track.title}</p>
              <p className="text-[10px] text-zinc-500 uppercase font-black">{track.artist}</p>
            </div>
            <Play size={18} style={{ color: themeColor }} />
          </div>
        ))}
      </div>
    </div>
  );
}