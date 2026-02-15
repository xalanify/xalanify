"use client";
import { useState } from "react";
import { Search as SearchIcon, Play, Loader2, CheckCircle } from "lucide-react";
import { useXalanify } from "@/context/XalanifyContext";
import { searchMusic, getDirectAudio, getYoutubeId } from "@/lib/musicApi"; 
import TrackOptions from "@/components/TrackOptions";

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const { setCurrentTrack, setIsPlaying, themeColor, currentTrack, audioEngine, setSearchResults } = useXalanify();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const tracks = await searchMusic(query); 
      setResults(tracks);
      setSearchResults(tracks); // Sincroniza a fila com o contexto
    } catch (err) {
      console.error("Erro na busca:", err);
    }
    setLoading(false);
  };

  const playTrack = async (track: any) => {
    if (loadingId) return;
    setLoadingId(track.id);
    setIsPlaying(false);
    
    try {
      let trackToPlay = { ...track, isLocal: false, youtubeId: undefined, audioUrl: undefined };
      
      if (audioEngine === 'direct') {
        const url = await getDirectAudio(track.title, track.artist);
        if (url) trackToPlay.audioUrl = url;
        else {
          const ytId = await getYoutubeId(track.title, track.artist);
          trackToPlay.youtubeId = ytId || undefined;
        }
      } else {
        const ytId = await getYoutubeId(track.title, track.artist);
        trackToPlay.youtubeId = ytId || undefined;
      }

      setCurrentTrack(trackToPlay);
      setTimeout(() => setIsPlaying(true), 400);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="p-4 space-y-6 pb-40">
      <form onSubmit={handleSearch} className="relative mt-4">
        <input
          value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder="Pesquisar músicas..."
          className="w-full bg-zinc-900/50 border border-white/10 p-4 pl-12 rounded-2xl outline-none focus:ring-2"
          style={{ borderColor: `${themeColor}40` } as any}
        />
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
      </form>

      {loading && <Loader2 className="animate-spin mx-auto mt-10 text-zinc-500" />}

      <div className="space-y-2">
        {results.map((track) => (
          <div key={track.id} className="flex items-center justify-between p-3 hover:bg-white/5 rounded-[1.8rem] transition-all group">
            <div onClick={() => playTrack(track)} className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer">
              <div className="relative flex-shrink-0">
                <img src={track.thumbnail} className="w-14 h-14 rounded-2xl object-cover shadow-md" alt="" />
                {loadingId === track.id && (
                  <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center">
                    <Loader2 className="animate-spin text-white" size={18} />
                  </div>
                )}
              </div>
              <div className="flex-1 truncate">
                <p className="text-sm font-bold truncate pr-2">{track.title}</p>
                <p className="text-[10px] text-zinc-500 font-black uppercase mt-1 italic">{track.artist}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 pl-2">
              {currentTrack?.id === track.id ? (
                <CheckCircle size={16} style={{ color: themeColor }} />
              ) : (
                <Play size={16} className="text-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
              <TrackOptions track={track} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}