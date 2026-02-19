"use client";
import React from "react";
import { Search, Loader2, Play, Heart } from "lucide-react";
import { useXalanify } from "@/context/XalanifyContext";
import TrackOptionsMenu from "@/components/TrackOptions";
import { getYoutubeId } from "@/lib/musicApi";

export default function SearchPage() {
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    searchSpotify,
    isSearching,
    setCurrentTrack,
    setIsPlaying,
    setActiveQueue,
    likedTracks,
    toggleLike,
    themeColor
  } = useXalanify();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      await searchSpotify(searchQuery);
    }
  };

  const handlePlayTrack = async (track: typeof searchResults[0]) => {
    try {
      // 1. Obter o ID do YouTube
      const yId = await getYoutubeId(track.title, track.artist);
      
      // 2. Criar o objeto compatível com o tipo 'Track'
      // Usamos 'undefined' em vez de 'null' para satisfazer o TypeScript
      const trackWithAudio = { 
        ...track, 
        youtubeId: yId || undefined,
        audioUrl: yId ? `https://www.youtube.com/watch?v=${yId}` : undefined
      };
      
      // 3. Atualizar o estado global (Contexto)
      setCurrentTrack(trackWithAudio);
      setActiveQueue(searchResults);
      setIsPlaying(true);
    } catch (error) {
      console.error("Erro ao reproduzir faixa:", error);
    }
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-[#2a1a2a] to-[#1a0f1a] rounded-3xl p-6 border border-white/10 flex flex-col overflow-hidden">
      <h1 className="text-4xl font-black mb-6">Procurar</h1>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Procurar música, artista..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-white/20 focus:bg-white/10 transition"
          />
        </div>
      </form>

      <div className="flex-1 overflow-y-auto custom-scroll space-y-3">
        {isSearching ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="animate-spin text-white/40" size={32} />
          </div>
        ) : searchResults.length > 0 ? (
          searchResults.map((track) => {
            const isLiked = likedTracks.some(t => t.id === track.id);
            return (
              <div
                key={track.id}
                className="p-3 bg-white/5 rounded-2xl flex items-center gap-4 hover:bg-white/10 transition group"
              >
                <img
                  src={track.thumbnail}
                  alt={track.title}
                  className="w-14 h-14 rounded-lg object-cover cursor-pointer hover:scale-110 transition"
                  onClick={() => handlePlayTrack(track)}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate group-hover:text-white/80">
                    {track.title}
                  </p>
                  <p className="text-xs text-white/50 truncate">{track.artist}</p>
                </div>
                <button
                  onClick={() => handlePlayTrack(track)}
                  className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition opacity-0 group-hover:opacity-100"
                >
                  <Play size={16} fill="white" className="text-white" />
                </button>
                <button
                  onClick={() => toggleLike(track)}
                  className="p-2 hover:bg-white/10 rounded-lg transition"
                >
                  <Heart
                    size={16}
                    fill={isLiked ? themeColor : "none"}
                    color={isLiked ? themeColor : "white"}
                    className="text-white/60"
                  />
                </button>
                <TrackOptionsMenu track={track} />
              </div>
            );
          })
        ) : (
          <div className="flex items-center justify-center h-40 text-white/40">
            <p className="text-sm">Pesquisa uma música para começar</p>
          </div>
        )}
      </div>
    </div>
  );
}