"use client";
import { useState } from "react";
import { Search as SearchIcon, Loader2, Music, Globe } from "lucide-react";
import { useXalanify } from "@/context/XalanifyContext";
import { searchMusic, getYoutubeId } from "@/lib/musicApi"; 
import TrackOptions from "@/components/TrackOptions";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFetchingId, setIsFetchingId] = useState<string | null>(null);
  const { setSearchResults, searchResults, setCurrentTrack, setIsPlaying, themeColor, currentTrack, addLog } = useXalanify();

  const handleSearch = async (e?: React.FormEvent, targetQuery?: string) => {
    if (e) e.preventDefault();
    const q = targetQuery || query;
    if (!q.trim()) return;
    setLoading(true);
    if (targetQuery) setQuery(targetQuery);
    try {
      const tracks = await searchMusic(q); 
      setSearchResults(tracks);
    } catch (err) {
      addLog("Erro na busca");
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = async (track: any) => {
    if (track.youtubeId) {
      setCurrentTrack(track);
      setIsPlaying(true);
      return;
    }
    setIsFetchingId(track.id);
    try {
      const ytId = await getYoutubeId(track.title, track.artist);
      if (ytId) {
        setCurrentTrack({ ...track, youtubeId: ytId });
        setIsPlaying(true);
      }
    } catch (err) {
      addLog("Erro ao obter áudio");
    } finally {
      setIsFetchingId(null);
    }
  };

  return (
    <div className="p-6 pt-12 animate-app-entry">
      <form onSubmit={handleSearch} className="relative mb-12">
        <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 opacity-20" size={20} />
        <input 
          value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder="O que queres ouvir?"
          className="w-full bg-white/5 border border-white/5 p-6 pl-16 rounded-[2.5rem] outline-none font-bold text-lg"
        />
        {loading && <Loader2 className="absolute right-6 top-1/2 -translate-y-1/2 animate-spin opacity-20" size={20} />}
      </form>

      {searchResults.length > 0 ? (
        <div className="space-y-2">
          {searchResults.map((track) => (
            <div key={track.id} className="flex items-center justify-between group">
              <div onClick={() => handlePlay(track)} className="flex-1 flex items-center gap-4 p-3 hover:bg-white/5 rounded-[2rem] cursor-pointer">
                <div className="relative">
                  <img src={track.thumbnail} className="w-14 h-14 rounded-2xl object-cover" alt="" />
                  {isFetchingId === track.id && (
                    <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center"><Loader2 className="animate-spin text-white" size={20} /></div>
                  )}
                  {currentTrack?.id === track.id && !isFetchingId && (
                    <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center"><Music size={20} style={{ color: themeColor }} className="animate-pulse" /></div>
                  )}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-bold truncate" style={{ color: currentTrack?.id === track.id ? themeColor : 'white' }}>{track.title}</p>
                  <p className="text-[10px] opacity-40 font-black uppercase tracking-tighter">{track.artist}</p>
                </div>
              </div>
              <TrackOptions track={track} />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {["Rap", "Phonk", "Lofi", "Pop"].map(tag => (
            <div key={tag} onClick={() => handleSearch(undefined, tag)} className="glass p-8 rounded-[2.5rem] hover:scale-105 transition-all cursor-pointer border-white/5 group">
              <Globe size={20} style={{color: themeColor}} className="mb-4 opacity-40 group-hover:opacity-100" />
              <p className="font-black text-xs uppercase tracking-widest">{tag}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}