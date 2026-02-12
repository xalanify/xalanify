"use client";
import { useState } from "react";
import { Search as SearchIcon, Play, Loader2 } from "lucide-react";
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
    <div className="space-y-4 pt-4">
      <h1 className="text-2xl font-bold px-2">Pesquisa</h1>
      
      <form onSubmit={handleSearch} className="relative mx-2">
        <input
          type="text"
          placeholder="Artistas, músicas..."
          className="w-full bg-[#1c1c1e] text-white p-3 pl-10 rounded-xl outline-none focus:ring-2 focus:ring-[#a855f7] placeholder:text-gray-500"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
      </form>

      <div className="space-y-1">
        {loading && <div className="flex justify-center p-4"><Loader2 className="animate-spin text-[#a855f7]" /></div>}
        
        {results.map((track) => (
          <div 
            key={track.id} 
            onClick={() => playTrack(track)}
            // AQUI ESTÁ A CORREÇÃO VISUAL: Flexbox alinha lado a lado
            className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-all active:scale-95 cursor-pointer"
          >
            {/* AQUI ESTÁ A CURA PARA CAPAS GIGANTES: w-14 h-14 fixa o tamanho */}
            <img 
              src={track.thumbnail} 
              className="w-14 h-14 rounded-lg object-cover flex-shrink-0 shadow-lg" 
              alt="" 
            />
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-white">{track.title}</p>
              <p className="text-xs text-gray-400 truncate">{track.artist}</p>
            </div>
            
            <button className="p-2 text-gray-400 hover:text-[#a855f7]">
               <Play size={20} fill="currentColor" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}