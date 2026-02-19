"use client";
import { useState } from "react";
import { Search, Loader2, Music, Play } from "lucide-react";
import { useXalanify, Track } from "@/context/XalanifyContext";
import TrackOptions from "@/components/TrackOptions";
import { searchMusic } from "@/lib/musicApi";

export default function SearchPage() {
  const { searchResults, setSearchResults, setCurrentTrack, setIsPlaying, themeColor, setActiveQueue } = useXalanify();
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    const results = await searchMusic(query);
    setSearchResults(results);
    setLoading(false);
  };

  return (
    <div className="p-8 pt-16 animate-in fade-in duration-500 pb-40">
      <h1 className="text-5xl font-black mb-10 tracking-tighter italic bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">
        Procurar
      </h1>
      
      <form onSubmit={handleSearch} className="relative mb-12 group">
        <Search className={`absolute left-6 top-1/2 -translate-y-1/2 transition-colors duration-300 ${query ? 'text-white' : 'opacity-20'}`} size={22} />
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="O que queres ouvir hoje?" 
          className="w-full bg-white/5 border border-white/10 rounded-[2.5rem] py-6 pl-16 pr-16 text-lg focus:bg-white/10 focus:border-white/20 outline-none transition-all font-medium placeholder:text-white/20 shadow-2xl"
        />
        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center">
          {loading ? (
            <Loader2 className="animate-spin text-blue-500" size={22} />
          ) : query && (
            <button type="submit" className="p-2 bg-white rounded-full text-black hover:scale-110 active:scale-95 transition-all">
              <Play size={16} fill="black" />
            </button>
          )}
        </div>
      </form>

      <div className="space-y-4">
        {searchResults.map((t: Track) => (
          <div 
            key={t.id} 
            className="flex items-center gap-5 glass p-3 pr-6 rounded-[2rem] border border-white/5 group hover:bg-white/10 transition-all hover:translate-x-1"
          >
            <div className="flex-1 flex items-center gap-5 cursor-pointer" 
                 onClick={() => { setCurrentTrack(t); setIsPlaying(true); setActiveQueue(searchResults); }}>
              <div className="relative w-16 h-16 shrink-0">
                <img src={t.thumbnail} className="w-full h-full rounded-[1.2rem] object-cover shadow-2xl" alt={t.title} />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-[1.2rem] transition-opacity">
                  <Play size={20} fill="white" />
                </div>
              </div>
              <div className="min-w-0">
                <p className="font-bold text-base italic truncate group-hover:text-blue-400 transition-colors">{t.title}</p>
                <p className="text-[10px] opacity-40 uppercase font-black tracking-widest mt-1">{t.artist}</p>
              </div>
            </div>
            <TrackOptions track={t} />
          </div>
        ))}
        
        {searchResults.length === 0 && !loading && (
          <div className="text-center py-32 flex flex-col items-center">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
              <Music size={40} className="opacity-20" />
            </div>
            <p className="text-white/20 font-medium italic">Encontra a tua música favorita...</p>
          </div>
        )}
      </div>
    </div>
  );
}