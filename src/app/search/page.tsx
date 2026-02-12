"use client";
import { useState } from "react";
import { Search as SearchIcon, Play, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { useXalanify } from "@/context/XalanifyContext";
import { searchMusic, getDirectAudio } from "@/lib/musicApi"; 

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTrackId, setLoadingTrackId] = useState<string | null>(null);
  const { setCurrentTrack, setIsPlaying, themeColor, currentTrack } = useXalanify();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const tracks = await searchMusic(query); 
      setResults(tracks);
      
      if (tracks.length === 0) {
        alert("Nenhum resultado encontrado. Tente outro termo de pesquisa.");
      }
    } catch (error) { 
      console.error("Erro na pesquisa:", error);
    } finally { 
      setLoading(false); 
    }
  };

  const playTrack = async (track: any) => {
    if (loadingTrackId) return;
    
    setLoadingTrackId(track.id);
    setIsPlaying(false); 
    
    try {
      console.log("Iniciando extração de áudio...");
      const audioUrl = await getDirectAudio(track.title, track.artist);
      
      if (audioUrl) {
        // Criamos o objeto final para o Contexto
        const trackToPlay = {
          ...track,
          audioUrl: audioUrl, // Aqui está a chave!
          isLocal: false
        };
        
        setCurrentTrack(trackToPlay);
        
        // Dá tempo ao elemento <audio> para atualizar o 'src'
        setTimeout(() => {
          setIsPlaying(true);
        }, 300);
      } else {
        alert("O servidor de música está ocupado. Tente novamente em instantes.");
      }
    } catch (error) {
      console.error("Erro fatal na reprodução:", error);
    } finally {
      setLoadingTrackId(null);
    }
  };

  const isCurrentTrack = (trackId: string) => {
    return currentTrack?.id === trackId;
  };

  return (
    <div className="space-y-6 pb-40">
      <form onSubmit={handleSearch} className="relative mx-1">
        <input
          type="text"
          placeholder="Pesquisar músicas, artistas..."
          className="w-full bg-[#1c1c1e] text-white py-3.5 pl-12 pr-4 rounded-2xl outline-none focus:ring-2 placeholder:text-zinc-500 transition-all"
          style={{ boxShadow: `0 0 0 2px ${themeColor}20` } as any}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
        {query && (
          <button type="button" onClick={() => setQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
            ×
          </button>
        )}
      </form>

      {loading && (
        <div className="flex flex-col items-center justify-center p-16">
          <Loader2 className="animate-spin mb-4" style={{ color: themeColor }} size={40} />
          <p className="text-zinc-500 text-sm font-bold italic uppercase tracking-tighter">A pesquisar...</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="space-y-1">
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-2 mb-3">
            {results.length} {results.length === 1 ? 'Resultado' : 'Resultados'}
          </p>
          
          {results.map((track) => (
            <div 
              key={track.id} 
              onClick={() => playTrack(track)}
              className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all active:scale-[0.98] ${isCurrentTrack(track.id) ? 'bg-white/10' : 'hover:bg-white/5'}`}
            >
              <div className="relative flex-shrink-0">
                <img src={track.thumbnail} className="w-14 h-14 rounded-xl object-cover bg-zinc-800 shadow-lg" alt="" />
                {loadingTrackId === track.id && (
                  <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center">
                    <Loader2 className="animate-spin" size={20} style={{ color: themeColor }} />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 text-left">
                <p className="text-[15px] font-bold text-white truncate leading-tight">{track.title}</p>
                <p className="text-[11px] text-zinc-500 truncate mt-1 uppercase tracking-wider font-black">{track.artist}</p>
              </div>

              <div className="flex-shrink-0 p-2">
                {isCurrentTrack(track.id) ? (
                  <CheckCircle size={20} style={{ color: themeColor }} fill="currentColor" />
                ) : (
                  <Play size={20} style={{ color: themeColor }} fill="currentColor" className="opacity-20 group-hover:opacity-100 transition-opacity" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && query && results.length === 0 && (
        <div className="flex flex-col items-center justify-center p-16 text-center">
          <AlertCircle size={48} className="text-zinc-600 mb-4" />
          <p className="text-zinc-500 text-sm">Nenhum resultado encontrado para <strong>"{query}"</strong></p>
        </div>
      )}
    </div>
  );
}