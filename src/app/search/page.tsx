"use client";
import { useState } from "react";
import { Search as SearchIcon, Play, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { useXalanify } from "@/context/XalanifyContext";
import { searchMusic, getDirectAudio, getYoutubeId } from "@/lib/musicApi"; 

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTrackId, setLoadingTrackId] = useState<string | null>(null);
  
  // Importamos o audioEngine para saber qual motor usar
  const { setCurrentTrack, setIsPlaying, themeColor, currentTrack, audioEngine } = useXalanify();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const tracks = await searchMusic(query); 
      setResults(tracks);
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
      let trackToPlay = { ...track, isLocal: false };

      // LÓGICA HÍBRIDA BASEADA NAS DEFINIÇÕES
      if (audioEngine === 'direct') {
        console.log("Modo Musify: Extraindo áudio direto...");
        const audioUrl = await getDirectAudio(track.title, track.artist);
        if (audioUrl) {
          trackToPlay.audioUrl = audioUrl;
          trackToPlay.youtubeId = undefined;
        } else {
          throw new Error("Falha no Direct Audio");
        }
      } else {
        console.log("Modo YouTube: Procurando ID do vídeo...");
        const ytId = await getYoutubeId(track.title, track.artist);
        if (ytId) {
          trackToPlay.youtubeId = ytId;
          trackToPlay.audioUrl = undefined;
        } else {
          throw new Error("Falha no YouTube ID");
        }
      }

      setCurrentTrack(trackToPlay);
      
      // Pequeno delay para o Player (YouTube ou Nativo) carregar o novo src
      setTimeout(() => {
        setIsPlaying(true);
      }, 400);

    } catch (error) {
      console.error("Erro ao carregar áudio:", error);
      alert("O motor selecionado falhou. Tente mudar o 'Motor de Áudio' nas Definições.");
    } finally {
      setLoadingTrackId(null);
    }
  };

  const isCurrentTrack = (trackId: string) => currentTrack?.id === trackId;

  return (
    <div className="space-y-6 pb-40 px-4">
      {/* BARRA DE PESQUISA */}
      <form onSubmit={handleSearch} className="relative mt-4">
        <input
          type="text"
          placeholder="Pesquisar músicas ou artistas..."
          className="w-full bg-[#1c1c1e] text-white py-4 pl-12 pr-4 rounded-2xl outline-none focus:ring-2 placeholder:text-zinc-500 transition-all"
          style={{ 
            boxShadow: `0 0 0 2px ${themeColor}20`,
            border: `1px solid ${themeColor}40`
          }}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
      </form>

      {/* FEEDBACK DE CARREGAMENTO */}
      {loading && (
        <div className="flex flex-col items-center justify-center p-20">
          <Loader2 className="animate-spin mb-4" style={{ color: themeColor }} size={40} />
          <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">A procurar...</p>
        </div>
      )}

      {/* LISTA DE RESULTADOS */}
      {!loading && results.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] px-2 mb-4">
            {results.length} Sugestões encontradas
          </p>
          
          {results.map((track) => (
            <div 
              key={track.id} 
              onClick={() => playTrack(track)}
              className={`flex items-center gap-4 p-3 rounded-[1.8rem] cursor-pointer transition-all active:scale-[0.97] group ${isCurrentTrack(track.id) ? 'bg-white/10' : 'hover:bg-white/5'}`}
            >
              <div className="relative flex-shrink-0">
                <img src={track.thumbnail} className="w-14 h-14 rounded-[1.2rem] object-cover shadow-lg" alt="" />
                {loadingTrackId === track.id && (
                  <div className="absolute inset-0 bg-black/70 rounded-[1.2rem] flex items-center justify-center">
                    <Loader2 className="animate-spin text-white" size={20} />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 text-left">
                <p className="text-[15px] font-bold text-white truncate leading-tight">{track.title}</p>
                <p className="text-[11px] text-zinc-500 truncate mt-1 uppercase font-black tracking-tighter italic">{track.artist}</p>
              </div>

              <div className="flex-shrink-0 pr-2">
                {isCurrentTrack(track.id) ? (
                  <CheckCircle size={22} style={{ color: themeColor }} fill="currentColor" />
                ) : (
                  <Play size={22} style={{ color: themeColor }} fill="currentColor" className="opacity-30 group-hover:opacity-100 transition-opacity" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ESTADO VAZIO */}
      {!loading && query && results.length === 0 && (
        <div className="flex flex-col items-center justify-center p-16 text-center">
          <AlertCircle size={40} className="text-zinc-700 mb-4" />
          <p className="text-zinc-500 text-sm font-medium">Não encontrámos resultados para "{query}"</p>
        </div>
      )}
    </div>
  );
}