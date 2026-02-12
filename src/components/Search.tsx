"use client";
import { useState } from "react";
import { Search as SearchIcon, Loader2 } from "lucide-react";
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
    } catch (error) {
      console.error(error);
    } finally { 
      setLoading(false); 
    }
  };

  const playTrack = async (track: any) => {
    setIsFetchingAudio(track.id);
    try {
      const ytId = await getYoutubeId(track.title, track.artist);
      if (ytId) {
        setCurrentTrack({ ...track, youtubeId: ytId });
        setIsPlaying(true);
      } else {
        alert("Não foi possível encontrar o áudio desta música no YouTube.");
      }
    } catch (err) {
      console.error("Erro ao processar áudio:", err);
    } finally {
      setIsFetchingAudio(null);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="relative mx-1">
        <input
          type="text"
          placeholder="Pesquisar no Xalanify..."
          className="w-full bg-[#1c1c1e] text-white py-4 pl-12 pr-4 rounded-[1.5rem] border border-white/5 focus:border-white/10 outline-none transition-all"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
      </form>

      <div className="space-y-1">
        {loading && (
          <div className="flex justify-center p-12">
            <Loader2 className="animate-spin" style={{ color: themeColor }} size={32} />
          </div>
        )}
        
        {results.map((track) => (
          <div 
            key={track.id} 
            onClick={() => playTrack(track)}
            className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-[1.5rem] active:scale-[0.98] transition-all cursor-pointer group"
          >
            <div className="relative flex-shrink-0">
              <img 
                src={track.thumbnail} 
                className="w-14 h-14 rounded-xl object-cover bg-zinc-800 shadow-lg" 
                alt={track.title} 
              />
              {isFetchingAudio === track.id && (
                <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center">
                  <Loader2 className="animate-spin text-white" size={20} />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-bold text-white truncate leading-tight">{track.title}</p>
              <p className="text-[12px] text-zinc-500 truncate mt-1 uppercase tracking-widest font-black">{track.artist}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}