"use client";
import { useState } from "react";
import { Search as SearchIcon, Play, Loader2, Music } from "lucide-react";
import { useXalanify } from "@/context/XalanifyContext";
import { searchMusic, getYoutubeId } from "@/lib/musicApi"; 
import TrackOptions from "./TrackOptions";

export default function Search() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFetchingId, setIsFetchingId] = useState<string | null>(null);
  
  const { 
    setSearchResults, 
    searchResults,
    setCurrentTrack, 
    setIsPlaying, 
    themeColor, 
    currentTrack 
  } = useXalanify();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    const tracks = await searchMusic(query); 
    setSearchResults(tracks);
    setLoading(false);
  };

  const playTrack = async (track: any) => {
    if (isFetchingId) return;
    setIsFetchingId(track.id);
    setIsPlaying(false);
    
    try {
      // Busca sempre o ID do YouTube agora
      const ytId = await getYoutubeId(track.title, track.artist);
      if (ytId) {
        setCurrentTrack({ ...track, youtubeId: ytId });
        setTimeout(() => setIsPlaying(true), 400);
      }
    } catch (err) {
      console.error("Erro ao obter áudio:", err);
    } finally {
      setIsFetchingId(null);
    }
  };

  return (
    <div className="p-6 pb-40">
      <h1 className="text-4xl font-black italic mb-6">Procurar</h1>
      
      <form onSubmit={handleSearch} className="relative mb-8">
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Artistas ou músicas..." 
          className="w-full bg-zinc-900 border border-white/5 p-5 pl-14 rounded-[2rem] outline-none focus:border-white/20 transition-all font-bold text-sm"
        />
        <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
      </form>

      <div className="space-y-3">
        {loading ? (
          <div className="flex flex-col items-center py-20 gap-4 opacity-20">
            <Loader2 className="animate-spin" size={32} />
            <p className="text-[10px] font-black uppercase tracking-widest">A procurar no arquivo...</p>
          </div>
        ) : searchResults.length > 0 ? (
          searchResults.map((track) => (
            <div 
              key={track.id} 
              className="flex items-center justify-between p-3 hover:bg-white/5 rounded-[2.2rem] transition-all group"
            >
              <div onClick={() => playTrack(track)} className="flex items-center gap-4 flex-1 cursor-pointer overflow-hidden">
                <div className="relative flex-shrink-0">
                  <img src={track.thumbnail} className="w-14 h-14 rounded-2xl object-cover shadow-lg" alt="" />
                  {isFetchingId === track.id && (
                    <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center">
                      <Loader2 className="animate-spin text-white" size={20} />
                    </div>
                  )}
                </div>
                <div className="truncate">
                  <p className="text-sm font-bold truncate" style={{ color: currentTrack?.id === track.id ? themeColor : 'white' }}>
                    {track.title}
                  </p>
                  <p className="text-[10px] text-zinc-500 font-black uppercase tracking-tighter mt-0.5">{track.artist}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                 <TrackOptions track={track} />
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 opacity-20">
            <Music size={48} className="mx-auto mb-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Explora a música</p>
          </div>
        )}
      </div>
    </div>
  );
}