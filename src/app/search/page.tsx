"use client";
import { useState } from "react";
import { Search as SearchIcon, Play, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { useXalanify } from "@/context/XalanifyContext";
import { searchMusic, getYoutubeId } from "@/lib/musicApi"; 

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
      alert("Erro ao pesquisar. Verifique a sua conexão.");
    } finally { 
      setLoading(false); 
    }
  };

  const playTrack = async (track: any) => {
    // Previne cliques múltiplos
    if (loadingTrackId) return;
    
    setLoadingTrackId(track.id);
    setIsPlaying(false); // Para a música atual
    
    try {
      console.log("🔍 Buscando áudio para:", track.title, "-", track.artist);
      
      // Busca o ID do YouTube
      const ytId = await getYoutubeId(track.title, track.artist);
      
      if (ytId) {
        console.log("✓ YouTube ID obtido:", ytId);
        
        // Define a nova track
        setCurrentTrack({ 
          ...track, 
          youtubeId: ytId,
          isLocal: false 
        });
        
        // Pequeno delay para o ReactPlayer montar
        setTimeout(() => {
          setIsPlaying(true);
          console.log("▶ Iniciando reprodução");
        }, 400);
      } else {
        console.error("❌ Não foi possível encontrar áudio");
        alert("Não foi possível encontrar o áudio desta música. Tente outra.");
      }
    } catch (error) {
      console.error("Erro ao carregar áudio:", error);
      alert("Erro ao carregar a música. Tente novamente.");
    } finally {
      setLoadingTrackId(null);
    }
  };

  const isCurrentTrack = (trackId: string) => {
    return currentTrack?.id === trackId;
  };

  return (
    <div className="space-y-6 pb-40">
      {/* BARRA DE PESQUISA */}
      <form onSubmit={handleSearch} className="relative mx-1">
        <input
          type="text"
          placeholder="Pesquisar músicas, artistas..."
          className="w-full bg-[#1c1c1e] text-white py-3.5 pl-12 pr-4 rounded-2xl outline-none focus:ring-2 placeholder:text-zinc-500 transition-all"
          style={{ boxShadow: `0 0 0 2px ${themeColor}20` } as any}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <SearchIcon 
          className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" 
          size={20} 
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
          >
            ×
          </button>
        )}
      </form>

      {/* LOADING STATE */}
      {loading && (
        <div className="flex flex-col items-center justify-center p-16">
          <Loader2 
            className="animate-spin mb-4" 
            style={{ color: themeColor }} 
            size={40} 
          />
          <p className="text-zinc-500 text-sm">A pesquisar...</p>
        </div>
      )}

      {/* RESULTADOS */}
      {!loading && results.length > 0 && (
        <div className="space-y-1">
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-2 mb-3">
            {results.length} {results.length === 1 ? 'Resultado' : 'Resultados'}
          </p>
          
          {results.map((track) => (
            <div 
              key={track.id} 
              onClick={() => playTrack(track)}
              className={`
                flex items-center gap-3 p-3 rounded-2xl cursor-pointer
                transition-all active:scale-[0.98]
                ${isCurrentTrack(track.id) 
                  ? 'bg-white/10 border-2' 
                  : 'hover:bg-white/5 border-2 border-transparent'
                }
              `}
              style={isCurrentTrack(track.id) ? { borderColor: themeColor } : {}}
            >
              {/* THUMBNAIL */}
              <div className="relative flex-shrink-0">
                <img 
                  src={track.thumbnail} 
                  className="w-14 h-14 rounded-xl object-cover bg-zinc-800 shadow-lg" 
                  alt="" 
                />
                {loadingTrackId === track.id && (
                  <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center">
                    <Loader2 className="animate-spin" size={20} style={{ color: themeColor }} />
                  </div>
                )}
              </div>

              {/* INFO */}
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-bold text-white truncate leading-tight">
                  {track.title}
                </p>
                <p className="text-[12px] text-zinc-500 truncate mt-1 uppercase tracking-wider font-medium">
                  {track.artist}
                </p>
                {track.album && (
                  <p className="text-[10px] text-zinc-600 truncate mt-0.5">
                    {track.album}
                  </p>
                )}
              </div>

              {/* PLAY BUTTON / STATUS */}
              <div className="flex-shrink-0 p-2">
                {loadingTrackId === track.id ? (
                  <Loader2 
                    className="animate-spin" 
                    size={20} 
                    style={{ color: themeColor }} 
                  />
                ) : isCurrentTrack(track.id) ? (
                  <CheckCircle 
                    size={20} 
                    style={{ color: themeColor }}
                    fill="currentColor"
                  />
                ) : (
                  <Play 
                    size={20} 
                    style={{ color: themeColor }} 
                    fill="currentColor" 
                    className="opacity-0 group-hover:opacity-100 transition-opacity" 
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ESTADO VAZIO */}
      {!loading && query && results.length === 0 && (
        <div className="flex flex-col items-center justify-center p-16 text-center">
          <AlertCircle size={48} className="text-zinc-600 mb-4" />
          <p className="text-zinc-500 text-sm">
            Nenhum resultado encontrado para <strong>"{query}"</strong>
          </p>
          <p className="text-zinc-600 text-xs mt-2">
            Tente usar termos diferentes
          </p>
        </div>
      )}

      {/* PLACEHOLDER INICIAL */}
      {!loading && !query && results.length === 0 && (
        <div className="flex flex-col items-center justify-center p-16 text-center">
          <SearchIcon size={48} className="text-zinc-700 mb-4" />
          <p className="text-zinc-500 text-sm">
            Pesquise por músicas ou artistas
          </p>
          <p className="text-zinc-600 text-xs mt-2">
            Experimente: "The Weeknd", "Billie Eilish", etc.
          </p>
        </div>
      )}
    </div>
  );
}
