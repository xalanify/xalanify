"use client";
import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { useXalanify, Track } from "@/context/XalanifyContext";
import TrackOptions from "@/components/TrackOptions";
import { searchMusic } from "@/lib/musicApi";

export default function SearchPage() {
  const { searchResults, setSearchResults, setCurrentTrack, setIsPlaying, themeColor, setActiveQueue } = useXalanify();
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    const results = await searchMusic(query);
    setSearchResults(results);
    setLoading(false);
  };

  return (
    <div className="p-6 pt-12 animate-in fade-in">
      <h1 className="text-4xl font-bold mb-8 tracking-tighter text-white">Procurar</h1>
      
      <form onSubmit={handleSearch} className="relative mb-10 group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 opacity-30" size={20} />
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="O que queres ouvir?" 
          className="w-full bg-white/5 border border-white/10 rounded-3xl py-5 pl-14 pr-6 text-sm focus:bg-white/10 focus:outline-none transition-all"
        />
        {loading && <Loader2 className="absolute right-5 top-1/2 -translate-y-1/2 animate-spin opacity-50" size={20} />}
      </form>

      <div className="space-y-4">
        {searchResults.map((t: Track) => (
          <div key={t.id} className="flex items-center gap-4 glass p-3 rounded-[2rem] border-white/5 group hover:bg-white/5 transition-all">
            <div className="flex-1 flex items-center gap-4 cursor-pointer" onClick={() => { setCurrentTrack(t); setIsPlaying(true); setActiveQueue(searchResults); }}>
              <img src={t.thumbnail} className="w-14 h-14 rounded-2xl object-cover shadow-lg" />
              <div>
                <p className="font-bold text-sm text-white italic">{t.title}</p>
                <p className="text-[10px] opacity-40 uppercase font-black text-white tracking-tighter">{t.artist}</p>
              </div>
            </div>
            <TrackOptions track={t} />
          </div>
        ))}
      </div>
    </div>
  );
}