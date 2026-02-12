"use client";
import { useState } from "react";
import { Search as SearchIcon, Play, Loader2, CheckCircle } from "lucide-react";
import { useXalanify } from "@/context/XalanifyContext";
import { searchMusic, getYoutubeId, getDirectAudio } from "@/lib/musicApi"; 

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState<string | null>(null);
  const { setCurrentTrack, setIsPlaying, themeColor, currentTrack, audioEngine } = useXalanify();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    const tracks = await searchMusic(query); 
    setResults(tracks);
    setLoading(false);
  };

  const playTrack = async (track: any) => {
    setIsFetching(track.id);
    setIsPlaying(false);
    
    try {
      if (audioEngine === 'youtube') {
        const ytId = await getYoutubeId(track.title, track.artist);
        if (ytId) {
          setCurrentTrack({ ...track, youtubeId: ytId, audioUrl: undefined });
        }
      } else {
        const audioUrl = await getDirectAudio(track.title, track.artist);
        if (audioUrl) {
          setCurrentTrack({ ...track, audioUrl: audioUrl, youtubeId: undefined });
        } else {
          alert("Erro no motor Direct. Tente o motor YouTube nas definições.");
        }
      }
      
      setTimeout(() => setIsPlaying(true), 500);
    } catch (error) {
      console.error("Erro ao carregar:", error);
    } finally {
      setIsFetching(null);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="relative">
        <input 
          value={query} 
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Pesquisar..." 
          className="w-full bg-zinc-900 border border-white/5 p-4 pl-12 rounded-2xl outline-none"
        />
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
      </form>

      <div className="space-y-2">
        {loading && <Loader2 className="animate-spin mx-auto text-zinc-500" />}
        {results.map((track) => (
          <div key={track.id} onClick={() => playTrack(track)} className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-2xl cursor-pointer">
            <div className="relative">
              <img src={track.thumbnail} className="w-14 h-14 rounded-xl object-cover" alt="" />
              {isFetching === track.id && (
                <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center">
                  <Loader2 className="animate-spin text-white" size={20} />
                </div>
              )}
            </div>
            <div className="flex-1 text-left">
              <p className="text-[14px] font-bold truncate">{track.title}</p>
              <p className="text-[10px] text-zinc-500 uppercase font-black">{track.artist}</p>
            </div>
            {currentTrack?.id === track.id ? <CheckCircle size={20} style={{ color: themeColor }} /> : <Play size={20} style={{ color: themeColor }} />}
          </div>
        ))}
      </div>
    </div>
  );
}