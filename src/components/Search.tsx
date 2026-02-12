"use client";
import { useState } from "react";
import { Search as SearchIcon, Play, Loader2 } from "lucide-react";
import { useXalanify } from "@/context/XalanifyContext";
// Certifica-te que tens esta função na tua API, senão avisa-me para enviar o mock
import { searchMusic } from "@/lib/musicApi"; 

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { setCurrentTrack, setIsPlaying } = useXalanify();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    try {
      // Simulação se não tiveres a API ligada ainda:
      // const tracks = [{id: 1, title: query, artist: "Teste", thumbnail: "https://placehold.co/100"}]
      const tracks = await searchMusic(query); 
      setResults(tracks);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6 pt-2">
      <h1 className="text-3xl font-bold px-2">Pesquisa</h1>
      
      {/* Barra de Pesquisa Estilo iOS */}
      <form onSubmit={handleSearch} className="relative mx-1">
        <input
          type="text"
          placeholder="Artistas, músicas ou álbuns..."
          className="w-full bg-[#1c1c1e] text-white py-3 pl-11 pr-4 rounded-xl outline-none focus:ring-2 focus:ring-[#a855f7]/50 placeholder:text-zinc-500 transition-all"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
      </form>

      {/* Resultados */}
      <div className="space-y-1 pb-20">
        {loading && <div className="flex justify-center p-8"><Loader2 className="animate-spin text-[#a855f7]" /></div>}
        
        {results.map((track) => (
          <div 
            key={track.id} 
            onClick={() => { setCurrentTrack(track); setIsPlaying(true); }}
            className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl active:bg-white/10 transition-colors cursor-pointer group"
          >
            {/* CORREÇÃO VISUAL: Imagem com tamanho fixo e flex-shrink-0 para não esmagar */}
            <img 
              src={track.thumbnail} 
              className="w-14 h-14 rounded-md object-cover flex-shrink-0 bg-zinc-800" 
              alt={track.title} 
            />
            
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <p className="text-[15px] font-medium text-white truncate leading-tight">{track.title}</p>
              <p className="text-[13px] text-zinc-400 truncate">{track.artist}</p>
            </div>
            
            <button className="p-3 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity">
               <Play size={20} fill="currentColor" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}