"use client";
import { useState } from "react";
import { Search as SearchIcon, Loader2, Play, Music, ListMusic } from "lucide-react";
import { searchMusic, getYoutubeId } from "@/lib/musicApi"; // Usa a lógica do Spotify
import { useXalanify, Track } from "@/context/XalanifyContext";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const { setSearchResults, searchResults, setCurrentTrack, themeColor, setActiveQueue } = useXalanify();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      // Obtém tracks do Spotify com capas de alta qualidade
      const results = await searchMusic(query);
      setSearchResults(results);
    } catch (error) {
      console.error("Erro na pesquisa:", error);
    } finally {
      setLoading(false);
    }
  };

  const playTrack = async (track: Track) => {
    const ytId = await getYoutubeId(track.title, track.artist);
    if (ytId) {
      const updatedTrack = { ...track, youtubeId: ytId };
      setActiveQueue([updatedTrack]);
      setCurrentTrack(updatedTrack);
    }
  };

  return (
    <div className="p-8 pb-40 animate-app-entry font-jakarta">
      <h1 className="text-5xl font-black mb-8 tracking-tighter">Explorar</h1>
      
      <form onSubmit={handleSearch} className="relative mb-10">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Artistas, músicas ou playlists..."
          className="w-full bg-white/5 border border-white/10 p-6 rounded-[2rem] pl-14 outline-none focus:ring-2 transition-all font-bold text-white placeholder:opacity-20"
          style={{ '--tw-ring-color': themeColor } as any}
        />
        <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 opacity-20" size={20} />
        {loading && <Loader2 className="absolute right-6 top-1/2 -translate-y-1/2 animate-spin text-white/20" size={20} />}
      </form>

      <div className="space-y-4">
        {searchResults.map((track) => (
          <div 
            key={track.id} 
            onClick={() => playTrack(track)}
            className="glass p-3 rounded-[2rem] flex items-center gap-4 hover:bg-white/5 transition-all cursor-pointer group border border-white/5"
          >
            <div className="relative w-16 h-16 shrink-0">
              <img src={track.thumbnail} className="w-full h-full rounded-2xl object-cover shadow-lg" alt="" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                <Play size={24} fill="white" className="text-white" />
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="font-bold truncate text-sm">{track.title}</p>
              <p className="text-[10px] font-black opacity-40 uppercase tracking-widest truncate">{track.artist}</p>
            </div>
            <div className="pr-4 opacity-20">
               {track.title.toLowerCase().includes('playlist') ? <ListMusic size={18} /> : <Music size={18} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}