"use client";
import { useState } from "react";
import { Search as SearchIcon, Play, Loader2, CheckCircle, PlusCircle, ListMusic } from "lucide-react";
import { useXalanify } from "@/context/XalanifyContext";
import { searchMusic } from "@/lib/musicApi"; 
import TrackOptions from "@/components/TrackOptions";

export default function Search() {
  const { 
    persistentResults, setPersistentResults, 
    persistentQuery, setPersistentQuery,
    setCurrentTrack, setIsPlaying, themeColor, currentTrack, setSearchResults, createPlaylist 
  } = useXalanify();

  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!persistentQuery.trim()) return;
    setLoading(true);
    try {
      const tracks = await searchMusic(persistentQuery); 
      setPersistentResults(tracks);
      setSearchResults(tracks);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <h1 className="text-4xl font-black italic">Pesquisa</h1>
      
      <form onSubmit={handleSearch} className="relative">
        <input 
          value={persistentQuery} 
          onChange={(e) => setPersistentQuery(e.target.value)}
          placeholder="O que queres ouvir?" 
          className="w-full bg-zinc-900 border border-white/5 p-5 pl-14 rounded-[2rem] outline-none focus:border-white/20 transition-all text-sm font-bold"
        />
        <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" size={22} />
        {loading && <Loader2 className="absolute right-5 top-1/2 -translate-y-1/2 animate-spin text-zinc-500" size={20} />}
      </form>

      <div className="space-y-4">
        {persistentResults.map((track) => (
          <div key={track.id} className="flex items-center justify-between p-3 hover:bg-white/5 rounded-[1.8rem] transition-all group">
            <div onClick={() => { setCurrentTrack(track); setIsPlaying(true); }} className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer">
              <img src={track.thumbnail} className="w-14 h-14 rounded-2xl object-cover shadow-md" alt="" />
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

      {persistentResults.length > 0 && (
        <div className="pt-6 space-y-4">
          <p className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] px-2">Playlists Recomendadas</p>
          <div className="bg-zinc-900/40 p-5 rounded-[2.5rem] border border-white/5 flex items-center justify-between group hover:bg-zinc-900/60 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-zinc-800 rounded-3xl flex items-center justify-center relative overflow-hidden">
                 <img src={persistentResults[0].thumbnail} className="absolute inset-0 object-cover opacity-30 blur-sm" />
                 <ListMusic size={30} className="relative z-10" />
              </div>
              <div>
                <p className="font-bold">Mix: {persistentResults[0].artist}</p>
                <p className="text-[10px] text-zinc-500 font-black uppercase">Criada para ti</p>
              </div>
            </div>
            <button 
              onClick={() => createPlaylist(`Mix: ${persistentResults[0].artist}`, persistentResults.slice(0, 10), persistentResults[0].thumbnail)}
              className="p-3 bg-white/5 rounded-full hover:scale-110 transition-transform active:scale-90"
            >
              <PlusCircle size={24} style={{ color: themeColor }} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}