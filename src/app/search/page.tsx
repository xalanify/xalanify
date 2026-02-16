"use client";
import { useState } from "react";
import { Search as SearchIcon, Loader2 } from "lucide-react";
import { searchMusic, getYoutubeId } from "@/lib/musicApi";
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
      const results = await searchMusic(query);
      setSearchResults(results);
    } catch (error) { console.error(error); } finally { setLoading(false); }
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
      <h1 className="text-5xl font-black mb-8 tracking-tighter italic">Explorar</h1>
      <form onSubmit={handleSearch} className="relative mb-10">
        <input
          type="text" value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder="Pesquisar..."
          className="w-full bg-white/5 border border-white/10 p-6 rounded-[2.5rem] pl-14 outline-none focus:ring-2 transition-all font-bold"
          style={{ '--tw-ring-color': themeColor } as any}
        />
        <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 opacity-20" size={20} />
        {loading && <Loader2 className="absolute right-6 top-1/2 -translate-y-1/2 animate-spin" size={20} style={{ color: themeColor }} />}
      </form>

      <div className="space-y-3">
        {searchResults.map((track) => (
          <div key={track.id} onClick={() => playTrack(track)} className="glass p-3 rounded-[2rem] flex items-center gap-4 border border-white/5 active:scale-95 transition-all">
            <img src={track.thumbnail} className="w-14 h-14 rounded-2xl object-cover" alt="" />
            <div className="flex-1 overflow-hidden">
              <p className="font-bold truncate text-sm">{track.title}</p>
              <p className="text-[10px] font-black opacity-40 uppercase tracking-widest truncate">{track.artist}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}