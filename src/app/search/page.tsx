"use client";
import { Search, Play } from "lucide-react";
import { useXalanify } from "@/context/XalanifyContext";
import { getYoutubeId } from "@/lib/musicApi";

export default function SearchPage() {
  const { searchQuery, setSearchQuery, searchResults, searchSpotify, isSearching, setCurrentTrack, setIsPlaying, setActiveQueue } = useXalanify();

  const handlePlay = async (track: any) => {
    const yId = await getYoutubeId(track.title, track.artist);
    setCurrentTrack({ ...track, youtubeId: yId || undefined });
    setActiveQueue(searchResults);
    setIsPlaying(true);
  };

  return (
    <div className="max-w-6xl mx-auto pt-8">
      <h1 className="text-4xl font-black mb-8">Procurar</h1>
      <form onSubmit={(e) => { e.preventDefault(); searchSpotify(searchQuery); }} className="relative mb-10">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
        <input 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white/5 border border-white/10 py-4 pl-12 pr-4 rounded-2xl outline-none focus:border-white/20" 
          placeholder="O que queres ouvir?"
        />
      </form>

      <div className="grid gap-2">
        {searchResults.map((track) => (
          <div key={track.id} className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-xl group transition">
            <img src={track.thumbnail} className="w-12 h-12 rounded-lg" alt="" />
            <div className="flex-1">
              <p className="font-bold text-sm">{track.title}</p>
              <p className="text-xs text-white/50">{track.artist}</p>
            </div>
            <button onClick={() => handlePlay(track)} className="p-3 bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition">
              <Play size={16} fill="white" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}