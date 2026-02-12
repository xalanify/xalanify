"use client";
import { useState } from "react";
import { Search as SearchIcon, Play, Loader2 } from "lucide-react";
import { useXalanify } from "@/context/XalanifyContext";
import { searchMusic, getYoutubeId } from "@/lib/musicApi"; 

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFetchingAudio, setIsFetchingAudio] = useState<string | null>(null);
  const { setCurrentTrack, setIsPlaying, themeColor } = useXalanify();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    try {
      const tracks = await searchMusic(query); 
      setResults(tracks);
    } finally { setLoading(false); }
  };

  // MUDANÇA CRÍTICA: Agora busca o áudio ANTES de tocar
  const playTrack = async (track: any) => {
    setIsFetchingAudio(track.id);
    const ytId = await getYoutubeId(track.title, track.artist);
    if (ytId) {
      setCurrentTrack({ ...track, youtubeId: ytId });
      setIsPlaying(true);
    }
    setIsFetchingAudio(null);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="relative mx-1">
        <input
          type="text"
          placeholder="Pesquisar..."
          className="w-full bg-[#1c1c1e] text-white py-3 pl-11 pr-4 rounded-2xl outline-none"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
      </form>

      <div className="space-y-1">
        {loading && <div className="flex justify-center p-8"><Loader2 className="animate-spin" style={{color: themeColor}} /></div>}
        {results.map((track) => (
          <div key={track.id} onClick={() => playTrack(track)} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-2xl cursor-pointer">
            <div className="relative">
              <img src={track.thumbnail} className="w-14 h-14 rounded-xl object-cover bg-zinc-800" />
              {isFetchingAudio === track.id && (
                <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center">
                  <Loader2 className="animate-spin text-white" size={16} />
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-[15px] font-bold text-white">{track.title}</p>
              <p className="text-[12px] text-zinc-500 uppercase">{track.artist}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}