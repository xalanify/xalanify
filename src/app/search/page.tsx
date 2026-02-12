"use client";
import { useState } from "react";
import { Search as SearchIcon, Play, Loader2 } from "lucide-react";
import { useXalanify } from "@/context/XalanifyContext";
import { searchMusic, getYoutubeId, Track } from "@/lib/musicApi"; 

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  
  const { setCurrentTrack, setIsPlaying, themeColor } = useXalanify();

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

  const playTrack = async (track: Track) => {
    console.log("DEBUG: Iniciando busca de áudio para:", track.title);
    
    try {
      // Busca o ID do YouTube antes de dar play
      const ytId = await getYoutubeId(track.title, track.artist);
      
      if (ytId) {
        console.log("DEBUG: YouTube ID encontrado com sucesso:", ytId);
        
        // Atualiza o objeto da música com o ID de áudio encontrado
        const trackWithAudio = {
          ...track,
          youtubeId: ytId
        };
        
        setCurrentTrack(trackWithAudio);
        setIsPlaying(true);
      } else {
        console.error("DEBUG: Falha ao obter ID do YouTube.");
        alert("Não foi possível encontrar uma fonte de áudio para esta música.");
      }
    } catch (error) {
      console.error("DEBUG: Erro ao processar playTrack:", error);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="relative mx-1">
        <input
          type="text"
          placeholder="Pesquisar no Xalanify..."
          className="w-full bg-[#1c1c1e] text-white py-3 pl-11 pr-4 rounded-2xl outline-none focus:ring-2 placeholder:text-zinc-500 transition-all"
          style={{ boxShadow: `0 0 0 2px ${themeColor}20` } as any}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
      </form>

      <div className="space-y-1">
        {loading && (
          <div className="flex justify-center p-8">
            <Loader2 className="animate-spin" style={{ color: themeColor }} />
          </div>
        )}
        
        {results.map((track) => (
          <div 
            key={track.id} 
            onClick={() => playTrack(track)}
            className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-2xl active:scale-[0.98] transition-all cursor-pointer group"
          >
            <img 
              src={track.thumbnail} 
              className="w-14 h-14 rounded-xl object-cover flex-shrink-0 bg-zinc-800 shadow-lg" 
              alt={track.title} 
            />
            
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-bold text-white truncate leading-tight">{track.title}</p>
              <p className="text-[12px] text-zinc-500 truncate mt-1 uppercase tracking-wider font-medium">{track.artist}</p>
            </div>
            
            <div className="p-2 mr-1">
               <Play size={20} style={{ color: themeColor }} fill="currentColor" className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}