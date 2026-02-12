"use client";
import { useState } from "react";
import { Search as SearchIcon, Play, Loader2 } from "lucide-react";
import { useXalanify } from "@/context/XalanifyContext";
import { searchMusic, getYoutubeId } from "@/lib/musicApi"; // IMPORTANTE: Adicionado getYoutubeId

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isfetchingAudio, setIsFetchingAudio] = useState<string | null>(null);
  
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
    // 1. Sinaliza que estamos a carregar o áudio para esta música específica
    setIsFetchingAudio(track.id);
    
    try {
      // 2. BUSCA REAL: Vai ao YouTube buscar o ID (o que gera o JSON verde)
      const ytId = await getYoutubeId(track.title, track.artist);
      
      if (ytId) {
        // 3. Só agora enviamos para o Player com o ID garantido
        setCurrentTrack({ ...track, youtubeId: ytId });
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Erro ao obter áudio do YouTube:", error);
    } finally {
      setIsFetchingAudio(null);
    }
  };

  return (
    <div className="space-y-8 pt-12 px-4 flex flex-col items-center w-full">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black tracking-tighter italic">EXPLORAR</h2>
        <p className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] font-black">Xalanify Engine</p>
      </div>

      <form onSubmit={handleSearch} className="relative w-full max-w-md">
        <input
          type="text"
          placeholder="Pesquisar música ou artista..."
          className="w-full bg-[#1c1c1e] text-white py-4 pl-12 pr-4 rounded-[2rem] outline-none border border-white/5 focus:border-white/20 transition-all text-center"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
      </form>

      <div className="w-full max-w-md space-y-2 pb-32">
        {loading && (
          <div className="flex justify-center p-12">
            <Loader2 className="animate-spin" style={{color: themeColor}} size={32} />
          </div>
        )}
        
        {results.map((track) => (
          <div 
            key={track.id} 
            onClick={() => playTrack(track)}
            className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-[2rem] active:scale-[0.98] transition-all cursor-pointer group border border-white/5"
          >
            <div className="relative shrink-0">
              <img src={track.thumbnail} className="w-14 h-14 rounded-2xl object-cover shadow-lg" alt="" />
              {isfetchingAudio === track.id && (
                <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center">
                  <Loader2 className="animate-spin text-white" size={18} />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-bold text-white truncate leading-tight">{track.title}</p>
              <p className="text-[11px] text-zinc-500 truncate mt-1 uppercase font-black tracking-widest">{track.artist}</p>
            </div>
            
            <div className="p-2">
               <Play size={18} style={{ color: themeColor }} fill="currentColor" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}