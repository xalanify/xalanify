"use client";
import { useState } from "react";
import { Search, Loader2, Music } from "lucide-react";
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
    <div className="p-8 pt-16 animate-in fade-in">
      <h1 className="text-5xl font-black mb-10 tracking-tighter italic">Procurar</h1>
      
      <form onSubmit={handleSearch} className="relative mb-12 group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 opacity-20" size={22} />
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="O que queres ouvir hoje?" 
          className="w-full bg-white/5 border border-white/5 rounded-[2.5rem] py-6 pl-16 pr-8 text-base focus:bg-white/10 outline-none transition-all font-medium"
        />
        {loading && <Loader2 className="absolute right-6 top-1/2 -translate-y-1/2 animate-spin text-blue-500" size={22} />}
      </form>

      <div className="space-y-4">
        {searchResults.map((t: Track) => (
          <div key={t.id} className="flex items-center gap-5 glass p-4 rounded-[2.5rem] border-white/5 group hover:bg-white/10 transition-all">
            <div className="flex-1 flex items-center gap-5 cursor-pointer" onClick={() => { setCurrentTrack(t); setIsPlaying(true); setActiveQueue(searchResults); }}>
              <img src={t.thumbnail} className="w-16 h-16 rounded-[1.5rem] object-cover shadow-2xl" />
              <div>
                <p className="font-bold text-sm italic group-hover:text-blue-400 transition-colors">{t.title}</p>
                <p className="text-[10px] opacity-40 uppercase font-black tracking-tighter">{t.artist}</p>
              </div>
            </div>
            <TrackOptions track={t} />
          </div>
        ))}
        
        {searchResults.length === 0 && !loading && (
          <div className="text-center py-32 opacity-10">
            <Music size={80} className="mx-auto mb-6" />
          
          </div>
        )}
      </div>
    </div>
  );
}